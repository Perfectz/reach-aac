import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();
 const fail=()=>page.evaluate(()=>{window.originalWrite??=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return originalWrite.call(this,k,v);};});const recover=()=>page.evaluate(()=>Storage.prototype.setItem=originalWrite);
 const settings=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')));
 await page.locator('#settings').click();await page.locator('#edit-pack').click();await page.locator('[data-pack-slot="2"]').click();await page.locator('[data-pack-phrase=photos]').click();const before=await settings();await fail();await page.locator('#pack-apply').click();assert.equal(await page.locator('#pack-apply').isVisible(),true);assert.match(await page.locator('[data-pack-slot="2"]').textContent(),/photo/i);assert.deepEqual(await settings(),before);assert.equal(await page.locator('#board [data-phrase=pain]').count(),1);
 await recover();await page.locator('#pack-apply').click();assert.equal(await page.locator('#modal[open]').count(),0);assert.equal((await settings()).packs.homeCare[2],'photos');
 await page.locator('#settings').click();await page.locator('#edit-pack').click();await page.locator('#pack-restore').click();await fail();await page.locator('#pack-apply').click();await page.locator('#pack-discard').click();assert.equal(await page.locator('#board [data-phrase=photos]').count(),1);await recover();
 await page.locator('#settings').click();await page.locator('#quick-advanced').click();await page.locator('#open-phrases').click();await page.locator('#phrase-en').fill('Please stay with me');await page.locator('#phrase-es').fill('Por favor, quédate conmigo');const count=(await settings()).phrases.length;
 await fail();for(let i=0;i<2;i++)await page.locator('#phrase-form button').click();assert.equal(await page.locator('#phrase-en').inputValue(),'Please stay with me');assert.equal(await page.locator('#phrase-es').inputValue(),'Por favor, quédate conmigo');assert.equal((await settings()).phrases.length,count);
 await recover();await page.locator('#phrase-form button').click();assert.equal((await settings()).phrases.length,count+1);await page.reload();const restored=await settings();assert.equal(restored.packs.homeCare[2],'photos');assert.equal(restored.phrases.filter(p=>p.en==='Please stay with me').length,1);assert.equal(restored.phrases.at(-1).translations.es,'Por favor, quédate conmigo');
 console.log('PASS failed pack apply retains draft and original board, retry/discard work, failed phrase submission retains translations without duplicates, reload preserves successful edits');
}finally{await browser.close();}
