import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    localStorage.setItem('reach-welcomed','1');
    window.audioLog=[];
    window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
    Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'en-US',localService:true}],cancel:()=>window.audioLog.push({type:'cancel'}),speak:u=>window.audioLog.push({type:'speak',text:u.text}),addEventListener:()=>{}}});
  });
  await page.goto('http://localhost:4173');
  await page.locator('#settings').click();await page.locator('#review-toggle').click();
  assert.equal(await page.locator('#review-toggle').getAttribute('aria-pressed'),'true');
  await page.locator('#quick-done').click();
  await page.locator('[data-phrase=yes]').click();
  assert.equal(await page.locator('#message-caption').innerText(),'Preview · not spoken');
  assert.equal(await page.evaluate(()=>audioLog.filter(x=>x.type==='speak').length),0);
  await page.locator('#repeat').click();
  assert.equal(await page.evaluate(()=>audioLog.filter(x=>x.type==='speak').at(-1).text),'Yes');
  await page.locator('#stop-speaking').click();
  assert.equal(await page.evaluate(()=>audioLog.at(-1).type),'cancel');
  await page.locator('#wrong-selection').click();
  assert.equal(await page.evaluate(()=>audioLog.filter(x=>x.type==='speak').at(-1).text),'That was a wrong selection. It is not what I meant.');
  await page.locator('#say-wait').click();
  assert.equal(await page.locator('#message').innerText(),'Please give me time to answer.');
  assert.equal(await page.locator('#message-caption').innerText(),'Preview · not spoken');
  await page.locator('#clear').click();assert.equal(await page.evaluate(()=>audioLog.at(-1).type),'cancel');assert.equal(await page.locator('#repeat').isDisabled(),true);
  await page.locator('#help').click();assert.equal(await page.evaluate(()=>audioLog.filter(x=>x.type==='speak').at(-1).text),'I need help');
  await page.reload();await page.locator('[data-phrase=no]').click();assert.equal(await page.locator('#message-caption').innerText(),'Preview · not spoken');
  console.log('PASS review, explicit confirmation, immediate correction/help, stop/clear cancellation and persistence');
  await page.locator('#change-input').click();await page.locator('[value=dwell]').check();await page.locator('#dwell-time').fill('600');await page.locator('#input-done').click();
  await page.locator('#say-unsure').hover();await page.waitForTimeout(800);assert.equal(await page.locator('#message').innerText(),'I am not sure.');
  await page.locator('#repeat').hover();await page.waitForTimeout(1500);assert.equal(await page.evaluate(()=>audioLog.filter(x=>x.type==='speak'&&x.text==='I am not sure.').length),1);
  await page.mouse.move(0,0);
  console.log('PASS dwell selects and confirms once per hover visit');
  for(const viewport of [{width:390,height:844},{width:320,height:640}]){
    await page.setViewportSize(viewport);await page.evaluate(()=>scrollTo(0,0));
    for(const id of ['stop-speaking','wrong-selection','say-wait','say-unsure'])assert.equal(await page.locator('#'+id).evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===el;}),true);
  }
  console.log('PASS repair controls are visible and unobstructed on small screens');
  await page.setViewportSize({width:1280,height:900});
  await page.locator('#change-input').click();await page.locator('[value=switch]').check();await page.locator('#scan-time').fill('1000');await page.locator('#input-done').click();await page.reload();
  await page.locator('#scan-start').click();
  await page.waitForFunction(()=>document.querySelector('#wrong-selection').classList.contains('scanning'),{},{timeout:30000});await page.keyboard.press('Space');
  assert.equal(await page.locator('#message').innerText(),'That was a wrong selection. It is not what I meant.');
  await page.locator('#scan-start').click();console.log('PASS one-switch access to correction');
  const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations.map(v=>v.id),[]);assert.deepEqual(errors,[]);
  await page.screenshot({path:'artifacts/communication-controls.png',fullPage:true});
  console.log('PASS accessibility and runtime checks');
}finally{await browser.close();}
