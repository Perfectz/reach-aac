import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1100}});
await context.addInitScript(()=>{
  window.handSample={x:.5,y:.5};
  navigator.mediaDevices.getUserMedia=async()=>{const c=document.createElement('canvas');c.width=640;c.height=480;const ctx=c.getContext('2d');let n=0;const timer=setInterval(()=>{ctx.fillStyle='#444';ctx.fillRect(0,0,640,480);ctx.fillStyle='white';ctx.fillRect(n++%640,10,4,4);},30);const stream=c.captureStream(30);const track=stream.getVideoTracks()[0],stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);stop();};return stream;};
});
// Simulated landmark positions exercise the real camera/UI pipeline deterministically.
await context.route('**/assets/vision_bundle-*.js',r=>r.fulfill({contentType:'text/javascript',body:`export const FilesetResolver={forVisionTasks:async()=>({})};export const HandLandmarker={createFromOptions:async()=>({detectForVideo:()=>({landmarks:window.handSample?[Array.from({length:21},()=>window.handSample)]:[]}),close(){}})};`}));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[name="mode"][value="hand"]').check();await page.locator('#camera-start').click();await page.waitForFunction(()=>document.querySelector('#finger-marker')?.hidden===false);
assert.equal(await page.locator('#camera-pointer').isVisible(),false);
await page.locator('#calibrate').click();await page.waitForFunction(()=>document.querySelector('#camera-pointer').matches(':popover-open'));
assert.match(await page.locator('.pointer-label').innerText(),/Point at a control|s$/);
// Setup now has adjustment buttons at the screen center. Rest outside controls.
await page.evaluate(()=>window.handSample={x:.5-(10/innerWidth-.5)/3,y:.5+(10/innerHeight-.5)/3});await page.waitForTimeout(400);
assert.equal(await page.locator('.dwelling').count(),0);
await page.screenshot({path:'artifacts/pointer-setup.png'});
await page.locator('#input-done').click();
const tile=page.locator('[data-phrase="yes"]');const box=await tile.boundingBox();const center={x:box.x+box.width/2,y:box.y+box.height/2};
await page.evaluate(({x,y})=>window.handSample={x:.5-(x/innerWidth-.5)/3,y:.5+(y/innerHeight-.5)/3},center);
await page.waitForFunction(()=>document.querySelector('[data-phrase="yes"]').classList.contains('dwelling'));
await page.waitForTimeout(250);
assert.match(await page.locator('.pointer-label').innerText(),/Selecting: Yes.*s/);
assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y).closest('button')?.dataset.phrase,center),'yes');
await page.screenshot({path:'artifacts/pointer-selecting.png'});
await page.waitForFunction(()=>document.querySelector('.pointer-label').textContent.includes('Selected: Yes'));
assert.equal(await page.locator('#message').innerText(),'Yes');
await page.evaluate(()=>window.handSample=null);await page.waitForTimeout(250);
assert.equal(await page.locator('#camera-pointer').isVisible(),false);assert.equal(await page.locator('.dwelling').count(),0);assert.match(await page.locator('#input-hint').innerText(),/Hand not visible/);
await page.evaluate(()=>window.handSample={x:.5,y:.5});await page.waitForTimeout(200);assert.equal(await page.locator('#camera-pointer').isVisible(),true);
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
async function pointAt(selector){const b=await page.locator(selector).boundingBox();await page.evaluate(({x,y})=>window.handSample={x:.5-(x/innerWidth-.5)/3,y:.5+(y/innerHeight-.5)/3},{x:b.x+b.width/2,y:b.y+b.height/2});}
await pointAt('#take-break');await page.waitForFunction(()=>document.querySelector('#rest-resume'));
assert.match(await page.locator('#rest-description').innerText(),/Camera stays on/);const beforeRestMessage=await page.locator('#message').innerText();await page.waitForTimeout(1800);assert.equal(await page.locator('#message').innerText(),beforeRestMessage);
await pointAt('#rest-resume');await page.waitForFunction(()=>!document.querySelector('#modal').open,{},{timeout:10000}).catch(async e=>{await page.screenshot({path:'artifacts/rest-debug.png'});console.log(await page.evaluate(()=>({label:document.querySelector('.pointer-label')?.textContent,point:window.handSample,button:document.querySelector('#rest-resume').getBoundingClientRect().toJSON(),status:document.querySelector('#tracking-notice').textContent})));throw e;});await page.waitForTimeout(1800);assert.equal(await page.locator('#message').innerText(),beforeRestMessage);assert.equal(await page.locator('#camera-pointer').isVisible(),true);console.log('PASS finger-only rest/resume preserves camera and prevents fall-through selection');
await pointAt('[data-scroll="1"]');await page.waitForTimeout(3300);assert.match(await page.locator('#page-status').innerText(),/2 \/ 3/);
await pointAt('[data-scroll="-1"]');await page.waitForTimeout(4700);assert.match(await page.locator('#page-status').innerText(),/1 \/ 3/);
await pointAt('#dock-setup');await page.waitForFunction(()=>document.querySelector('#modal').open);
await pointAt('[data-scroll="1"]');await page.waitForTimeout(2000);assert.ok(await page.locator('#modal').evaluate(e=>e.scrollTop)>100);
console.log('PASS finger-driven page navigation and setup-panel scrolling');await page.locator('#close-dialog').click();
await page.locator('#pause').click();assert.equal(await page.locator('#camera-pointer').isVisible(),false);
assert.deepEqual(errors,[]);
await writeFile('artifacts/pointer-results.json',JSON.stringify({passed:['Fingertip marker before calibration','Pointer above setup dialog without selection','Visible target name and dwell countdown','Crosshair does not intercept hit testing','Selection completion feedback','Tracking loss hides cursor and cancels dwell','Tracking reacquisition','Pause hides cursor'],input:'Simulated landmarks and generated video; not a physical hand accuracy test'},null,2));
console.log('PASS 8 camera-pointer checks');await browser.close();

