import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();
 await page.addInitScript(()=>{window.previews=[];window.cancelCount=0;window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>[{lang:'en',localService:true}];speechSynthesis.speak=u=>previews.push(u);speechSynthesis.cancel=()=>cancelCount++;});
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();const original=await page.locator('#message').textContent();await page.locator('#change-input').click();
 await page.locator('#scan-audio-rate-less').click();await page.locator('#scan-audio-try').click();assert.equal(await page.evaluate(()=>previews[0].text),'Option: This is a scan preview.');assert.equal(await page.evaluate(()=>previews[0].rate),.9);assert.equal(await page.locator('#scan-audio-status').textContent(),'Reading a scan option');assert.equal(await page.locator('#scan-audio-toggle').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('#message').textContent(),original);
 const cancels=await page.evaluate(()=>cancelCount);await page.locator('#scan-audio-stop').click();assert.ok(await page.evaluate(()=>cancelCount)>cancels);assert.equal(await page.locator('#scan-audio-status').textContent(),'Scan audio waiting');
 await page.evaluate(()=>speechSynthesis.getVoices=()=>[]);await page.locator('#scan-audio-try').click();assert.match(await page.locator('#scan-audio-status').textContent(),/No matching offline voice/);assert.equal(await page.evaluate(()=>previews.length),1);
 await page.evaluate(()=>speechSynthesis.getVoices=()=>[{lang:'en',localService:true}]);await page.locator('#scan-audio-try').click();await page.waitForFunction(()=>document.querySelector('#scan-audio-status').textContent.includes('time limit'),null,{timeout:25000});assert.equal(await page.locator('#message').textContent(),original);
 await page.locator('#scan-audio-try').click();const beforeClose=await page.evaluate(()=>cancelCount);await page.locator('#input-done').click();assert.ok(await page.evaluate(()=>cancelCount)>beforeClose);
 console.log('PASS voice trial without scanning, selected rate, stop, missing voice, stalled timeout, unchanged message and cleanup on close');
}finally{await browser.close();}
