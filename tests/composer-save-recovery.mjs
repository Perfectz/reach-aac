import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage();await page.addInitScript(()=>{window.said=[];window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>[{lang:'en',localService:true}];speechSynthesis.speak=u=>said.push(u.text);});await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#write-message').click();await page.locator('#compose-text').fill('Please tell me about your day');
 await page.evaluate(()=>{const write=Storage.prototype.setItem;let rejectNext=true;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1'&&rejectNext){rejectNext=false;throw new DOMException('Full','QuotaExceededError');}return write.call(this,k,v);};});
 await page.locator('#compose-save').click();assert.match(await page.locator('#compose-saved').textContent(),/Could not save/);assert.equal(await page.locator('#compose-text').inputValue(),'Please tell me about your day');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases.length),0);
 // The composer's subsequent draft save must not persist a rejected personal phrase.
 await page.locator('#compose-speak').click();assert.deepEqual(await page.evaluate(()=>said),['Please tell me about your day']);await page.locator('#compose-save').click();assert.equal(await page.locator('#compose-saved').textContent(),'Saved to My phrases');await page.locator('#compose-save').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases.length),1);
 await page.reload();await page.locator('#write-message').click();assert.equal(await page.locator('#compose-text').inputValue(),'Please tell me about your day');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases.length),1);
 console.log('PASS rejected composed phrase is not persisted by later draft save, message remains speakable, clear error, clean retry and reload without duplicates');
}finally{await browser.close();}
