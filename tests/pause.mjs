import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import {ui,languages} from '../src/languages.js';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const {id:language} of languages){
  const context=await browser.newContext({viewport:{width:320,height:568}}),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator(`[data-lang=${language}]`).click();await page.locator('#quick-done').click();await page.locator('[data-phrase=yes]').click();const message=await page.locator('#message').textContent();
  await page.locator('#pause').click();assert.equal(await page.locator('#pause-overlay').evaluate(e=>e.matches(':modal')),true);assert.equal(await page.locator('#pause-title').textContent(),ui('paused',language));assert.equal(await page.locator('#resume').textContent(),ui('resume',language));assert.equal(await page.evaluate(()=>document.activeElement.id),'resume');
  await page.locator('[data-phrase=no]').evaluate(e=>e.focus());assert.equal(await page.evaluate(()=>document.activeElement.id),'resume');
  assert.equal(await page.locator('#resume').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;}),true);
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);
  await page.keyboard.down('Enter');await page.keyboard.down('Enter');await page.keyboard.down('Enter');await page.keyboard.up('Enter');assert.equal(await page.locator('#pause-overlay').isVisible(),false);assert.equal(await page.evaluate(()=>document.activeElement.id),'pause');assert.equal(await page.locator('#message').textContent(),message);
  await page.keyboard.down('Escape');await page.keyboard.down('Escape');await page.keyboard.down('Escape');assert.equal(await page.locator('#pause-overlay').isVisible(),true);await page.keyboard.up('Escape');await page.keyboard.press('Escape');assert.equal(await page.locator('#pause-overlay').isVisible(),false);assert.equal(await page.locator('#message').textContent(),message);await context.close();
 }
 console.log('PASS six-language pause modal, native focus isolation, keyboard resume/Escape, narrow layout, retained message and accessibility checks');
}finally{await browser.close();}
