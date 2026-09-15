import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('reach-welcomed','1');localStorage.setItem('reach-settings',JSON.stringify({mode:'dwell',dwell:600,voice:false}));});
 await page.goto('http://localhost:4173');await page.locator('[data-phrase=yes]').click();await page.locator('#take-break').hover();await page.waitForFunction(()=>document.querySelector('#rest-resume'));
 assert.equal(await page.locator('#access-dock').evaluate(e=>e.matches(':popover-open')),false);
 await page.screenshot({path:'artifacts/rest-screen.png'});
 await page.locator('#rest-description').hover();await page.waitForTimeout(900);assert.equal(await page.locator('#message').innerText(),'Yes');
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);
 await page.locator('#rest-resume').hover();await page.waitForFunction(()=>!document.querySelector('#modal').open);await page.waitForTimeout(1000);assert.equal(await page.locator('#message').innerText(),'Yes');
 console.log('PASS dwell rest/resume blocks messages and has accessible modal controls');
 await page.mouse.move(0,0);await page.locator('#change-input').click();await page.locator('[value=switch]').check();await page.locator('#scan-time').fill('1000');await page.locator('#input-done').click();
 await page.locator('#scan-start').click();await page.locator('#take-break').click();await page.waitForFunction(()=>document.querySelector('#rest-resume').classList.contains('scanning'),{},{timeout:10000});await page.keyboard.press('Space');assert.equal(await page.locator('#modal').isVisible(),false);assert.equal(await page.locator('#scan-start').innerText(),'Stop scanning');
 await page.locator('#take-break').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#scan-start').innerText(),'Stop scanning');console.log('PASS switch resume and Escape restore prior scanning');
 await page.locator('#take-break').click();await page.locator('#rest-off').click();assert.equal(await page.locator('#pause-overlay').isVisible(),true);await page.locator('#resume').click();assert.equal(await page.locator('#scan-start').innerText(),'Start scanning');
 assert.deepEqual(errors,[]);console.log('PASS full stop remains distinct and requires deliberate input restart');
}finally{await browser.close();}
