import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(15000);
 await page.addInitScript(()=>{window.output=[];window.holdPreview=true;window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>[{lang:'en-US',localService:true}];speechSynthesis.speak=u=>{output.push(u.text);if(holdPreview&&u.text.startsWith('Option:'))window.preview=u;else queueMicrotask(()=>u.onend?.());};});
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=switch]').check();await page.locator('#scan-time').fill('2000');await page.locator('#scan-audio-toggle').click();await page.locator('#input-done').click();
 const before=await page.locator('#message').textContent();await page.locator('#scan-start').click();await page.waitForFunction(()=>output.some(t=>t.startsWith('Option:')));assert.equal(await page.locator('#message').textContent(),before);
 await page.waitForFunction(()=>document.querySelector('#scan-audio-live').textContent==='Reading a scan option');assert.equal(await page.locator('#scan-audio-live').isVisible(),true);
 const highlighted=await page.locator('.scanning').elementHandle();await page.waitForTimeout(2500);assert.equal(await highlighted.evaluate(e=>e.classList.contains('scanning')),true);assert.equal(await page.evaluate(()=>output.length),1);
 await page.evaluate(()=>{holdPreview=false;preview.onend();});await page.waitForTimeout(1000);assert.equal(await highlighted.evaluate(e=>e.classList.contains('scanning')),true);
 await page.waitForFunction(()=>document.querySelector('[data-phrase=yes]')?.classList.contains('scanning'));await page.keyboard.press('Space');await page.waitForFunction(()=>output.includes('Yes'));assert.equal(await page.locator('#message').textContent(),'Yes');
 await page.locator('#scan-start').click();const stopped=await page.evaluate(()=>output.length);await page.waitForTimeout(2500);assert.equal(await page.evaluate(()=>output.length),stopped);
 await page.reload();await page.locator('#change-input').click();assert.equal(await page.locator('#scan-audio-toggle').getAttribute('aria-pressed'),'true');await page.locator('#scan-audio-toggle').click();await page.locator('#input-done').click();await page.locator('#scan-start').click();await page.waitForTimeout(2500);assert.equal(await page.evaluate(()=>output.length),0);
 assert.equal(await page.locator('#scan-audio-live').isVisible(),false);await page.locator('#scan-start').click();await page.locator('#change-input').click();await page.evaluate(()=>speechSynthesis.getVoices=()=>[]);await page.locator('#scan-audio-toggle').click();await page.locator('#input-done').click();await page.locator('#scan-start').click();await page.waitForFunction(()=>document.querySelector('#scan-audio-live').textContent.includes('No matching offline voice'));assert.equal(await page.evaluate(()=>output.length),0);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);assert.equal(await page.locator('#scan-audio-live').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);await page.screenshot({path:'artifacts/scan-audio-status.png'});
 console.log('PASS opt-in previews, committed speech, timing, stop, persistence, missing-voice status and narrow accessibility');
}finally{await browser.close();}
