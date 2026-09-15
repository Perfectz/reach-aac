import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const mode of ['switch','dwell']){
  const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(15000);
  await page.addInitScript(()=>{window.spoken=[];window.cancelled=0;window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>[{lang:'en-US',localService:true}];speechSynthesis.speak=u=>spoken.push(u.text);speechSynthesis.cancel=()=>cancelled++;});
  await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator(`[value=${mode}]`).check();await page.locator('#dwell-time').fill('1000');await page.locator('#scan-time').fill('2000');await page.locator('#input-done').click();
  if(mode==='switch'){await page.locator('#scan-start').click();await page.waitForFunction(()=>document.querySelector('.scanning'));}
  const before=await page.locator('#message').textContent(),stops=await page.evaluate(()=>cancelled);await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert.ok(await page.evaluate(()=>cancelled)>stops);
  await page.locator('[data-phrase=yes]').hover();await page.keyboard.press('Space');await page.keyboard.press('Enter');await page.keyboard.press('Escape');await page.locator('[data-phrase=yes]').click();await page.locator('#change-input').click();await page.waitForTimeout(2500);assert.equal(await page.evaluate(()=>spoken.length),0);assert.equal(await page.locator('#message').textContent(),before);assert.equal(await page.locator('.scanning,.dwelling').count(),0);assert.equal(await page.locator('#modal[open]').count(),0);
  await page.mouse.move(0,0);await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  if(mode==='switch'){await page.waitForFunction(()=>document.querySelector('[data-phrase=yes]')?.classList.contains('scanning'));await page.keyboard.press('Space');}
  else await page.locator('[data-phrase=yes]').hover();
  await page.waitForFunction(()=>spoken.includes('Yes'));assert.equal(await page.locator('#message').textContent(),'Yes');await context.close();console.log(`PASS ${mode}: print cancels speech, suppresses selection, then restores usable input`);
 }
}finally{await browser.close();}
