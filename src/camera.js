import { MotionGate, mapHand } from './access.js';
import {ui} from './languages.js';

// These are engineering minimums for a noise baseline, not a clinical accuracy test.
export function motionCalibrationThreshold(samples,elapsedMs){
  if(elapsedMs<3000||samples.length<20||!samples.every(Number.isFinite))return null;
  const sorted=[...samples].sort((a,b)=>a-b);
  return Math.min(40,Math.max(2,sorted[Math.floor(sorted.length*.95)]*2.5+1));
}

export class CameraInput {
  constructor({ status, point, select, meter, finger = () => {}, calibrated = () => {} }) {
    Object.assign(this,{status,point,select,meter,finger,onCalibrated:calibrated});
    this.gate = new MotionGate(); this.running = false; this.generation = 0;
    this.video = document.createElement('video'); this.video.autoplay = true; this.video.muted = true; this.video.playsInline = true;
    this.canvas = document.createElement('canvas'); this.canvas.width = 64; this.canvas.height = 48;
    this.ctx = this.canvas.getContext('2d',{willReadFrequently:true});
  }
  async start(mode, settings) {
    this.stop(); const generation = this.generation; this.mode = mode; this.settings = settings;
    this.status(ui('cameraPermission',settings.language));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480},facingMode:'user'},audio:false});
      if (generation !== this.generation) { stream.getTracks().forEach(t=>t.stop()); return; }
      this.stream = stream; this.video.srcObject = stream; await this.video.play();
      if (generation !== this.generation) return;
      if (mode === 'hand') {
        this.status(ui('cameraPreparing',settings.language));
        const {FilesetResolver,HandLandmarker} = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks('/tracking');
        const model = await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:'/tracking/hand_landmarker.task'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:0.65,minHandPresenceConfidence:0.65,minTrackingConfidence:0.65});
        if (generation !== this.generation) { model.close(); return; }
        this.model = model;
      }
      this.running = true; this.previous = null; this.origin = null; this.smooth = null; this.last = 0; this.lastVideoTime = -1; this.lastFrameAt = performance.now();
      this.status(ui(mode==='hand'?'cameraShowHand':'cameraPlaceFinger',settings.language));
      this.tick();
    } catch(error) {
      if (generation !== this.generation) return;
      this.stop(); this.status(ui(error.name==='NotAllowedError'?'cameraDenied':error.name==='NotFoundError'?'cameraMissing':'cameraStartFailed',settings.language));
    }
  }
  resetHandReference() {
    this.origin=null;this.smooth=null;this.clearHandSample();
  }
  clearHandSample() {
    this.lastPoint=null;this.lastSeen=0;this.point(null);this.finger(null);
  }
  finishMotionCalibration(threshold){
    threshold=Math.round(threshold*2)/2;
    this.calibratingUntil=0;this.calibrated=false;this.gate.reset();
    if(this.onCalibrated(threshold)===false){this.status(ui('saveFailed',this.settings.language));return false;}
    this.settings.threshold=threshold;this.calibrated=true;this.status(ui('cameraNoiseReady',this.settings.language));return true;
  }
  calibrate() {
    if (!this.running) return false;
    if (this.mode === 'hand') {
      if (!this.lastPoint || performance.now()-this.lastSeen > 300) { this.status(ui('cameraNoHand',this.settings.language)); return false; }
      this.origin = {...this.lastPoint}; this.smooth = null; this.status(ui('cameraRestSet',this.settings.language)); return true;
    }
    this.calibration = []; this.calibratingUntil = performance.now()+3000; this.gate.reset();
    this.status(ui('cameraKeepStill',this.settings.language)); return true;
  }
  tick = () => {
    if (!this.running) return;
    const now = performance.now();
    if (now-this.last >= 65 && this.video.readyState >= 2 && this.lastVideoTime !== this.video.currentTime) {
      this.last = now; this.lastVideoTime = this.video.currentTime; this.lastFrameAt = now;
      try {
        if (this.mode === 'hand') {
          const hand = this.model.detectForVideo(this.video,now).landmarks[0];
          if (hand) {
            this.lastPoint = hand[this.settings.finger]; this.lastSeen = now;
            this.finger(this.lastPoint);
            if (this.origin) {
              const target = mapHand(this.lastPoint,this.origin,this.settings.gain,innerWidth,innerHeight);
              this.smooth = this.smooth ? {x:this.smooth.x+(target.x-this.smooth.x)*0.3,y:this.smooth.y+(target.y-this.smooth.y)*0.3} : target;
              this.point(this.smooth);
            }
          } else { this.clearHandSample(); }
        } else {
          // Fixed central ROI avoids unrelated movement elsewhere in the frame.
          const w=this.video.videoWidth,h=this.video.videoHeight;
          this.ctx.drawImage(this.video,w*0.3,h*0.3,w*0.4,h*0.4,0,0,64,48);
          const data=this.ctx.getImageData(0,0,64,48).data;
          let score=0;
          if (this.previous) { for(let i=0;i<data.length;i+=4) score+=(Math.abs(data[i]-this.previous[i])+Math.abs(data[i+1]-this.previous[i+1])+Math.abs(data[i+2]-this.previous[i+2]))/3; score/=64*48; }
          this.previous=new Uint8ClampedArray(data); this.meter(score,this.settings.threshold);
          if (this.calibratingUntil) {
            this.calibration.push(score);
            const threshold=motionCalibrationThreshold(this.calibration,now-(this.calibratingUntil-3000));
            if (threshold!==null) {
              this.finishMotionCalibration(threshold);
            }
          } else if (this.calibrated&&this.gate.update(score,this.settings.threshold,now)) this.select();
        }
      } catch { this.stop(); this.status(ui('cameraTrackingError',this.settings.language)); return; }
    }
    if (now-this.lastFrameAt>4000) {this.stop();this.status(ui('cameraFramesStopped',this.settings.language));return;}
    if (this.mode === 'hand' && now-(this.lastSeen||0)>300) {this.point(null);this.finger(null);}
    this.frame=requestAnimationFrame(this.tick);
  };
  stop() {
    this.generation++; this.running=false; cancelAnimationFrame(this.frame);
    this.stream?.getTracks().forEach(t=>t.stop()); this.stream=null;
    this.video.srcObject=null; this.model?.close(); this.model=null;
    this.lastPoint=null; this.lastSeen=0; this.calibratingUntil=0;this.calibrated=false; this.gate.reset(); this.point(null);this.finger(null);
    this.video.remove();
  }
  park(){
    if(!this.running)return;
    this.video.classList.add('tracking-video');this.video.setAttribute('aria-hidden','true');
    if(this.video.parentElement!==document.body)document.body.append(this.video);
    this.video.play().catch(()=>{});
  }
  preview(container){
    this.video.classList.remove('tracking-video');container.prepend(this.video);this.video.play().catch(()=>{});
  }
}
