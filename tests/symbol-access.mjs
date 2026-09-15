import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const mode of ['dwell','switch']){
  const context=await browser.newContext({viewport:{width:1280,height:1000}}),page=await context.newPage();page.setDefaultTimeout(15000);
  await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator(`[value=${mode}]`).check();await page.locator('#dwell-time').fill('600');await page.locator('#scan-time').fill('1000');await page.locator('#input-done').click();if(mode==='switch')await page.locator('#scan-start').click();
  await page.locator('#settings').click();await page.locator('#quick-advanced').click();await page.locator('#open-phrases').click();await page.locator('#create-personal-phrase').click();await page.locator('#edit-text-en').fill('A drink please');await page.locator('#edit-symbol').click();
  const select=async id=>{if(mode==='dwell'){await page.mouse.move(0,0);await page.waitForTimeout(200);await page.locator('#'+id).hover();await page.waitForTimeout(1000);}else{await page.waitForTimeout(1900);await page.waitForFunction(id=>document.getElementById(id)?.classList.contains('scanning'),id,{timeout:45000});await page.keyboard.press('Space');}};
  await select('symbol-next');await page.locator('#phrase-symbol-Droplets').waitFor();await select('symbol-next');await page.locator('#phrase-symbol-Coffee').waitFor();await select('phrase-symbol-Coffee');await page.locator('#edit-symbol').waitFor();assert.match(await page.locator('#edit-symbol').textContent(),/Drink/);assert.equal(await page.locator('#edit-text-en').inputValue(),'A drink please');assert.equal(await page.evaluate(()=>document.activeElement.id),'edit-symbol');
  await page.mouse.move(0,0);await page.waitForTimeout(1200);assert.equal(await page.locator('#edit-symbol').count(),1);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases.length),0);
  console.log(`PASS ${mode}: symbol paging and choice, draft preservation, focus return, no premature save`);await context.close();
 }
}finally{await browser.close();}
