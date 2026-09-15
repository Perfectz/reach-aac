import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=switch]').check();await page.locator('#scan-time').fill('2000');await page.locator('#input-done').click();await page.locator('#scan-start').click();
 await page.waitForFunction(()=>document.querySelector('#board .scanning'));
 const id=await page.locator('.scanning').getAttribute('data-phrase');assert.ok(id);
 // Model window focus loss separately from a hidden tab (which stops scanning).
 await page.evaluate(()=>{window.testFocus=false;Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>window.testFocus});window.dispatchEvent(new Event('blur'));});
 await page.waitForTimeout(2500);await page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true})));assert.equal(await page.locator('#message').textContent(),'Choose a tile to say something.');assert.equal(await page.locator('.scanning').getAttribute('data-phrase'),id);
 await page.evaluate(()=>{window.testFocus=true;window.dispatchEvent(new Event('focus'));});await page.waitForTimeout(900);assert.equal(await page.locator('.scanning').getAttribute('data-phrase'),id);await page.waitForFunction(old=>document.querySelector('.scanning')?.dataset.phrase!==old,id,{timeout:2500});
 await page.locator('#scan-start').click();await page.evaluate(()=>{window.dispatchEvent(new Event('blur'));window.dispatchEvent(new Event('focus'));});await page.waitForTimeout(300);assert.equal(await page.locator('#scan-start').innerText(),'Start scanning');assert.equal(await page.locator('.scanning').count(),0);
 console.log('PASS simulated focus loss blocks activation; return grants full interval; stopped scanning stays stopped');
}finally{await browser.close();}
