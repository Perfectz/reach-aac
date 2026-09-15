import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import {ui,languages} from '../src/languages.js';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const {id:language} of languages){
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator(`[data-welcome-lang=${language}]`).click();assert.equal(await page.locator('#dialog-title').textContent(),ui('welcomeTitle',language));assert.equal(await page.locator('#welcome-touch').textContent(),ui('welcomeTouch',language));assert.equal(await page.locator('#dialog-body .intro').textContent(),ui('welcomeSteps',language));assert.equal(await page.locator('html').getAttribute('lang'),language);assert.equal(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);
  assert.equal((await page.locator('#welcome-hand').textContent()).trim(),ui('welcomeHand',language));
  await page.locator('#welcome-setup').click();assert.equal(await page.locator('#dialog-body').getAttribute('lang'),language);await page.locator('#close-dialog').click();await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),language);await context.close();
 }
 const context=await browser.newContext(),page=await context.newPage();await page.goto('http://localhost:4173');await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');};});await page.locator('[data-welcome-lang=ar]').click();assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.equal(await page.locator('#dialog-title').textContent(),ui('welcomeTitle','en'));await page.locator('#welcome-touch').click();assert.equal(await page.locator('#modal').isVisible(),false);
 console.log('PASS first-screen six-language choice, translated welcome, accessible phone layout, guide language handoff, persistence and rejected language save');
}finally{await browser.close();}
