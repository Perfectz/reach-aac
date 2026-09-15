import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const [width,height,standard,eyes] of [[390,844,4,4],[320,640,2,4],[768,1024,8,6],[1024,768,8,6],[1440,1000,12,8]]){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();assert.equal(await page.locator('#board .tile').count(),standard);
  const audit=()=>page.locator('#board .tile').evaluateAll(tiles=>tiles.map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,clipped:e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1};}));const geometry=await audit();assert.ok(geometry.every(r=>r.width>=120&&r.height>=65&&!r.clipped),JSON.stringify({width,height,geometry}));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(width===1440){await page.screenshot({path:'artifacts/responsive-desktop.png'});await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.querySelectorAll('#board .tile').length===4);await page.setViewportSize({width,height});await page.waitForFunction(()=>document.querySelectorAll('#board .tile').length===12);}
  await page.locator('#eye-shortcut').click();await page.locator('#close-dialog').click();assert.equal(await page.locator('#board .tile').count(),eyes);const eyeGeometry=await audit();assert.ok(eyeGeometry.every(r=>!r.clipped),JSON.stringify({width,height,eyeGeometry}));const first=await page.locator('#board [data-phrase]').evaluateAll(es=>es.map(e=>e.dataset.phrase));assert.deepEqual(first.slice(0,3),['yes','no','help']);await page.locator('#eye-more').click();assert.ok(await page.locator('#board [data-phrase]').count()>0);
  const morePosition=await page.locator('#eye-more').boundingBox();const pageCount=Number((await page.locator('#eye-more .tile-secondary').textContent()).split('/')[1]);for(let i=0;i<pageCount;i++){await page.locator('#eye-more').click();assert.equal(await page.locator('#board').evaluate(e=>e.children.length),eyes);const r=await page.locator('#eye-more').boundingBox();assert.ok(Math.abs(r.x-morePosition.x)<1&&Math.abs(r.y-morePosition.y)<1);}
  await page.locator('#settings').click();await page.locator('#quick-advanced').click();await page.locator('#setting-layout-choice-simple').click();await page.locator('#close-dialog').click();assert.equal(await page.locator('#board .tile').count(),4);await context.close();
 }
 console.log('PASS phone/tablet/desktop density, resize adaptation, tile geometry, eye pagination and explicit Larger tiles override');
}finally{await browser.close();}
