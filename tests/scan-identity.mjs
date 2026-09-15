import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=switch]').check();await page.locator('#scan-time').fill('1000');await page.locator('#input-done').click();await page.locator('#scan-start').click();await page.locator('#change-input').click();
 await page.waitForFunction(()=>document.querySelector('#dwell-time-more').classList.contains('scanning'),{},{timeout:30000});const before=Number(await page.locator('#dwell-time').inputValue());
 await page.evaluate(()=>{window.wrongSelections=0;const b=document.createElement('button');b.id='unexpected-choice';b.textContent='Inserted choice';b.onclick=()=>wrongSelections++;document.querySelector('#dialog-body').prepend(b);});await page.waitForTimeout(100);assert.equal(await page.locator('#dwell-time-more').evaluate(b=>b.classList.contains('scanning')),true);await page.keyboard.press('Space');assert.equal(Number(await page.locator('#dwell-time').inputValue()),before+100);assert.equal(await page.evaluate(()=>wrongSelections),0);
 // Disable the visually highlighted item and select synchronously before the next frame.
 await page.waitForTimeout(2000);const changed=await page.evaluate(()=>{window.unexpectedClicks=0;document.addEventListener('click',()=>unexpectedClicks++,{capture:true,once:true});const b=document.querySelector('.scanning');if(!b)throw Error('No highlighted control');b.disabled=true;const id=b.id;document.dispatchEvent(new KeyboardEvent('keydown',{key:' ',bubbles:true}));return id;});assert.ok(changed);assert.equal(await page.evaluate(()=>unexpectedClicks),0);assert.equal(await page.evaluate(()=>wrongSelections),0);
 console.log('PASS real switch selection preserves highlighted control after insertion and refuses a disabled highlight');
}finally{await browser.close();}

