import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(15000);
 await page.addInitScript(()=>{window.reads={};const original=File.prototype.text;File.prototype.text=async function(){const value=await original.call(this);await new Promise(resolve=>reads[this.name]=resolve);return value;};});
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator('#quick-advanced').click();
 const choose=(name,language)=>page.locator('#import').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'Reach',version:1,settings:{language}}))});
 await choose('old.json','ar');await page.waitForFunction(()=>!!reads['old.json']);await choose('latest.json','es');await page.waitForFunction(()=>!!reads['latest.json']);
 await page.evaluate(()=>reads['old.json']());await page.waitForTimeout(250);assert.equal(await page.locator('#setting-language').inputValue(),'en');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).language),'en');
 await page.evaluate(()=>reads['latest.json']());await page.waitForFunction(()=>document.querySelector('#setting-language').value==='es');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).language),'es');
 // An invalid latest selection must not revive a superseded valid backup.
 await choose('superseded.json','ar');await page.waitForFunction(()=>!!reads['superseded.json']);await page.locator('#import').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});await page.waitForFunction(()=>!!reads['invalid.json']);await page.evaluate(()=>reads['invalid.json']());await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Choose an exported'));await page.evaluate(()=>reads['superseded.json']());await page.waitForTimeout(250);assert.equal(await page.locator('#setting-language').inputValue(),'es');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).language),'es');
 console.log('PASS latest file selection wins while both reads are pending; rejected latest file never restores a superseded backup');
}finally{await browser.close();}
