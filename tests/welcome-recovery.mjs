import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('[data-welcome-lang=es]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('reach-welcomed')),null);await page.reload();await page.locator('#welcome-setup').waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'es');
 await page.locator('#welcome-setup').click();await page.reload();await page.locator('#welcome-setup').waitFor();await page.locator('#welcome-touch').click();await page.reload();assert.equal(await page.locator('#modal').isVisible(),false);assert.equal(await page.evaluate(()=>localStorage.getItem('reach-welcomed')),'1');
 const second=await browser.newContext(),setup=await second.newPage();await setup.goto('http://localhost:4173');await setup.locator('#welcome-setup').click();await setup.locator('#guide-lang-en').click();await setup.locator('#guide-reading-larger').click();await setup.locator('#guide-position-reclined').click();await setup.locator('#guide-input-touch').click();await setup.locator('#guide-apply').click();await setup.locator('#practice-start').waitFor();await setup.reload();assert.equal(await setup.locator('#modal').isVisible(),false);assert.ok(await setup.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).setupGuide));
 console.log('PASS interrupted welcome/guide returns in chosen language; explicit touch dismissal and successfully applied guide survive reload without repeating welcome');
}finally{await browser.close();}
