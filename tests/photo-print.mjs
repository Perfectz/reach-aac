import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();
 await page.evaluate(()=>{const c=document.createElement('canvas');c.width=80;c.height=60;c.getContext('2d').fillRect(0,0,80,60);const data=JSON.parse(localStorage.getItem('reach-profiles-v1')),p=data.people.find(p=>p.id===data.activeId);p.settings.language='ar';p.settings.phrases=[{id:'custom-photo',en:'صورة العائلة',sourceLanguage:'ar',translations:{ar:'صورة العائلة'},photo:c.toDataURL('image/jpeg'),icon:'Heart'}];p.settings.packs={homeCare:['yes','no','custom-photo']};localStorage.setItem('reach-profiles-v1',JSON.stringify(data));});
 await page.reload();await page.emulateMedia({media:'print'});await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.locator('.phrase-photo').evaluate(img=>img.decode());
 assert.equal(await page.locator('#board [data-phrase]').count(),3);assert.equal(await page.locator('.phrase-photo').evaluate(img=>img.naturalWidth),80);assert.match(await page.locator('.board-heading').getAttribute('data-print-instructions'),/أشر/);assert.equal(await page.locator('#access-dock').isVisible(),false);assert.equal(await page.locator('.phrase-photo').isVisible(),true);await page.screenshot({path:'artifacts/photo-print-ar.png',fullPage:true});await page.pdf({path:'artifacts/photo-board-ar.pdf',format:'A4',printBackground:true});
 await page.emulateMedia({media:'screen'});await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));assert.equal(await page.locator('#access-dock').isVisible(),true);assert.equal(await page.locator('.phrase-photo').count(),1);
 console.log('PASS photo decoding and full preset in print, Arabic partner instructions, PDF generation and restored screen controls');
}finally{await browser.close();}

