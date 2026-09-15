import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.addInitScript(()=>{
  window.requests=[];window.stopped=[];
  navigator.mediaDevices.getUserMedia=()=>new Promise((resolve,reject)=>{const id=requests.length;requests.push({reject,allow(){const c=document.createElement('canvas');c.width=320;c.height=240;const ctx=c.getContext('2d');const timer=setInterval(()=>{ctx.fillStyle='#444';ctx.fillRect(0,0,320,240);},30);const stream=c.captureStream(30),track=stream.getVideoTracks()[0],stop=track.stop.bind(track);track.stop=()=>{stopped.push(id);clearInterval(timer);stop();};this.stream=stream;resolve(stream);}});});
 });
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=motion]').check();
 await page.locator('#camera-start').click();await page.waitForFunction(()=>requests.length===1);await page.locator('#camera-stop').click();assert.equal(await page.locator('#camera-start').isEnabled(),true);assert.equal(await page.locator('#calibrate').isDisabled(),true);
 await page.locator('#camera-start').click();await page.waitForFunction(()=>requests.length===2);await page.evaluate(()=>requests[0].allow());await page.waitForFunction(()=>stopped.includes(0));assert.equal(await page.locator('#camera-start').isDisabled(),true);assert.equal(await page.locator('#calibrate').isDisabled(),true);
 await page.evaluate(()=>requests[1].allow());await page.waitForFunction(()=>!document.querySelector('#calibrate').disabled);assert.equal(await page.locator('#camera-start').isEnabled(),true);assert.equal(await page.evaluate(()=>requests[1].stream.getVideoTracks()[0].readyState),'live');
 await page.locator('#camera-stop').click();assert.equal(await page.evaluate(()=>requests[1].stream.getVideoTracks()[0].readyState),'ended');
 await page.locator('#camera-start').click();await page.waitForFunction(()=>requests.length===3);await page.locator('#camera-stop').click();await page.evaluate(()=>requests[2].reject(new DOMException('Old request denied','NotAllowedError')));await page.waitForTimeout(100);assert.equal(await page.locator('#camera-start').isEnabled(),true);assert.equal(await page.locator('#camera-status').textContent(),'Camera is off');
 console.log('PASS stopped pending request permits retry, late grant releases old stream without unlocking new attempt, newest stream works, late rejection preserves stopped state');
}finally{await browser.close();}
