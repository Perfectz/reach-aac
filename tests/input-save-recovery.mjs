import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();
 const fail=()=>page.evaluate(()=>{window.originalWrite??=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return originalWrite.call(this,k,v);};});
 const recover=()=>page.evaluate(()=>Storage.prototype.setItem=originalWrite);
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')));
 await fail();const before=await saved();
 for(const id of ['dwell-time','scan-time','scan-audio-rate']){const original=await page.locator('#'+id).inputValue();await page.locator('#'+id+'-more').click();assert.equal(await page.locator('#'+id).inputValue(),original);}
 await page.locator('#scan-audio-toggle').click();assert.equal(await page.locator('#scan-audio-toggle').getAttribute('aria-pressed'),'false');
 await page.locator('[value=hand]').click();assert.equal(await page.locator('[value=touch]').isChecked(),true);assert.deepEqual(await saved(),before);
 await recover();await page.locator('[value=hand]').check();await fail();const hand=await saved();
 await page.locator('#gain-more').click();assert.equal(Number(await page.locator('#gain').inputValue()),hand.gain);await page.locator('#finger-choice-4').click();assert.equal(Number(await page.locator('#finger').inputValue()),hand.finger);assert.equal(await page.locator('#finger-choice-8').getAttribute('aria-pressed'),'true');assert.deepEqual(await saved(),hand);
 await recover();await page.locator('[value=motion]').check();await fail();const motion=await saved();await page.locator('#threshold-more').click();assert.equal(Number(await page.locator('#threshold').inputValue()),motion.threshold);assert.deepEqual(await saved(),motion);
 await recover();await page.locator('#threshold-more').click();await page.locator('#scan-audio-toggle').click();await page.locator('#dwell-time-more').click();const retried=await saved();assert.equal(retried.threshold,motion.threshold+.5);assert.equal(retried.scanAudio,true);assert.equal(retried.dwell,motion.dwell+100);
 await page.locator('#input-done').click();await page.reload();await page.locator('#change-input').click();assert.equal(Number(await page.locator('#threshold').inputValue()),retried.threshold);assert.equal(await page.locator('#scan-audio-toggle').getAttribute('aria-pressed'),'true');
 console.log('PASS failed input edits preserve mode, timing, scan audio, gain, finger and threshold; controls stay synchronized; successful retry survives reload');
}finally{await browser.close();}
