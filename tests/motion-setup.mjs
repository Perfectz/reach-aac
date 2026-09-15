import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();
 await page.addInitScript(()=>{
  window.moving=false;navigator.mediaDevices.getUserMedia=async()=>{const c=document.createElement('canvas');c.width=640;c.height=480;const ctx=c.getContext('2d');let n=0;const timer=setInterval(()=>{ctx.fillStyle=window.moving?'rgb('+Array(3).fill((n++*47)%256).join(',')+')':'#444';ctx.fillRect(0,0,640,480);},33);const s=c.captureStream(30),track=s.getVideoTracks()[0],stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);stop();};return s;};
 });
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=motion]').check();await page.locator('#scan-time').fill('1000');assert.equal(await page.locator('#motion-scan').isDisabled(),true);await page.locator('#camera-start').click();await page.waitForTimeout(1000);assert.equal(await page.locator('#motion-scan').isDisabled(),true);
 await page.locator('#calibrate').click();await page.waitForFunction(()=>!document.querySelector('#motion-scan').disabled);await page.locator('#motion-scan').click();await page.waitForTimeout(1000);
 const threshold=await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).threshold);
 await page.waitForFunction(()=>document.querySelector('#threshold-more').classList.contains('scanning'),{},{timeout:45000});await page.evaluate(()=>window.moving=true);await page.waitForFunction(v=>JSON.parse(localStorage.getItem('reach-settings')).threshold>v,threshold,{timeout:3000}).catch(async e=>{console.log(await page.evaluate(()=>({threshold:JSON.parse(localStorage.getItem('reach-settings')).threshold,meter:document.querySelector('#motion-threshold')?.textContent,status:document.querySelector('#camera-status')?.textContent,selected:document.querySelector('.scanning')?.id})));throw e;});await page.evaluate(()=>window.moving=false);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).threshold),2.5);assert.equal(await page.locator('#modal').isVisible(),true);
 await page.waitForTimeout(2000);await page.waitForFunction(()=>document.querySelector('#input-done').classList.contains('scanning'),{},{timeout:45000});await page.evaluate(()=>window.moving=true);await page.waitForFunction(()=>!document.querySelector('#modal').open,{},{timeout:3000});await page.evaluate(()=>window.moving=false);
 assert.equal(await page.locator('#scan-start').innerText(),'Stop scanning');await page.locator('#change-input').click();await page.locator('#motion-practice').click();assert.equal(await page.locator('#practice-start').isEnabled(),true);await page.locator('#practice-close').click();await page.locator('#change-input').click();await page.locator('#camera-stop').click();await page.waitForFunction(()=>document.querySelector('#motion-scan').disabled);assert.equal(await page.locator('#motion-practice').isDisabled(),true);
 console.log('PASS calibration-gated controls; real motion-score pipeline selects a setup adjustment and Done; scanning persists; separate practice; stopped camera disables controls');
}finally{await browser.close();}


