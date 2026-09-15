import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 await page.addInitScript(()=>{window.speechStops=0;speechSynthesis.cancel=()=>speechStops++;});
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('[data-phrase=yes]').click();await page.locator('#settings').click();await page.locator('#quick-advanced').click();await page.locator('#open-phrases').click();const stops=await page.evaluate(()=>speechStops);
 const count=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases.length);
 await page.locator('#create-personal-phrase').click();assert.equal(await page.locator('#phrase-language-fields textarea:visible').count(),1);await page.locator('#edit-translations').click();assert.equal(await page.locator('#phrase-language-fields textarea:visible').count(),6);await page.locator('#edit-text-es').pressSequentially('Hola');assert.equal(await page.locator('#edit-text-es').inputValue(),'Hola');await page.locator('#edit-translations').click();assert.equal(await page.locator('#phrase-language-fields textarea:visible').count(),2);assert.equal(await page.locator('#edit-text-es').inputValue(),'Hola');await page.locator('#edit-source-es').click();assert.equal(await page.locator('#phrase-language-fields textarea:visible').count(),1);assert.equal(await page.locator('#phrase-language-fields textarea').first().getAttribute('id'),'edit-text-es');await page.locator('#edit-cancel').click();assert.equal(await count(),0);
 await page.locator('#create-personal-phrase').click();assert.equal(await page.locator('#edit-save').isDisabled(),true);await page.locator('#edit-large-en').click();await page.locator('#compose-choice-0').click();await page.locator('#compose-choice-0').click();await page.locator('#compose-apply').click();assert.equal(await page.locator('#edit-text-en').inputValue(),'a');assert.equal(await count(),0);await page.locator('#edit-cancel').click();assert.equal(await count(),0);
 await page.locator('#create-personal-phrase').click();await page.locator('#edit-source-ar').click();await page.locator('#edit-large-ar').click();await page.locator('#compose-phrases').click();await page.locator('[data-compose-phrase=yes]').click();await page.locator('#compose-apply').click();assert.equal(await page.locator('#edit-text-ar').inputValue(),'نعم');assert.equal(await page.locator('#edit-text-en').inputValue(),'');assert.equal(await page.locator('#edit-save').isEnabled(),true);
 assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);await page.screenshot({path:'artifacts/create-personal-phrase.png'});
 await page.evaluate(()=>{window.restoreStorage=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return window.restoreStorage.call(this,k,v);};});
 await page.locator('#edit-save').click();assert.equal(await count(),0);assert.equal(await page.locator('#edit-text-ar').inputValue(),'نعم');assert.match(await page.locator('#toast').textContent(),/could not be saved/);
 await page.evaluate(()=>Storage.prototype.setItem=window.restoreStorage);
 await page.locator('#edit-save').click();assert.equal(await count(),1);assert.equal(await page.evaluate(()=>speechStops),stops);assert.equal(await page.locator('#message').textContent(),'Yes');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).phrases[0]);assert.equal(saved.sourceLanguage,'ar');assert.equal(saved.translations.ar,'نعم');assert.equal(saved.translations.en,undefined);assert.match(saved.id,/^custom-/);
 await page.locator('#phrases-done').click();await page.reload();await page.locator('#board-topics').click();await page.locator('#modal [data-category=mine]').click();assert.equal(await page.locator(`[data-phrase="${saved.id}"]`).count(),1);
 console.log('PASS keyboard-free creation, native original language, draft discard, explicit save, stable ID/reload, no output interruption and accessibility');
}finally{await browser.close();}

