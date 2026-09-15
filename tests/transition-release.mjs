import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1100}});
 await context.addInitScript(()=>{
  window.handSample={x:.5,y:.5};
  navigator.mediaDevices.getUserMedia=async()=>{const c=document.createElement('canvas');c.width=640;c.height=480;const ctx=c.getContext('2d');let n=0;const timer=setInterval(()=>{ctx.fillStyle=n++%2?'#444':'#555';ctx.fillRect(0,0,640,480);},30);const stream=c.captureStream(30),track=stream.getVideoTracks()[0],stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);stop();};return stream;};
 });
 await context.route('**/assets/vision_bundle-*.js',r=>r.fulfill({contentType:'text/javascript',body:`export const FilesetResolver={forVisionTasks:async()=>({})};export const HandLandmarker={createFromOptions:async()=>({detectForVideo:()=>({landmarks:window.handSample?[Array.from({length:21},()=>window.handSample)]:[]}),close(){}})};`}));
 const page=await context.newPage();await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();await page.locator('#change-input').click();await page.locator('[value=hand]').check();await page.locator('#dwell-time').fill('600');await page.locator('#camera-start').click();await page.waitForFunction(()=>document.querySelector('#finger-marker')?.hidden===false);await page.locator('#calibrate').click();await page.locator('#input-done').click();await page.locator('#settings').click();
 const pointAt=async point=>page.evaluate(({x,y})=>window.handSample={x:.5-(x/innerWidth-.5)/3,y:.5+(y/innerHeight-.5)/3},point);
 await pointAt({x:10,y:10});await page.waitForTimeout(300);await page.locator('#review-toggle').scrollIntoViewIfNeeded();const box=await page.locator('#review-toggle').boundingBox(),center={x:box.x+box.width/2,y:box.y+box.height/2};
 const review=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('reach-settings')).review);const initial=await review();await pointAt(center);await page.waitForFunction(v=>JSON.parse(localStorage.getItem('reach-settings')).review!==v,initial);await page.waitForTimeout(1600);assert.equal(await review(),!initial);
 assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('button')?.id,center),'review-toggle');
 // Unrelated mouse movement must never release a lost camera pointer.
 await page.evaluate(()=>window.handSample=null);await page.mouse.move(0,0);await page.waitForTimeout(400);await pointAt(center);await page.waitForTimeout(1700);assert.equal(await review(),!initial);
 await pointAt({x:10,y:10});await page.waitForTimeout(400);await page.locator('#review-toggle').scrollIntoViewIfNeeded();const next=await page.locator('#review-toggle').boundingBox();await pointAt({x:next.x+next.width/2,y:next.y+next.height/2});await page.waitForFunction(v=>JSON.parse(localStorage.getItem('reach-settings')).review===v,initial);
 console.log('PASS camera selection survives replaced controls without repeat; signal loss and mouse movement do not release; deliberate camera exit permits next selection');
}finally{await browser.close();}
