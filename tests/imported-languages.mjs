import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();page.setDefaultTimeout(15000);
 await page.addInitScript(()=>{window.spoken=[];window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>[{lang:'en-US',name:'English',localService:true}];speechSynthesis.speak=u=>spoken.push({text:u.text,lang:u.lang});});
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator('#open-imported-boards').click();
 await page.locator('#board-import-file').setInputFiles('tests/fixtures/reach-media.obf');await page.locator('#import-board-save').click();await page.locator('[id^=open-board-]').waitFor();const board=await page.locator('[id^=open-board-]').getAttribute('id');await page.locator('#imported-close').click();
 const expected={en:'Speak',zh:'朗读',hi:'बोलें',es:'Hablar',ar:'نطق',th:'พูด'};
 for(const [language,label] of Object.entries(expected)){
  await page.locator('#settings').click();await page.locator('#quick-advanced').click();await page.locator('#setting-language-choice-'+language).click();await page.locator('#settings-done').click();
  await page.locator('#settings').click();await page.locator('#open-imported-boards').click();await page.locator('#'+board).click();await page.locator('#imported-slot-3').click();
  assert.equal(await page.locator('#imported-speak').textContent(),label);assert.equal(await page.locator('#imported-message').textContent(),'My special message');assert.equal(await page.locator('#imported-message').getAttribute('lang'),'en');
  await page.locator('#imported-speak').click();assert.equal(await page.evaluate(()=>spoken.at(-1).text),'My special message');assert.match(await page.evaluate(()=>spoken.at(-1).lang),/^en/);
  assert.equal(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  if(language==='ar'){
   assert.equal(await page.locator('#imported-grid').getAttribute('dir'),'ltr');assert.equal(await page.locator('#imported-page-count').getAttribute('dir'),'ltr');assert.equal(await page.locator('#imported-page-count').textContent(),'1 / 2');
   assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);
   await page.screenshot({path:'artifacts/imported-board-ar.png'});
  }
  await page.locator('#imported-back').click();await page.locator('#'+board).waitFor();
  await page.locator('#board-import-file').setInputFiles('tests/fixtures/reach-media.obf');await page.locator('#import-board-save').waitFor();
  assert.equal(await page.locator('#import-review-slots li').first().getAttribute('lang'),'en');assert.equal(await page.locator('#import-review-slots li').nth(3).getAttribute('lang'),language);
  if(language!=='en'){assert.notEqual(await page.locator('#import-board-save').textContent(),'Save board for this person');assert.notEqual(await page.locator('#import-review-cancel').textContent(),'Cancel');}
  await page.locator('#import-review-cancel').click();await page.locator('#'+board).waitFor();assert.equal(await page.locator('[id^=open-board-]').count(),1);
  const invalid=JSON.parse(await readFile('tests/fixtures/reach-media.obf','utf8'));invalid.buttons[0].actions=[':clear'];
  await page.locator('#board-import-file').setInputFiles({name:'invalid.obf',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});await page.locator('#import-board-save').waitFor();assert.equal(await page.locator('#import-board-save').isDisabled(),true);
  const explanation=await page.locator('#import-review-issues li').first().locator('p').first().textContent();assert.ok(explanation.length>20);if(language!=='en')assert.ok(!explanation.includes('A button contains'));
  assert.equal(await page.locator('#import-issue-detail-0').isVisible(),false);await page.locator('#import-issue-toggle-0').click();assert.equal(await page.locator('#import-issue-toggle-0').getAttribute('aria-expanded'),'true');assert.equal(await page.locator('#import-issue-detail-0').getAttribute('lang'),'en');assert.match(await page.locator('#import-issue-detail-0').textContent(),/actions or board navigation/);await page.locator('#import-issue-toggle-0').click();assert.equal(await page.locator('#import-issue-detail-0').isVisible(),false);
  await page.locator('#import-review-cancel').click();await page.locator('#'+board).waitFor();assert.equal(await page.locator('[id^=open-board-]').count(),1);
  await page.locator('#delete-board-'+board.slice('open-board-'.length)).click();await page.locator('#confirm-board-remove').waitFor();
  if(language!=='en')assert.notEqual(await page.locator('#confirm-board-remove').textContent(),'Remove this board');
  await page.locator('#cancel-board-remove').click();await page.locator('#'+board).waitFor();assert.equal(await page.locator('[id^=open-board-]').count(),1);await page.locator('#imported-close').click();
 }
 console.log('PASS six interface languages, original-language message and speech routing, narrow layout and Arabic accessibility');
}finally{await browser.close();}
