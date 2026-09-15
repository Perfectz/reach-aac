import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {ui,languages} from '../src/languages.js';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const {id:language} of languages){
  const context=await browser.newContext(),page=await context.newPage();await page.addInitScript(()=>navigator.mediaDevices.getUserMedia=async()=>{const c=document.createElement('canvas');c.width=320;c.height=240;const ctx=c.getContext('2d');let n=0;const timer=setInterval(()=>{ctx.fillStyle=n++%2?'#444':'#454545';ctx.fillRect(0,0,320,240);},30);const stream=c.captureStream(30),track=stream.getVideoTracks()[0],stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);stop();};return stream;});
  await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator(`[data-lang=${language}]`).click();await page.locator('#quick-input').click();await page.locator('[value=motion]').check();assert.equal(await page.locator('#motion-meter').getAttribute('aria-label'),ui('motionLevel',language));const before=await page.locator('#motion-threshold').textContent();assert.equal(await page.locator('#motion-meter').getAttribute('aria-valuetext'),before);
  await page.locator('#camera-start').click();await page.waitForFunction(()=>document.querySelector('#motion-meter').value>0);await page.locator('#threshold').fill('8.5');await page.waitForFunction(()=>document.querySelector('#motion-threshold').textContent.includes('8.5'));
  const reading=await page.evaluate(()=>({text:document.querySelector('#motion-threshold').textContent,accessible:document.querySelector('#motion-meter').getAttribute('aria-valuetext'),value:document.querySelector('#motion-meter').value}));assert.equal(reading.accessible,reading.text);assert.equal(reading.text,ui('motionReading',language).replace('{value}',reading.value.toFixed(1)).replace('{threshold}','8.5'));await page.locator('#camera-stop').click();await context.close();
 }
 console.log('PASS movement meter has localized accessible name, initial/live readings and threshold changes in all six languages');
}finally{await browser.close();}
