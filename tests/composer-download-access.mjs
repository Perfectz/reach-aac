import {chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const mode of ['dwell','switch']){
  const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
  await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator(`[value=${mode}]`).check();await page.locator('#dwell-time').fill('600');await page.locator('#scan-time').fill('1000');await page.locator('#input-done').click();
  await page.locator('#write-message').click();const message='Please ask me one question at a time.';await page.locator('#compose-text').fill(message);await page.mouse.move(0,0);
  if(mode==='switch'){await page.locator('#compose-close').click();await page.locator('#scan-start').click();await page.locator('#write-message').click();}
  let count=0;page.on('download',()=>count++);const event=page.waitForEvent('download',{timeout:45000});
  if(mode==='dwell')await page.locator('#compose-download').hover();
  else{await page.waitForFunction(()=>document.querySelector('#compose-download')?.classList.contains('scanning'),null,{timeout:40000});await page.keyboard.press('Space');}
  const file=await event;assert.equal(await readFile(await file.path(),'utf8'),message);await page.waitForTimeout(2200);assert.equal(count,1);assert.equal(await page.locator('#compose-text').inputValue(),message);assert.equal(await page.locator('#modal[open]').count(),1);
  console.log(`PASS ${mode}: download selected through input system, exact message and no repeat activation`);await context.close();
 }
}finally{await browser.close();}
