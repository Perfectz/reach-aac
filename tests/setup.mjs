import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext();const page=await context.newPage();
const results=[];
await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();
assert.equal(await page.locator('[data-phrase="water"]').count(),1);
await page.locator('#settings').click();await page.locator('#quick-advanced').click();await page.locator('#setting-vocabulary').selectOption('hospital');await page.locator('#settings-done').click();await page.locator('[data-scroll="1"]').click();assert.equal(await page.locator('[data-phrase="suction"]').count(),1);results.push('Home and hospital vocabulary pages');
await page.locator('#settings').click();await page.locator('#quick-advanced').click();const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const exported=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(exported.settings.profile,'hospital');
await page.locator('#setting-vocabulary').selectOption('homeCare');await page.locator('#import').setInputFiles({name:'setup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});assert.equal(await page.locator('#setting-vocabulary').inputValue(),'hospital');results.push('Export/import round-trip');
await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"app":"wrong"}')});await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('exported Reach'));assert.match(await page.locator('#toast').innerText(),/exported Reach/);assert.equal(await page.locator('#modal #toast').count(),1);results.push('Invalid import explains error without replacing settings');
await page.locator('#open-input').click();await page.locator('[value="motion"]').check();await page.evaluate(()=>navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');});await page.locator('#camera-start').click();assert.match(await page.locator('#camera-status').innerText(),/access was denied/);assert.equal(await page.locator('#camera-start').isEnabled(),true);await page.locator('[value="touch"]').check();await page.locator('#input-done').click();await page.locator('#dock-home').click();await page.locator('[data-phrase="yes"]').click();assert.equal(await page.locator('#message').innerText(),'Yes');results.push('Camera denial retains usable touch fallback');
await page.setViewportSize({width:320,height:740});const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);results.push('320px board accessibility audit');
await writeFile('artifacts/setup-results.json',JSON.stringify(results,null,2));console.log(results.map(r=>'PASS '+r).join('\n'));await browser.close();


