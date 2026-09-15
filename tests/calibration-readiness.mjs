import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.addInitScript(()=>{
  navigator.mediaDevices.getUserMedia=()=>new Promise(resolve=>{window.allowCamera=()=>{const c=document.createElement('canvas');c.width=320;c.height=240;const ctx=c.getContext('2d');const timer=setInterval(()=>{ctx.fillStyle='#444';ctx.fillRect(0,0,320,240);},30);const stream=c.captureStream(30),track=stream.getVideoTracks()[0],stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);stop();};resolve(stream);};});
 });
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=motion]').check();assert.equal(await page.locator('#calibrate').isDisabled(),true);
 await page.locator('#camera-start').click();await page.waitForFunction(()=>typeof window.allowCamera==='function');assert.equal(await page.locator('#calibrate').isDisabled(),true);await page.evaluate(()=>window.allowCamera());await page.waitForFunction(()=>!document.querySelector('#calibrate').disabled);
 await page.locator('#calibrate').click();assert.equal(await page.locator('#calibrate').isDisabled(),true);await page.waitForFunction(()=>document.querySelector('#camera-status').textContent.includes('Noise calibrated'));await page.waitForFunction(()=>!document.querySelector('#calibrate').disabled);
 await page.locator('#camera-stop').click();await page.waitForFunction(()=>document.querySelector('#calibrate').disabled);await page.locator('[value=hand]').check();assert.equal(await page.locator('#calibrate').isDisabled(),true);
 console.log('PASS calibration unavailable before/during camera startup and during sampling, enabled after readiness/completion, disabled after stop and in unopened hand mode');
}finally{await browser.close();}
