import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();
 for(const name of ['composer','languages'])await context.route(`**/qa/${name}.js`,r=>r.fulfill({contentType:'text/javascript',path:`src/${name}.js`}));
 await page.goto('http://localhost:4173');
 for(const language of ['en','ar','es']){
  await page.evaluate(async language=>{
   const {MessageDraft,mountComposer}=await import('/qa/composer.js');document.querySelector('#modal')?.close();const root=document.createElement('section');document.querySelector('#qa-composer')?.remove();root.id='qa-composer';document.body.append(root);
   const draft=new MessageDraft(language);mountComposer(root,{draft,uiLanguage:'en',phrases:[{id:'custom-ar',en:'مرحبا',sourceLanguage:'ar',translations:{ar:'مرحبا',es:'Hola'}}],onSpeak(){},onSave(){},onClose(){},onTransition(){},onStop(){}});
  },language);
  const choice=page.locator('#qa-composer #compose-choice-0');assert.equal(await choice.isDisabled(),language==='en');assert.equal(await choice.getAttribute('lang'),language==='es'?'es':'ar');
  if(language==='en'){assert.equal(await page.locator('#compose-missing-translation').isVisible(),true);await choice.evaluate(b=>b.click());assert.equal(await page.locator('#compose-text').inputValue(),'');}
  else{await choice.click();assert.equal(await page.locator('#compose-text').inputValue(),language==='ar'?'مرحبا':'Hola');assert.equal(await page.locator('#compose-missing-translation').count(),0);}
 }
 console.log('PASS untranslated phrase blocked without moving its slot; original and explicit translation insert correctly with independent interface language');
}finally{await browser.close();}
