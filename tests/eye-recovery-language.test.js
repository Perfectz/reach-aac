import test from 'node:test';
import assert from 'node:assert/strict';
import {EyeInput} from '../src/eye.js';
import {languages,ui} from '../src/languages.js';

test('eye camera interruption and resize clear selection with localized recovery',()=>{
 const names=['innerWidth','innerHeight','requestAnimationFrame','cancelAnimationFrame'];const originals=names.map(k=>Object.getOwnPropertyDescriptor(globalThis,k));
 Object.assign(globalThis,{innerWidth:1000,innerHeight:800,requestAnimationFrame:()=>1,cancelAnimationFrame:()=>{}});
 try{
  for(const {id:language} of languages){
   for(const scenario of ['resize','frames','error']){
    const statuses=[],points=[],done=[];const eye=new EyeInput({point:p=>points.push(p),status:s=>statuses.push(s),done:v=>done.push(v)});eye.language=language;eye.running=true;eye.ready=true;eye.dimensions=scenario==='resize'?[1,1]:[1000,800];eye.lastTick=-1000;eye.lastTime=-1;eye.lastFrameAt=performance.now()-5000;
    eye.video={readyState:scenario==='error'?2:0,currentTime:1,remove(){}};eye.model={detectForVideo(){throw Error('Private internal model detail');},close(){}};eye.message=s=>statuses.push(s);
    eye.tick();assert.equal(eye.ready,false);assert.equal(eye.running,false);assert.equal(points.at(-1),null);assert.equal(statuses.at(-1),ui({resize:'eyeResized',frames:'eyeFramesStopped',error:'eyeTrackingFailed'}[scenario],language));if(scenario==='resize')assert.deepEqual(done,[false]);
   }
  }
 }finally{names.forEach((k,i)=>{if(originals[i])Object.defineProperty(globalThis,k,originals[i]);else delete globalThis[k];});}
});

test('failed validation retains failed target indices and localizes its recovery summary',()=>{
 for(const {id:language} of languages){
  const nodes=new Map();const get=key=>{if(!nodes.has(key))nodes.set(key,{hidden:false,textContent:'',classList:{remove(){}}});return nodes.get(key);};
  const eye=new EyeInput({point(){},status(){},done(){}});eye.language=language;eye.running=true;eye.phase='check';eye.index=3;eye.checks=[[],[],[]];eye.batch=[];eye.dialog={querySelector:get};eye.message=s=>eye.lastMessage=s;
  eye.finishTarget();assert.deepEqual(eye.failedChecks,[0,1,2,3]);assert.equal(eye.ready,false);assert.equal(eye.phase,'failed');assert.equal(eye.lastMessage,ui('eyeFailedChecks',language).replace('{n}','0'));assert.equal(get('#eye-retry').textContent,ui('eyeRetryDifficult',language));
  eye.phase='train';eye.index=4;eye.samples=[];eye.batch=[{features:[0,0,0,0,0,0,0],head:[.5,.5,.4],target:[.5,.5]}];eye.finishTarget();assert.equal(eye.phase,'failed');assert.equal(eye.ready,false);assert.equal(eye.lastMessage,ui('eyeTrainingFailed',language));
 }
});
