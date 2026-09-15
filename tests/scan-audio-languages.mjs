import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const [language,expected,voiceLanguage,missing] of [['en','مرحبا','ar',false],['es','Hola','es',false],['en','مرحبا','ar',true]]){
  const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(15000);
  await page.addInitScript(({language,missing})=>{
   localStorage.setItem('reach-welcomed','1');localStorage.setItem('reach-settings',JSON.stringify({language,mode:'switch',scanAudio:true,scan:2000,voice:true,phrases:[{id:'custom-ar',en:'مرحبا',sourceLanguage:'ar',translations:{ar:'مرحبا',es:'Hola'}}]}));
   window.output=[];window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>['en','es',...(missing?[]:['ar'])].map(lang=>({lang:lang+'-XX',localService:true}));speechSynthesis.speak=u=>{output.push({text:u.text,lang:u.lang});queueMicrotask(()=>u.onend?.());};
  },{language,missing});
  await page.goto('http://localhost:4173');await page.locator('#board-topics').click();await page.locator('#modal [data-category=mine]').click();
  const tile=page.locator('[data-phrase=custom-ar]');assert.equal(await tile.locator('.tile-label').getAttribute('lang'),voiceLanguage);assert.equal(await tile.locator('.tile-label').textContent(),expected);assert.equal(await tile.locator('.tile-label').getAttribute('dir'),'auto');
  await page.locator('#scan-start').click();await page.waitForFunction(()=>document.querySelector('[data-phrase=custom-ar]').classList.contains('scanning'));
  if(missing){await page.waitForFunction(()=>document.querySelector('#scan-audio-live').textContent.includes('No matching offline voice'));assert.equal(await page.evaluate(()=>output.length),0);}
  else{await page.waitForFunction(()=>output.length>0);const preview=await page.evaluate(()=>output[0]);assert.equal(preview.lang,voiceLanguage+'-XX');assert.ok(preview.text.endsWith(expected));await page.keyboard.press('Space');await page.waitForFunction(()=>output.length===2);assert.equal(await page.evaluate(()=>output[1].text),expected);assert.equal(await page.evaluate(()=>output[1].lang),voiceLanguage+'-XX');}
  await context.close();
 }
 console.log('PASS source-language preview and committed speech, explicit translation, RTL text metadata, and no wrong-language fallback when voice is absent');
}finally{await browser.close();}
