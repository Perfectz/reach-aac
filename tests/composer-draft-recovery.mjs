import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#write-message').click();await page.locator('#compose-text').fill('First draft');assert.equal(await page.locator('#compose-draft-status').textContent(),'Draft saved on this device');
 await page.evaluate(()=>{window.originalWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return originalWrite.call(this,k,v);};});
 await page.locator('#compose-text').fill('Please keep the door open');assert.match(await page.locator('#compose-draft-status').textContent(),/Draft not saved/);assert.equal(await page.locator('#compose-draft-retry').isEnabled(),true);await page.locator('#compose-draft-retry').click();assert.equal(await page.locator('#compose-text').inputValue(),'Please keep the door open');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-profiles-v1')).people[0].draft.text),'First draft');
 await page.evaluate(()=>Storage.prototype.setItem=originalWrite);await page.locator('#compose-draft-retry').click();assert.equal(await page.locator('#compose-draft-status').textContent(),'Draft saved on this device');assert.equal(await page.locator('#compose-draft-retry').isDisabled(),true);await page.reload();await page.locator('#write-message').click();assert.equal(await page.locator('#compose-text').inputValue(),'Please keep the door open');
 console.log('PASS explicit unsaved draft state, unchanged stored draft, retry without retyping and successful reload recovery');
}finally{await browser.close();}
