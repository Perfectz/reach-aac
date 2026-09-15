import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {ui,languages} from '../src/languages.js';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const {id:language} of languages){
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  await page.addInitScript(()=>{window.cameraError='NotAllowedError';navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Test camera error',window.cameraError);};});
  await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#settings').click();await page.locator(`[data-lang=${language}]`).click();await page.locator('#quick-input').click();await page.locator('[value=eye]').check();
  assert.deepEqual(await page.locator('#eye-setup-info p').allTextContents(),['eyeSetupSteps','eyeSetupPrivacy','eyeSetupAccess'].map(key=>ui(key,language)));
  assert.equal(await page.locator('#modal').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  await page.locator('#input-done').click();await page.waitForFunction(text=>document.querySelector('#input-hint').textContent===text,ui('eyeOff',language));await page.locator('#eye-shortcut').click();
  assert.equal(await page.locator('#eye-start').textContent(),ui('eyeSetup',language));await page.locator('#eye-start').click();
  for(const [id,key] of [['eye-title','eyeSetup'],['eye-exit','eyeCancel'],['eye-begin','eyeBegin'],['eye-use','eyeUse'],['eye-retry','eyeRetry'],['eye-collect','eyeCollect'],['eye-redo','eyeRedo'],['eye-break','eyeBreak'],['eye-restart-all','eyeRestart'],['eye-detail','eyePosition']])assert.equal(await page.locator('#'+id).textContent(),ui(key,language));
  assert.deepEqual(await page.locator('#eye-pace-label button').allTextContents(),['eyeGentle','eyeExtra','eyeManual'].map(key=>ui(key,language)));
  for(const value of ['5000','manual','3000']){await page.locator('#eye-pace-'+value).click();assert.equal(await page.locator('#eye-pace-'+value).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#eye-pace-label [aria-pressed=true]').count(),1);}
  assert.equal(await page.locator('#eye-pace-label').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true);
  assert.equal(await page.locator('#eye-status').textContent(),ui('cameraDenied',language));assert.equal(await page.locator('#eye-begin').isDisabled(),true);assert.equal(await page.locator('#eye-use').isHidden(),true);
  assert.equal(await page.locator('#eye-calibration').getAttribute('dir'),language==='ar'?'rtl':'ltr');
  assert.equal(await page.locator('#eye-calibration').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
  await page.locator('#eye-exit').click();await page.locator('#eye-calibration').waitFor({state:'detached'});
  for(const [error,key] of [['NotFoundError','cameraMissing'],['NotReadableError','eyeStartFailed']]){
   await page.evaluate(value=>window.cameraError=value,error);await page.locator('#eye-shortcut').click();await page.locator('#eye-start').click();assert.equal(await page.locator('#eye-status').textContent(),ui(key,language));await page.keyboard.press('Escape');await page.locator('#eye-calibration').waitFor({state:'detached'});
  }
  await page.locator('#change-input').click();await page.locator('[value=touch]').check();await page.locator('#input-done').click();const yes=await page.locator('[data-phrase=yes] .tile-label').textContent();await page.locator('[data-phrase=yes]').click();assert.equal(await page.locator('#message').textContent(),yes);
  await context.close();
 }
 console.log('PASS eye controls, pacing, RTL/narrow layout, denied/missing/startup errors, button/Escape cancellation and alternate input across six languages');
}finally{await browser.close();}
