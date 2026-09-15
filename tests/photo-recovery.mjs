import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator('#quick-advanced').click();await page.locator('#open-phrases').click();await page.locator('#create-personal-phrase').click();await page.locator('#edit-text-en').fill('Keep this draft');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=10;c.height=10;return c.toDataURL().split(',')[1];});
 const delay=()=>page.evaluate(()=>{const original=window.createImageBitmap;window.createImageBitmap=async(...args)=>{const bitmap=await original(...args);await new Promise(resolve=>window.finishPhoto=resolve);window.createImageBitmap=original;return bitmap;};});
 const upload=()=>page.locator('#edit-photo-file').setInputFiles({name:'photo.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await delay();await upload();await page.waitForFunction(()=>typeof finishPhoto==='function');assert.equal(await page.locator('#edit-save').isDisabled(),true);await page.locator('#edit-photo-cancel').click();assert.equal(await page.locator('#edit-save').isEnabled(),true);assert.equal(await page.locator('#edit-text-en').inputValue(),'Keep this draft');await page.evaluate(()=>finishPhoto());await page.waitForTimeout(300);assert.equal(await page.locator('#edit-photo-preview').count(),0);
 await delay();await upload();await page.waitForTimeout(200);await page.locator('#edit-cancel').click();await page.evaluate(()=>finishPhoto());await page.waitForTimeout(300);assert.equal(await page.locator('#edit-photo-preview').count(),0);assert.deepEqual(errors,[]);
 await page.locator('#create-personal-phrase').click();await page.locator('#edit-text-en').fill('Save retry');await upload();await page.locator('#edit-photo-preview').waitFor();const photo=await page.locator('#edit-photo-preview').getAttribute('src');
 await page.evaluate(()=>{window.write=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return write.call(this,key,value);};});await page.locator('#edit-save').click();assert.equal(await page.locator('#edit-photo-preview').getAttribute('src'),photo);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases.length),0);
 await page.evaluate(()=>Storage.prototype.setItem=write);await page.locator('#edit-save').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases[0].photo),photo);assert.deepEqual(errors,[]);
 console.log('PASS processing cancellation retains draft, closed-editor late result ignored, failed photo save retains preview and retry commits');
}finally{await browser.close();}
