import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(15000);
 await page.addInitScript(()=>{
  const open=IDBFactory.prototype.open;let blocked=true;
  IDBFactory.prototype.open=function(name,...args){if(name==='reach-boards'&&blocked){blocked=false;throw new DOMException('Temporarily unavailable','SecurityError');}return open.call(this,name,...args);};
 });
 await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator('#quick-advanced').click();await page.locator('#setting-language-choice-es').click();await page.locator('#settings-done').click();await page.locator('#settings').click();await page.locator('#open-imported-boards').click();
 await page.locator('#import-library-retry').waitFor();assert.match(await page.locator('#imported-status').textContent(),/La biblioteca/);await page.locator('#import-failure-toggle').click();assert.match(await page.locator('#import-failure-message').textContent(),/Temporarily unavailable/);
 await page.locator('#import-library-retry').click();await page.waitForFunction(()=>document.querySelector('#imported-status').textContent.includes('Todavía'));assert.equal(await page.locator('#import-failure-details').count(),0);
 await page.locator('#board-import-file').setInputFiles({name:'broken.obf',mimeType:'application/json',buffer:Buffer.from('{broken')});await page.locator('#import-failure-toggle').waitFor();assert.match(await page.locator('#imported-status').textContent(),/No se pudo leer/);assert.equal(await page.locator('#import-board-save').count(),0);await page.locator('#import-review-cancel').click();
 const upload=()=>page.locator('#board-import-file').setInputFiles('tests/fixtures/reach-media.obf');await upload();await page.locator('#import-board-save').click();await page.locator('[id^=open-board-]').waitFor();const first=await page.locator('[id^=open-board-]').getAttribute('id');
 await upload();await page.evaluate(()=>{const add=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(...args){if(this.name==='boards'){IDBObjectStore.prototype.add=add;throw new DOMException('Full','QuotaExceededError');}return add.apply(this,args);};});await page.locator('#import-board-save').click();await page.locator('#import-failure-toggle').waitFor();assert.match(await page.locator('#imported-status').textContent(),/El tablero no se guardó/);assert.equal(await page.locator('#import-board-save').isEnabled(),true);
 await page.locator('#import-board-save').click();await page.waitForFunction(()=>document.querySelectorAll('[id^=open-board-]').length===2);assert.equal(await page.locator('#'+first).count(),1);assert.equal(await page.locator('#import-failure-details').count(),0);
 await page.locator('#imported-close').click();await page.reload();await page.locator('#settings').click();await page.locator('#open-imported-boards').click();await page.locator('#import-library-retry').click();await page.waitForFunction(()=>document.querySelectorAll('[id^=open-board-]').length===2);
 console.log('PASS initial synchronous storage failure recovery, translated file/save errors, retry without re-upload, preservation of existing boards and reload');
}finally{await browser.close();}
