import {chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(15000);
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator('#quick-advanced').click();
 const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')));
 const photo=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=64;c.height=32;c.getContext('2d').fillRect(0,0,64,32);return c.toDataURL('image/jpeg');});
 const imported={...original,phrases:[{id:'custom-photo',en:'Family photo',sourceLanguage:'en',photo,icon:'Heart'}]},raw=JSON.stringify({app:'Reach',version:1,settings:imported});
 const upload=(name='backup.json',data=raw)=>page.locator('#import').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(data)});
 const download=async()=>{const event=page.waitForEvent('download');await page.locator('#export').click();return JSON.parse(await readFile(await (await event).path(),'utf8'));};
 await page.evaluate(()=>{window.realWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return realWrite.call(this,k,v);};});
 await upload();await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('could not be saved'));assert.deepEqual((await download()).settings,original);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings'))),original);
 await page.evaluate(()=>Storage.prototype.setItem=realWrite);await upload();await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Setup imported'));const exported=await download();assert.equal(exported.settings.phrases[0].photo,photo);
 // Leaving setup while a file is still reading must invalidate that import.
 await page.evaluate(()=>{const text=File.prototype.text;File.prototype.text=async function(){const value=await text.call(this);if(this.name==='slow.json')await new Promise(resolve=>window.finishImport=resolve);return value;};});
 await upload('slow.json',JSON.stringify({app:'Reach',version:1,settings:{...imported,language:'ar'}}));await page.waitForFunction(()=>typeof finishImport==='function');await page.locator('#settings-done').click();await page.evaluate(()=>finishImport());await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).language),'en');
 const other=await browser.newContext(),replacement=await other.newPage();await replacement.goto('http://localhost:4173');await replacement.locator('#welcome-touch').click();await replacement.locator('#settings').click();await replacement.locator('#quick-advanced').click();await replacement.locator('#import').setInputFiles({name:'restored.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await replacement.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Setup imported'));await replacement.locator('#settings-done').click();await replacement.locator('#board-topics').click();await replacement.locator('#modal [data-category=mine]').click();assert.equal(await replacement.locator('.phrase-photo').getAttribute('src'),photo);await replacement.waitForFunction(()=>document.querySelector('.phrase-photo').naturalWidth===64);
 console.log('PASS failed import preserves live/exported/persisted setup, same-file retry, abandoned read ignored, photo backup restored in a fresh browser context');
}finally{await browser.close();}
