import {eyeFeatures,trainGaze,validationPass,goodCheck,steadySamples} from './gaze-math.js';
import {ui} from './languages.js';
const trainTargets=[[.5,.5],[.25,.25],[.75,.25],[.75,.75],[.25,.75]];
const checkTargets=[[.28,.28],[.72,.28],[.28,.72],[.72,.72]];
export class EyeInput{
  constructor({point,status,done}){Object.assign(this,{point,status,done});this.generation=0;this.running=false;this.ready=false;}
  text(key,n){return ui(key,this.language).replace('{n}',String(n));}
  async start(language='en'){
    this.stop();this.language=language;const generation=this.generation;
    const dialog=document.createElement('dialog');dialog.id='eye-calibration';dialog.setAttribute('aria-labelledby','eye-title');
    dialog.innerHTML=`<div class="eye-top"><strong id="eye-title">Set up eye control</strong><button id="eye-exit" class="secondary-button">Cancel / camera off</button></div><div class="eye-center"><h2>Look at the dots. Nothing to install.</h2><p id="eye-status" role="status">Allow the camera when your browser asks. Loading the eye model…</p><p id="eye-detail">Keep the screen and your head comfortably still. Use even lighting. Camera images stay on this device.</p><button id="eye-begin" class="primary-button" disabled>Start calibration</button><button id="eye-use" class="primary-button" hidden>Use eye control</button><button id="eye-retry" class="secondary-button" hidden>Try calibration again</button></div><video id="eye-preview" autoplay muted playsinline></video><div id="eye-dot" hidden aria-hidden="true"></div><div id="eye-progress" aria-live="polite"></div>`;
    document.body.append(dialog);this.dialog=dialog;dialog.showModal();
    const navigation=document.createElement('div');navigation.id='eye-scroll-controls';
    for(const [direction,key] of [[-1,'up'],[1,'down']]){const button=document.createElement('button');button.type='button';button.id='eye-scroll-'+key;button.className='secondary-button';button.textContent=(direction<0?'↑ ':'↓ ')+ui(key,language);button.onclick=()=>{const surface=dialog.querySelector('.eye-center');surface.scrollBy({top:direction*Math.max(100,surface.clientHeight*.6),behavior:'instant'});};navigation.append(button);}dialog.append(navigation);
    const pace=document.createElement('fieldset');pace.id='eye-pace-label';
    const legend=document.createElement('legend');legend.textContent=ui('eyePace',language);pace.append(legend);this.paceChoice='3000';
    for(const [value,key] of [['3000','eyeGentle'],['5000','eyeExtra'],['manual','eyeManual']]){
      const button=document.createElement('button');button.type='button';button.id='eye-pace-'+value;button.className='secondary-button';button.textContent=ui(key,language);button.setAttribute('aria-pressed',String(value===this.paceChoice));
      button.onclick=()=>{this.paceChoice=value;for(const choice of pace.querySelectorAll('button'))choice.setAttribute('aria-pressed',String(choice===button));};pace.append(button);
    }
    dialog.querySelector('#eye-begin').before(pace);
    const controls=document.createElement('div');controls.id='eye-step-controls';controls.hidden=true;controls.innerHTML='<button id="eye-collect" class="secondary-button" hidden>Ready — collect this point</button><button id="eye-redo" class="secondary-button">Redo this point</button><button id="eye-break" class="secondary-button">Take a break</button>';
    dialog.append(controls);
    dialog.querySelector('#eye-collect').onclick=()=>{this.settleUntil=performance.now()+800;dialog.querySelector('#eye-collect').hidden=true;};
    dialog.querySelector('#eye-redo').onclick=()=>{if(['train','check'].includes(this.phase))this.nextTarget();};
    dialog.querySelector('#eye-break').onclick=()=>{if(this.phase==='break'){this.phase=this.resumePhase;this.nextTarget();}else if(['train','check'].includes(this.phase)){this.resumePhase=this.phase;this.phase='break';dialog.querySelector('#eye-dot').hidden=true;dialog.querySelector('#eye-break').textContent=ui('resume',this.language);this.message(ui('eyeResting',this.language));}};
    this.message=text=>{const el=dialog.querySelector('#eye-status');if(el)el.textContent=text;this.status(text);};
    const cancel=()=>{this.stop();this.status(ui('eyeOff',this.language));this.done(false);};dialog.querySelector('#eye-exit').onclick=cancel;dialog.addEventListener('cancel',e=>{e.preventDefault();cancel();});
    dialog.querySelector('#eye-begin').onclick=()=>this.calibrate();dialog.querySelector('#eye-retry').onclick=()=>{
      this.pace=this.paceChoice;
      if(this.predict&&this.failedChecks?.length){this.phase='check';this.checkQueue=[...this.failedChecks];this.index=this.checkQueue.shift();this.collectingUI();this.nextTarget();}
      else this.calibrate();
    };
    const restart=document.createElement('button');restart.id='eye-restart-all';restart.className='secondary-button';restart.hidden=true;restart.textContent='Start over';restart.onclick=()=>this.calibrate();dialog.querySelector('#eye-retry').after(restart);
    for(const [id,key] of [['eye-title','eyeSetup'],['eye-exit','eyeCancel'],['eye-begin','eyeBegin'],['eye-use','eyeUse'],['eye-retry','eyeRetry'],['eye-collect','eyeCollect'],['eye-redo','eyeRedo'],['eye-break','eyeBreak'],['eye-restart-all','eyeRestart']])dialog.querySelector('#'+id).textContent=ui(key,language);
    dialog.lang=language;dialog.dir=language==='ar'?'rtl':'ltr';
    dialog.querySelector('h2').textContent=ui('eyeLook',language);
    dialog.querySelector('#eye-detail').textContent=ui('eyePosition',language);
    this.message(ui('eyeLoading',language));
    dialog.querySelector('#eye-use').onclick=()=>{this.ready=true;this.phase='ready';this.smooth=null;this.video.hidden=true;document.body.append(this.video);dialog.close();dialog.remove();this.dialog=null;this.done(true);};
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480},facingMode:'user'},audio:false});
      if(generation!==this.generation){stream.getTracks().forEach(t=>t.stop());return;}
      this.stream=stream;this.video=dialog.querySelector('video');this.video.srcObject=stream;await this.video.play();
      const {FilesetResolver,FaceLandmarker}=await import('@mediapipe/tasks-vision');
      const files=await FilesetResolver.forVisionTasks('/tracking');
      const model=await FaceLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'/tracking/face_landmarker.task'},runningMode:'VIDEO',numFaces:1,outputFaceBlendshapes:true,minFaceDetectionConfidence:.65,minFacePresenceConfidence:.65,minTrackingConfidence:.65});
      if(generation!==this.generation){model.close();return;}
      this.model=model;this.running=true;this.phase='idle';this.lastTime=-1;this.lastFrameAt=performance.now();this.lastTick=0;this.dimensions=[innerWidth,innerHeight];
      this.message(ui('eyeComfort',this.language));dialog.querySelector('#eye-begin').disabled=false;this.tick();
    }catch(error){if(generation!==this.generation)return;this.release();this.message(error.name==='NotAllowedError'?ui('cameraDenied',this.language):error.name==='NotFoundError'?ui('cameraMissing',this.language):ui('eyeStartFailed',this.language));}
  }
  calibrate(){
    if(!this.running)return;
    this.ready=false;this.samples=[];this.checks=[];this.predict=null;this.index=0;this.phase='train';this.smooth=null;this.failedChecks=null;this.checkQueue=null;this.pace=this.paceChoice;
    this.collectingUI();
    this.video.hidden=true;this.nextTarget();
  }
  collectingUI(){for(const id of ['eye-begin','eye-use','eye-retry','eye-restart-all','eye-pace-label'])this.dialog.querySelector('#'+id).hidden=true;this.dialog.querySelector('.eye-center').classList.add('collecting');this.dialog.querySelector('#eye-step-controls').hidden=false;}
  nextTarget(){
    this.target=(this.phase==='train'?trainTargets:checkTargets)[this.index];this.batch=[];this.settleUntil=this.pace==='manual'?Infinity:performance.now()+Number(this.pace);
    this.dialog.querySelector('#eye-collect').hidden=this.pace!=='manual';this.dialog.querySelector('#eye-break').textContent=ui('eyeBreak',this.language);
    const dot=this.dialog.querySelector('#eye-dot');dot.hidden=false;dot.style.left=`${this.target[0]*100}%`;dot.style.top=`${this.target[1]*100}%`;
    this.message(this.text(this.phase==='train'?'eyeTarget':'eyeCheckTarget',this.index+1));
  }
  finishTarget(){
    if(this.phase==='train'){
      this.samples.push(...steadySamples(this.batch));this.index++;
      if(this.index===trainTargets.length){try{this.predict=trainGaze(this.samples);}catch{this.fail(this.text('eyeTrainingFailed'));return;}this.head=this.samples.reduce((s,p)=>s.map((v,i)=>v+p.head[i]/this.samples.length),[0,0,0]);this.phase='check';this.index=0;}
    }else{
      this.checks[this.index]=this.batch;this.index=this.checkQueue?(this.checkQueue.length?this.checkQueue.shift():4):this.index+1;
      if(this.index===4){
        if(!validationPass(this.checks)){this.failedChecks=[0,1,2,3].filter(i=>!goodCheck(this.checks[i]));this.fail(this.text('eyeFailedChecks',4-this.failedChecks.length));this.dialog.querySelector('#eye-retry').textContent=ui('eyeRetryDifficult',this.language);return;}
        this.phase='passed';this.dialog.querySelector('#eye-dot').hidden=true;this.dialog.querySelector('#eye-step-controls').hidden=true;this.dialog.querySelector('.eye-center').classList.remove('collecting');this.message(this.text('eyePassed'));this.dialog.querySelector('#eye-use').hidden=false;this.dialog.querySelector('#eye-progress').textContent=this.text('eyeAccuracyNote');return;
      }
    }
    this.nextTarget();
  }
  fail(text){this.ready=false;this.phase='failed';this.point(null);this.message(text);if(this.dialog){this.dialog.querySelector('#eye-dot').hidden=true;this.dialog.querySelector('#eye-retry').hidden=!this.running;this.dialog.querySelector('#eye-restart-all').hidden=!this.running;this.dialog.querySelector('#eye-pace-label').hidden=false;this.dialog.querySelector('#eye-step-controls').hidden=true;this.dialog.querySelector('.eye-center').classList.remove('collecting');}}
  tick=()=>{
    if(!this.running)return;
    const now=performance.now();
    if(innerWidth!==this.dimensions[0]||innerHeight!==this.dimensions[1]){this.stop();this.status(this.text('eyeResized'));this.done(false);return;}
    if(now-this.lastTick>65&&this.video.readyState>=2&&this.video.currentTime!==this.lastTime){
      this.lastTick=now;this.lastTime=this.video.currentTime;this.lastFrameAt=now;
      try{
        const observation=eyeFeatures(this.model.detectForVideo(this.video,now));
        if(['train','check'].includes(this.phase)){
          if(observation&&now>=this.settleUntil){
            this.batch.push(this.phase==='train'?{...observation,target:this.target}:{point:this.predict(observation.features),target:this.target});
            const needed=this.phase==='train'?30:20;
            this.dialog.querySelector('#eye-progress').textContent=this.text(this.phase==='train'?'eyeCollected':'eyeCheckCollected',Math.round(this.batch.length/needed*100));
            if(this.batch.length>=needed)this.finishTarget();
          }else if(!observation)this.dialog.querySelector('#eye-progress').textContent=this.text('eyeNotVisible');
          else this.dialog.querySelector('#eye-progress').textContent=this.settleUntil===Infinity?this.text('eyeHelperReady'):this.text('eyeSettling',Math.max(1,Math.ceil((this.settleUntil-now)/1000)));
        }else if(this.ready){
          const drift=!observation||Math.abs(observation.head[0]-this.head[0])>.08||Math.abs(observation.head[1]-this.head[1])>.08||observation.head[2]/this.head[2]<.7||observation.head[2]/this.head[2]>1.3;
          if(drift){this.smooth=null;this.point(null);this.status(this.text('eyeDrift'));}
          else{
            const p=this.predict(observation.features);
            if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1){this.smooth=null;this.point(null);this.status(this.text('eyeOutside'));}
            else{const target={x:p.x*innerWidth,y:p.y*innerHeight};this.smooth=this.smooth?{x:this.smooth.x+(target.x-this.smooth.x)*.4,y:this.smooth.y+(target.y-this.smooth.y)*.4}:target;this.point(this.smooth);this.status(this.text('eyeSelecting'));}
          }
        }
      }catch{this.release();this.fail(this.text('eyeTrackingFailed'));}
    }
    if(now-this.lastFrameAt>300)this.point(null);
    if(now-this.lastFrameAt>4000){this.release();this.fail(this.text('eyeFramesStopped'));return;}
    this.frame=requestAnimationFrame(this.tick);
  };
  release(){this.running=false;this.ready=false;cancelAnimationFrame(this.frame);this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.model?.close();this.model=null;this.video?.remove();this.point(null);}
  stop(){this.generation++;this.release();this.dialog?.close();this.dialog?.remove();this.dialog=null;this.phase='off';this.samples=[];this.checks=[];this.predict=null;this.head=null;this.smooth=null;}
}
