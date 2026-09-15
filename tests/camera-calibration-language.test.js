import {test} from 'node:test';import assert from 'node:assert/strict';
import {CameraInput} from '../src/camera.js';import {ui} from '../src/languages.js';
test('changing tracked finger clears old coordinates and pointer until fresh detection',()=>{
 const points=[],markers=[],camera=Object.create(CameraInput.prototype);Object.assign(camera,{running:true,mode:'hand',settings:{language:'en'},status(){},point:p=>points.push(p),finger:p=>markers.push(p),origin:{x:.1,y:.2},smooth:{x:20,y:30},lastPoint:{x:.4,y:.5},lastSeen:performance.now()});camera.resetHandReference();assert.equal(camera.origin,null);assert.equal(camera.lastPoint,null);assert.equal(camera.smooth,null);assert.deepEqual(points,[null]);assert.deepEqual(markers,[null]);assert.equal(camera.calibrate(),false);camera.lastPoint={x:.8,y:.7};camera.lastSeen=performance.now();assert.equal(camera.calibrate(),true);assert.deepEqual(camera.origin,{x:.8,y:.7});
});
test('hand and motion calibration report the selected language without relaxing input checks',()=>{
 for(const language of ['en','zh','hi','es','ar','th']){
  let message='',reset=false;const camera=Object.create(CameraInput.prototype);Object.assign(camera,{running:true,mode:'hand',settings:{language},status:text=>message=text,gate:{reset:()=>reset=true}});
  assert.equal(camera.calibrate(),false);assert.equal(message,ui('cameraNoHand',language));assert.equal(camera.origin,undefined);
  camera.lastPoint={x:.4,y:.5};camera.lastSeen=performance.now()-1000;assert.equal(camera.calibrate(),false);camera.lastSeen=performance.now();assert.equal(camera.calibrate(),true);assert.deepEqual(camera.origin,camera.lastPoint);assert.notEqual(camera.origin,camera.lastPoint);assert.equal(message,ui('cameraRestSet',language));
  camera.mode='motion';const before=performance.now();assert.equal(camera.calibrate(),true);assert.equal(reset,true);assert.ok(camera.calibratingUntil>=before+3000);assert.equal(message,ui('cameraKeepStill',language));
  if(language!=='en')for(const key of ['cameraNoHand','cameraRestSet','cameraKeepStill','cameraPreparing','cameraShowHand','cameraPlaceFinger','cameraNoiseReady'])assert.notEqual(ui(key,language),ui(key,'en'));
 }
});
test('lost hand cannot calibrate from the previous frame, but retains the existing resting position',()=>{
 const camera=Object.create(CameraInput.prototype),origin={x:.2,y:.3};Object.assign(camera,{running:true,mode:'hand',settings:{language:'en'},status(){},point(){},finger(){},origin,lastPoint:{x:.4,y:.5},lastSeen:performance.now()});camera.clearHandSample();assert.equal(camera.calibrate(),false);assert.equal(camera.origin,origin);
});
