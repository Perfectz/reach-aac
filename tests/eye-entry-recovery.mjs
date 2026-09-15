import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();
 await page.addInitScript(()=>{
  window.cameraStops=0;window.cameraRequests=0;
  navigator.mediaDevices.getUserMedia=async()=>{
   window.cameraRequests++;const canvas=document.createElement('canvas');canvas.width=320;canvas.height=240;const ctx=canvas.getContext('2d');let frame=0;
   const timer=setInterval(()=>{ctx.fillStyle=frame++%2?'#444':'#454545';ctx.fillRect(0,0,320,240);},30);
   const stream=canvas.captureStream(30);window.testStream=stream;const track=stream.getVideoTracks()[0],stop=track.stop.bind(track);track.stop=()=>{window.cameraStops++;clearInterval(timer);stop();};return stream;
  };
 });
 const fail=()=>page.evaluate(()=>{window.originalWrite??=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return originalWrite.call(this,k,v);};});
 const recover=()=>page.evaluate(()=>Storage.prototype.setItem=originalWrite);
 const saved=()=>page.evaluate(()=>localStorage.getItem('reach-settings'));
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=motion]').check();await page.locator('#camera-start').click();await page.waitForFunction(()=>window.testStream?.getVideoTracks()[0]?.readyState==='live');await page.locator('#input-done').click();
 const before=await saved();await fail();await page.locator('#eye-shortcut').click();
 assert.equal(await saved(),before);assert.equal(await page.locator('#modal').evaluate(e=>e.open),false);assert.match(await page.locator('#toast').textContent(),/could not be saved/);assert.equal(await page.evaluate(()=>cameraStops),0);assert.equal(await page.evaluate(()=>testStream.getVideoTracks()[0].readyState),'live');
 await recover();await page.locator('#settings').click();await page.locator('#quick-done').click();assert.equal(JSON.parse(await saved()).mode,'motion');
 await page.locator('#eye-shortcut').click();assert.equal(await page.locator('[value=eye]').isChecked(),true);assert.equal(JSON.parse(await saved()).mode,'eye');assert.equal(await page.evaluate(()=>cameraStops),1);assert.equal(await page.evaluate(()=>cameraRequests),1);
 await page.locator('#close-dialog').click();await page.reload();await page.locator('#change-input').click();assert.equal(await page.locator('[value=eye]').isChecked(),true);await page.locator('#close-dialog').click();
 await fail();await page.locator('#eye-shortcut').click();await page.locator('#eye-start').waitFor();assert.equal(await page.locator('[value=eye]').isChecked(),true);
 console.log('PASS failed eye shortcut preserves live camera/mode, later save does not leak rejected mode, successful retry stops old camera once and persists, existing eye setup remains reachable without saving');
}finally{await browser.close();}
