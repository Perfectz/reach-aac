import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const viewport of [{width:320,height:568},{width:844,height:390}])for(const language of ['en','zh','hi','es','ar','th']){
  const context=await browser.newContext({viewport});await context.addInitScript(()=>navigator.mediaDevices.getUserMedia=()=>new Promise(()=>{}));const page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator(`[data-lang=${language}]`).click();await page.locator('#quick-input').click();await page.locator('[value=eye]').check();await page.locator('#eye-start').click();
  const reachable=async selector=>page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();const at=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&(at===e||e.contains(at));});
  for(const id of ['eye-exit','eye-scroll-up','eye-scroll-down'])assert.ok(await reachable('#'+id),`${language} ${viewport.width} ${id}`);
  for(let i=0;i<12;i++)await page.locator('#eye-scroll-down').click();assert.ok(await reachable('#eye-begin'));assert.ok(await reachable('#eye-pace-manual'));await page.locator('#eye-pace-manual').click();assert.equal(await page.locator('#eye-pace-manual').getAttribute('aria-pressed'),'true');
  for(let i=0;i<12;i++)await page.locator('#eye-scroll-up').click();assert.equal(await page.locator('.eye-center').evaluate(e=>e.scrollTop),0);assert.ok(await reachable('.eye-center h2'));assert.ok(await reachable('#eye-exit'));
  if(language==='ar'&&viewport.width===844)await page.screenshot({path:'artifacts/eye-landscape-ar.png'});
  await page.locator('#eye-exit').click();await page.locator('#eye-calibration').waitFor({state:'detached'});await context.close();
 }
 console.log('PASS six-language short portrait/landscape setup, fixed cancel and scroll buttons, reachable pace/start controls, scroll return and cancellation');
}finally{await browser.close();}
