import {test} from 'node:test';import assert from 'node:assert/strict';
import {motionCalibrationThreshold,CameraInput} from '../src/camera.js';
test('motion baseline needs both elapsed time and enough camera samples',()=>{
 assert.equal(motionCalibrationThreshold([0],5000),null);
 assert.equal(motionCalibrationThreshold(Array(19).fill(1),10000),null);
 assert.equal(motionCalibrationThreshold(Array(20).fill(1),2999),null);
 assert.equal(motionCalibrationThreshold(Array(20).fill(1),3000),3.5);
 assert.equal(motionCalibrationThreshold(Array(20).fill(1),10000),3.5);
});
test('failed calibration commit preserves threshold and blocks selection readiness until retry',()=>{
 const camera=Object.create(CameraInput.prototype);camera.settings={threshold:8,language:'en'};camera.calibrated=true;camera.calibratingUntil=123;let resets=0;camera.gate={reset(){resets++;}};const statuses=[];camera.status=s=>statuses.push(s);camera.onCalibrated=()=>false;
 assert.equal(camera.finishMotionCalibration(3.26),false);assert.equal(camera.settings.threshold,8);assert.equal(camera.calibrated,false);assert.equal(camera.calibratingUntil,0);assert.match(statuses.at(-1),/could not be saved/);
 camera.onCalibrated=value=>{assert.equal(value,3.5);return true;};assert.equal(camera.finishMotionCalibration(3.26),true);assert.equal(camera.settings.threshold,3.5);assert.equal(camera.calibrated,true);assert.equal(resets,2);
});
test('motion baseline keeps its noise percentile and limits without mutating samples',()=>{
 const samples=[...Array(38).fill(1),3,10],before=[...samples];assert.equal(motionCalibrationThreshold(samples,3000),8.5);assert.deepEqual(samples,before);
 assert.equal(motionCalibrationThreshold(Array(20).fill(0),3000),2);assert.equal(motionCalibrationThreshold(Array(20).fill(255),3000),40);assert.equal(motionCalibrationThreshold([...Array(19).fill(1),NaN],3000),null);
});
