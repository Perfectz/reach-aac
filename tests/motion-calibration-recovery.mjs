import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.addInitScript(()=>navigator.mediaDevices.getUserMedia=async()=>{const c=document.createElement('canvas');c.width=320;c.height=240;const ctx=c.getContext('2d');const timer=setInterval(()=>{ctx.fillStyle='#444';ctx.fillRect(0,0,320,240);},30);const stream=c.captureStream(30),track=stream.getVideoTracks()[0],stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);stop();};return stream;});
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=motion]').check();await page.locator('#threshold').fill('8');await page.locator('#camera-start').click();await page.waitForFunction(()=>document.querySelector('#camera-preview video')?.readyState>=2);
 await page.evaluate(()=>{window.originalWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return originalWrite.call(this,k,v);};});
 await page.locator('#calibrate').click();await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.includes('could not be saved'));
 assert.equal(await page.locator('#threshold').inputValue(),'8');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).threshold),8);assert.equal(await page.locator('#motion-practice').isDisabled(),true);assert.equal(await page.locator('#motion-scan').isDisabled(),true);
 await page.evaluate(()=>Storage.prototype.setItem=originalWrite);await page.locator('#calibrate').click();await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.includes('Noise calibrated'));
 assert.equal(await page.locator('#threshold').inputValue(),'2');assert.equal(await page.locator('#threshold').evaluate(e=>e.closest('label').querySelector('output').textContent),'2');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).threshold),2);await page.waitForFunction(()=>!document.querySelector('#motion-practice').disabled);
 await page.locator('#input-done').click();await page.reload();await page.locator('#change-input').click();assert.equal(await page.locator('#threshold').inputValue(),'2');
 console.log('PASS rejected motion calibration retains saved/displayed threshold and blocks scanning/practice; retry synchronizes controls and survives reload');
}finally{await browser.close();}
