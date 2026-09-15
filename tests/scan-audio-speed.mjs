import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();
 await page.addInitScript(()=>{window.previews=[];window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>[{lang:'en',localService:true}];speechSynthesis.speak=u=>{previews.push({text:u.text,rate:u.rate});queueMicrotask(()=>u.onend?.());};});
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=switch]').check();await page.locator('#scan-audio-toggle').click();
 for(let i=0;i<3;i++)await page.locator('#scan-audio-rate-less').click();assert.equal(Number(await page.locator('#scan-audio-rate').inputValue()),.8);
 await page.locator('#input-done').click();await page.reload();await page.locator('#change-input').click();assert.equal(Number(await page.locator('#scan-audio-rate').inputValue()),.8);
 await page.locator('#input-done').click();await page.locator('#scan-start').click();await page.waitForFunction(()=>previews.length);assert.equal(await page.evaluate(()=>previews[0].rate),.8);await page.locator('#scan-start').click();
 await page.locator('#change-input').click();for(let i=0;i<6;i++)await page.locator('#scan-audio-rate-less').click();assert.equal(await page.locator('#scan-audio-rate-less').isDisabled(),true);assert.equal(Number(await page.locator('#scan-audio-rate').inputValue()),.5);
 console.log('PASS preview speed buttons, persisted preference, actual utterance rate and lower bound');
}finally{await browser.close();}
