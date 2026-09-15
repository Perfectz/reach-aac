import {chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#write-message').click();assert.equal(await page.locator('#compose-download').isDisabled(),true);
 await page.evaluate(()=>{window.originalWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return originalWrite.call(this,k,v);};});
 const text='أريد أن أتحدث مع عائلتي\nPlease give me time.\nครอบครัว ❤️';await page.locator('#compose-text').fill(text);assert.match(await page.locator('#compose-draft-status').textContent(),/Draft not saved/);
 const event=page.waitForEvent('download');await page.locator('#compose-download').click();const file=await event;assert.equal(file.suggestedFilename(),'reach-message.txt');assert.equal(await readFile(await file.path(),'utf8'),text);assert.equal(await page.locator('#compose-text').inputValue(),text);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases.length),0);
 await page.evaluate(()=>{window.createUrl=URL.createObjectURL;URL.createObjectURL=()=>{throw Error('Unavailable');};});await page.locator('#compose-download').click();assert.match(await page.locator('#compose-download-note').textContent(),/Could not start/);assert.equal(await page.locator('#compose-text').inputValue(),text);await page.evaluate(()=>URL.createObjectURL=createUrl);
 console.log('PASS text download despite storage failure, exact multiline Unicode contents, no phrase mutation, download failure preserves message');
}finally{await browser.close();}
