import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=switch]').check();await page.locator('#input-done').click();await page.locator('#scan-start').click();
 await page.locator('#settings').click();await page.locator('#open-setup-guide').click();await page.locator('#guide-lang-es').click();await page.locator('#guide-reading-larger').click();await page.locator('#guide-position-reclined').click();await page.locator('#guide-input-touch').click();const previous=await page.evaluate(()=>localStorage.getItem('reach-settings'));
 await page.evaluate(()=>{window.originalWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return originalWrite.call(this,k,v);};});
 await page.locator('#guide-apply').click();assert.match(await page.locator('#guide-save-error').textContent(),/No se pudo guardar/);assert.equal(await page.locator('#dialog-body').getAttribute('lang'),'es');assert.equal(await page.evaluate(()=>localStorage.getItem('reach-settings')),previous);assert.equal(await page.locator('html').getAttribute('lang'),'en');await page.waitForFunction(()=>document.querySelector('#modal .scanning'));assert.equal(await page.locator('#practice-start').count(),0);
 await page.locator('#guide-apply').click();assert.equal(await page.locator('#guide-save-error').count(),1);
 await page.evaluate(()=>Storage.prototype.setItem=originalWrite);await page.locator('#guide-apply').click();await page.locator('#practice-start').waitFor();const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')));assert.equal(saved.language,'es');assert.equal(saved.mode,'touch');assert.equal(saved.simple,true);assert.equal(saved.setupGuide.position,'reclined');
 console.log('PASS guide retains reviewed answers and existing scan after failed save, localized retry error, successful retry enters practice');
}finally{await browser.close();}
