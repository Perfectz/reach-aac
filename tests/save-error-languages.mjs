import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const expected={en:'Settings could not be saved',zh:'无法保存设置',hi:'सेटिंग्स सहेजी नहीं जा सकीं',es:'No se pudo guardar',ar:'تعذّر حفظ الإعدادات',th:'บันทึกการตั้งค่าไม่ได้'};
 for(const [language,prefix] of Object.entries(expected)){
  const context=await browser.newContext(),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator(`[data-lang=${language}]`).click();
  await page.evaluate(()=>{const write=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='reach-profiles-v1')throw new DOMException('Full','QuotaExceededError');return write.call(this,k,v);};});
  await page.locator(`[data-lang=${language==='en'?'ar':'en'}]`).click();assert.ok((await page.locator('#toast').textContent()).startsWith(prefix));assert.equal(await page.locator('html').getAttribute('lang'),language);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).language),language);await context.close();
 }
 console.log('PASS save errors in all six interface languages, including rejected language changes retaining original language');
}finally{await browser.close();}
