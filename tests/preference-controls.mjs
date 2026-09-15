import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();
 await page.locator('#settings').click();await page.locator('#quick-advanced').click();
 await page.locator('#setting-layout-choice-simple').click();assert.equal(await page.locator('#setting-layout').inputValue(),'simple');assert.equal(await page.locator('#setting-layout-choice-simple').getAttribute('aria-pressed'),'true');
 await page.locator('#setting-vocabulary-choice-hospital').click();assert.equal(await page.locator('#setting-vocabulary').inputValue(),'hospital');
 await page.locator('#setting-voice-toggle').click();assert.equal(await page.locator('#setting-voice').isChecked(),false);assert.equal(await page.locator('#setting-voice-toggle').getAttribute('aria-pressed'),'false');
 await page.locator('#setting-voice').check();assert.equal(await page.locator('#setting-voice-toggle').getAttribute('aria-pressed'),'true');
 await page.locator('#setting-contrast-toggle').click();assert.equal(await page.locator('#setting-contrast').isChecked(),true);
 await page.locator('#setting-language-choice-ar').click();assert.equal(await page.locator('#setting-language').inputValue(),'ar');assert.equal(await page.locator('#setting-layout-choice-simple').textContent(),'أزرار أكبر');assert.equal(await page.locator('#setting-language-choice-ar').getAttribute('aria-pressed'),'true');
 await page.setViewportSize({width:320,height:740});assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);assert.equal(await page.evaluate(()=>document.querySelector('#modal').scrollWidth<=document.querySelector('#modal').clientWidth+1),true);await page.locator('#setting-layout-choice-simple').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/preference-controls-ar.png'});
 await page.locator('#settings-done').click();await page.reload();await page.locator('#settings').click();await page.locator('#quick-advanced').click();assert.equal(await page.locator('#setting-vocabulary').inputValue(),'hospital');assert.equal(await page.locator('#setting-layout').inputValue(),'simple');assert.equal(await page.locator('#setting-contrast').isChecked(),true);
 await page.locator('#setting-language-choice-en').click();await page.locator('#open-input').click();await page.locator('[value=dwell]').check();await page.locator('#dwell-time').fill('600');await page.locator('#input-done').click();await page.locator('#settings').click();await page.locator('#quick-advanced').click();
 await page.mouse.move(0,0);await page.locator('#setting-voice-toggle').hover();await page.waitForTimeout(1800);assert.equal(await page.locator('#setting-voice').isChecked(),false);await page.mouse.move(0,0);await page.locator('#setting-voice-toggle').hover();await page.waitForTimeout(1000);assert.equal(await page.locator('#setting-voice').isChecked(),true);await page.mouse.move(0,0);
 console.log('PASS button/native synchronization, language redraw, preserved choices, reload, Arabic narrow accessibility and once-per-visit dwell toggling');
 await page.setViewportSize({width:1280,height:900});await page.locator('#open-input').click();await page.locator('[value=switch]').check();await page.locator('#scan-time').fill('1000');await page.locator('#input-done').click();await page.locator('#scan-start').click();await page.locator('#settings').click();await page.locator('#quick-advanced').click();
 await page.waitForFunction(()=>document.querySelector('#setting-layout-choice-full').classList.contains('scanning'),{},{timeout:45000});await page.keyboard.press('Space');assert.equal(await page.locator('#setting-layout').inputValue(),'full');console.log('PASS layout choice through switch scanning');
}finally{await browser.close();}
