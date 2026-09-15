import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('reach-welcomed','1'));await page.goto('http://localhost:4173');
 async function edit(){await page.locator('#settings').click();await page.locator('#edit-pack').click();}
 await edit();assert.equal(await page.locator('[data-pack-slot="0"]').isDisabled(),true);
 await page.locator('[data-pack-slot="2"]').click();await page.locator('[data-pack-phrase=photos]').click();
 await page.locator('[data-pack-slot="3"]').click();await page.locator('#pack-hide').click();
 assert.equal(await page.locator('#board [data-phrase=pain]').count(),1); // draft has not changed board
 await page.locator('#pack-apply').click();assert.deepEqual(await page.locator('#board').evaluate(e=>[...e.children].map(c=>c.dataset.phrase||null)),['yes','no','photos',null]);
 await page.reload();assert.deepEqual(await page.locator('#board').evaluate(e=>[...e.children].map(c=>c.dataset.phrase||null)),['yes','no','photos',null]);
 await edit();await page.locator('#pack-restore').click();await page.locator('#pack-discard').click();assert.equal(await page.locator('#board [data-phrase=photos]').count(),1);
 console.log('PASS saved replacement, stable empty slot, reload, and discard of restoration draft');
 await page.locator('#board-topics').click();await page.locator('#modal [data-category=mine]').click();await page.locator('#add-first').click();await page.locator('#phrase-en').fill('A personal message');await page.locator('#phrase-form button').click();await page.locator('#phrases-done').click();
 const id=await page.locator('#board [data-phrase]').getAttribute('data-phrase');
 await edit();await page.locator('[data-pack-slot="3"]').click();await page.locator(`[data-pack-phrase="${id}"]`).click();await page.locator('#pack-apply').click();await page.reload();
 await page.locator(`#board [data-phrase="${id}"]`).click();assert.equal(await page.locator('#message').innerText(),'A personal message');
 await edit();await page.locator('#pack-add').click();await page.locator('[data-pack-phrase=repair-wait]').click();await page.locator('#pack-apply').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')));assert.equal(saved.packs.homeCare.length,13);assert.equal(saved.packs.homeCare[12],'repair-wait');
 console.log('PASS stable personal-phrase link and appended repair phrase');
 await page.locator('#settings').click();await page.locator('[data-profile=hospital]').click();await page.locator('#quick-done').click();assert.equal(await page.locator('#board [data-phrase=pain]').count(),1);
 await page.locator('#settings').click();await page.locator('[data-profile=homeCare]').click();await page.locator('[data-lang=ar]').click();await page.locator('#edit-pack').click();
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);await page.screenshot({path:'artifacts/phrase-pack-editor.png'});assert.deepEqual(errors,[]);
 console.log('PASS separate care packs, Arabic editor accessibility and runtime checks');
}finally{await browser.close();}
