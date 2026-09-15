import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext();const page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();
 const value=Number(await page.locator('#dwell-time').inputValue());await page.locator('#dwell-time-more').click();assert.equal(Number(await page.locator('#dwell-time').inputValue()),value+100);
 await page.locator('#dwell-time').fill('600');assert.equal(await page.locator('#dwell-time-less').isDisabled(),true);await page.locator('#dwell-time-more').click();assert.equal(await page.locator('#dwell-time').inputValue(),'700');
 await page.locator('#scan-time').fill('8000');assert.equal(await page.locator('#scan-time-more').isDisabled(),true);await page.locator('#scan-time-less').click();assert.equal(await page.locator('#scan-time').inputValue(),'7800');
 await page.locator('[value=hand]').check();await page.locator('#finger-choice-4').click();assert.equal(await page.locator('#finger').inputValue(),'4');assert.equal(await page.locator('#finger-choice-4').getAttribute('aria-pressed'),'true');assert.match(await page.locator('#camera-status').innerText(),/resting position/);
 const gain=Number(await page.locator('#gain').inputValue());await page.locator('#gain-more').click();assert.equal(Number(await page.locator('#gain').inputValue()),gain+0.5);await page.locator('#input-done').click();await page.locator('#change-input').click();assert.equal(await page.locator('#finger').inputValue(),'4');assert.equal(Number(await page.locator('#gain').inputValue()),gain+0.5);
 await page.locator('[value=motion]').check();await page.locator('#threshold').fill('1');assert.equal(await page.locator('#threshold-less').isDisabled(),true);await page.locator('#threshold-more').click();assert.equal(await page.locator('#threshold').inputValue(),'1.5');
 await page.locator('[value=dwell]').check();await page.locator('#dwell-time').fill('600');await page.mouse.move(0,0);await page.locator('#dwell-time-more').hover();await page.waitForTimeout(2000);assert.equal(await page.locator('#dwell-time').inputValue(),'700');await page.mouse.move(0,0);await page.locator('#dwell-time-more').hover();await page.waitForTimeout(1200);assert.equal(await page.locator('#dwell-time').inputValue(),'800');await page.mouse.move(0,0);
 await page.locator('[value=touch]').check();await page.setViewportSize({width:320,height:740});assert.deepEqual((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id),[]);
 assert.equal(await page.evaluate(()=>document.querySelector('#modal').scrollWidth<=document.querySelector('#modal').clientWidth+1),true);
 await page.locator('#dwell-time-more').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/input-adjustments.png'});
 console.log('PASS large timing/gain/threshold buttons, bounds, finger selection, persistence, dwell release, narrow layout and accessibility');
 await page.setViewportSize({width:1280,height:900});await page.locator('[value=switch]').check();await page.locator('#scan-time').fill('1000');await page.locator('#input-done').click();await page.locator('#scan-start').click();await page.locator('#change-input').click();
 const before=await page.locator('#dwell-time').inputValue();await page.waitForFunction(()=>document.querySelector('#dwell-time-more').classList.contains('scanning'),{},{timeout:45000});await page.keyboard.press('Space');assert.equal(Number(await page.locator('#dwell-time').inputValue()),Number(before)+100);console.log('PASS switch selection adjusts dwell timing');
}finally{await browser.close();}

