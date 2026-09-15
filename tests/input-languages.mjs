import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const names={en:['Start scanning','Stop scanning'],zh:['开始扫描','停止扫描'],hi:['स्कैन शुरू करें','स्कैन रोकें'],es:['Iniciar barrido','Detener barrido'],ar:['بدء المسح','إيقاف المسح'],th:['เริ่มสแกน','หยุดสแกน']};let english;
 for(const [language,[start,stop]] of Object.entries(names)){
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator(`[data-lang=${language}]`).click();await page.locator('#quick-input').click();
  const descriptions=await page.locator('.input-option small').allTextContents();assert.equal(descriptions.length,6);assert.ok(descriptions.every(t=>t.trim().length>0&&!/^[a-z]+Desc$/.test(t)));if(language==='en')english=descriptions;else descriptions.forEach((text,i)=>assert.notEqual(text,english[i]));
  assert.equal(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await page.locator('[value=switch]').check();await page.locator('#input-done').click();assert.equal(await page.locator('#scan-start').textContent(),start);await page.locator('#scan-start').click();assert.equal(await page.locator('#scan-start').textContent(),stop);await page.locator('#scan-start').click();await page.locator('#change-input').click();await page.locator('[value=hand]').check();await page.locator('#input-done').click();const cameraOff={en:'Camera is off.',zh:'摄像头已关闭',hi:'कैमरा बंद है',es:'La cámara está apagada',ar:'الكاميرا متوقفة',th:'กล้องปิดอยู่'};await page.waitForFunction(prefix=>document.querySelector('#input-hint').textContent.startsWith(prefix),cameraOff[language]);await context.close();
 }
 console.log('PASS six input explanations per language, translated scanning states and narrow dialog geometry across six languages');
}finally{await browser.close();}
