import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import {presets} from '../src/languages.js';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem('reach-welcomed','1'));
 await page.goto('http://localhost:4173');
 for(const viewport of [{width:1280,height:900},{width:390,height:844},{width:320,height:640},{width:844,height:390}]){
  await page.setViewportSize(viewport);await page.waitForTimeout(300);
  const geo=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,viewport:innerHeight,tiles:[...document.querySelectorAll('#board .tile')].map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height};})}));
  assert.ok(geo.width<=viewport.width,JSON.stringify(geo));
  // Very short landscape preserves readable controls through accessible scrolling.
  if(viewport.height>=640)assert.ok(geo.height<=viewport.height+2,JSON.stringify(geo));
  await page.screenshot({path:`artifacts/pages-${viewport.width}.png`});
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
 for(const profile of Object.keys(presets)){
  await page.locator('#settings').click();await page.locator(`[data-profile=${profile}]`).click();await page.locator('#quick-done').click();
  const found=[];
  do{found.push(...await page.locator('#board [data-phrase]').evaluateAll(els=>els.map(e=>e.dataset.phrase)));if(await page.locator('[data-scroll="1"]').isDisabled())break;await page.locator('[data-scroll="1"]').click();}while(true);
  assert.deepEqual(found,presets[profile]);
 }
 console.log('PASS full phrase coverage and phone/desktop layout');
 await page.locator('#board-topics').click();await page.locator('#modal [data-category=body]').click();assert.match(await page.locator('#page-status').innerText(),/My body/);
 await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert.ok(await page.locator('#board .tile').count()>6);await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));assert.equal(await page.locator('#board .tile').count(),4);
 await page.locator('#dock-home').click();await page.locator('#change-input').click();await page.locator('[value=dwell]').check();await page.locator('#dwell-time').fill('600');await page.locator('#input-done').click();
 await page.locator('[data-scroll="1"]').hover();await page.waitForTimeout(2300);assert.match(await page.locator('#page-status').innerText(),/2 \/ 3/);await page.mouse.move(0,0);await page.locator('[data-scroll="1"]').hover();await page.waitForTimeout(800);assert.match(await page.locator('#page-status').innerText(),/3 \/ 3/);await page.mouse.move(0,0);
 console.log('PASS topics, complete print board and navigation release protection');
 await page.locator('#settings').click();await page.locator('[data-lang=ar]').click();await page.locator('#quick-done').click();
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);assert.deepEqual(errors,[]);console.log('PASS Arabic accessibility and runtime');
 await page.locator('#change-input').click();await page.locator('[value=eye]').check();await page.locator('#input-done').click();await page.reload();
 assert.equal(await page.locator('#board .tile').count(),4);await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));assert.equal(await page.locator('#board .tile').count(),12);await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));assert.equal(await page.locator('#board .tile').count(),4);console.log('PASS eye mode prints the full selected preset then restores its access layout');
}finally{await browser.close();}
