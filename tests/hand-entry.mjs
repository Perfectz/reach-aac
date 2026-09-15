import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 await page.addInitScript(()=>{window.cameraRequests=0;navigator.mediaDevices.getUserMedia=async()=>{cameraRequests++;throw new DOMException('Test denial','NotAllowedError');};});
 await page.goto('http://localhost:4173');
 await page.locator('#welcome-hand').click();
 assert.equal(await page.locator('[name=mode][value=hand]').isChecked(),true);
 assert.equal(await page.locator('#camera-start').isVisible(),true);
 assert.equal(await page.evaluate(()=>cameraRequests),0);
 assert.equal(await page.locator('#calibrate').isDisabled(),true);
 await page.locator('#camera-start').click();
 await page.waitForFunction(()=>!document.querySelector('#camera-start').disabled);
 assert.equal(await page.evaluate(()=>cameraRequests),1);
 assert.match(await page.locator('#camera-status').textContent(),/denied/);
 await page.locator('[name=mode][value=switch]').check();
 await page.locator('#input-done').click();
 await page.reload();
 await page.locator('#change-input').click();
 assert.equal(await page.locator('[name=mode][value=switch]').isChecked(),true);
 assert.equal(await page.evaluate(()=>cameraRequests),0);
 await page.locator('#input-done').click();
 await page.locator('#hand-shortcut').click();
 assert.equal(await page.locator('[name=mode][value=hand]').isChecked(),true);
 assert.equal(await page.evaluate(()=>cameraRequests),0);
 await page.locator('#input-done').click();
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:844});
  assert.equal(await page.locator('#hand-shortcut').isVisible(),true);
  assert.equal(await page.locator('#eye-shortcut').isVisible(),true);
  const header=await page.locator('.topbar').evaluate(e=>({scroll:e.scrollWidth,width:e.clientWidth,buttons:[...e.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,right:r.right,width:r.width};})}));
  assert.ok(header.scroll<=header.width+1,JSON.stringify({width,header}));
  assert.ok(header.buttons.every(b=>b.x>=0&&b.right<=width&&b.width>=44),JSON.stringify({width,header}));
 }
 await context.close();
 const failed=await browser.newContext(),failure=await failed.newPage();
 await failure.goto('http://localhost:4173');
 await failure.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');};});
 await failure.locator('#welcome-hand').click();
 assert.equal(await failure.locator('#welcome-hand').isVisible(),true);
 assert.equal(await failure.locator('#camera-start').count(),0);
 console.log('PASS welcome and header hand entry keep camera off, denied hand camera permits retry, saved switch preference survives reload, failed save keeps welcome, hand/eye shortcuts fit 320–1440px');
}finally{await browser.close();}
