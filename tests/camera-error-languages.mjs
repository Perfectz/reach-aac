import {chromium} from '@playwright/test';import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const prefixes={en:'Camera access was denied',zh:'摄像头访问被拒绝',hi:'कैमरा अनुमति नहीं मिली',es:'Se denegó el acceso',ar:'رُفض الوصول',th:'ไม่ได้รับอนุญาต'};
 for(const [language,prefix] of Object.entries(prefixes)){
  const context=await browser.newContext(),page=await context.newPage();await page.addInitScript(()=>{window.cameraError='NotAllowedError';navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Test camera failure',cameraError);};});await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator(`[data-lang=${language}]`).click();await page.locator('#quick-input').click();await page.locator('[value=motion]').check();await page.locator('#camera-start').click();assert.ok((await page.locator('#camera-status').textContent()).startsWith(prefix));assert.equal(await page.locator('#camera-start').isEnabled(),true);
  const denied=await page.locator('#camera-status').textContent();await page.evaluate(()=>cameraError='NotFoundError');await page.locator('#camera-start').click();const missing=await page.locator('#camera-status').textContent();assert.notEqual(missing,denied);await page.evaluate(()=>cameraError='NotReadableError');await page.locator('#camera-start').click();assert.notEqual(await page.locator('#camera-status').textContent(),missing);assert.equal(await page.locator('#motion-practice').isDisabled(),true);
  await page.locator('[value=touch]').check();await page.locator('#input-done').click();const yes=await page.locator('[data-phrase=yes] .tile-label').textContent();await page.locator('[data-phrase=yes]').click();assert.equal(await page.locator('#message').textContent(),yes);await context.close();
 }
 console.log('PASS denied/missing/unreadable camera feedback in six languages, retry controls, unavailable practice and touch fallback');
}finally{await browser.close();}
