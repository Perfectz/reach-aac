import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const mode of ['dwell','switch']){
  const context=await browser.newContext({viewport:{width:1280,height:1000}}),page=await context.newPage();page.setDefaultTimeout(15000);
  await page.addInitScript(()=>{window.spoken=[];window.SpeechSynthesisUtterance=function(text){this.text=text;};speechSynthesis.getVoices=()=>[{lang:'en-US',name:'Test',localService:true}];speechSynthesis.speak=u=>spoken.push(u.text);});
  await page.goto('http://localhost:4173');await page.locator('#welcome-touch').click();
  await page.locator('#settings').click();await page.locator('#open-imported-boards').click();
  const board=JSON.parse(await readFile('tests/fixtures/reach-media.obf','utf8'));board.sounds=[];for(const b of board.buttons)delete b.sound_id;
  await page.locator('#board-import-file').setInputFiles({name:'access.obf',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(board))});
  await page.locator('#import-board-save').click();await page.locator('[id^=open-board-]').waitFor();const boardId=await page.locator('[id^=open-board-]').getAttribute('id');await page.locator('#imported-close').click();
  await page.locator('#change-input').click();await page.locator(`[value=${mode}]`).check();await page.locator('#dwell-time').fill('600');await page.locator('#scan-time').fill('1000');await page.locator('#input-done').click();if(mode==='switch')await page.locator('#scan-start').click();
  const select=async id=>{
   if(mode==='dwell'){await page.mouse.move(0,0);await page.waitForTimeout(200);await page.locator('#'+id).hover();await page.waitForTimeout(1000);}
   else{await page.waitForFunction(id=>document.getElementById(id)?.classList.contains('scanning'),id,{timeout:45000}).catch(async error=>{console.log(await page.evaluate(()=>({focus:document.hasFocus(),hidden:document.hidden,scan:document.querySelector('.scanning')?.id,active:document.activeElement?.id,title:document.querySelector('#dialog-title')?.textContent,mode:JSON.parse(localStorage.getItem('reach-settings')).mode})));throw error;});await page.keyboard.press('Space');}
   if(mode==='switch')await page.waitForTimeout(1900); // Existing switch repeat guard is 1800 ms.
  };
  // Setup above may be assisted; these actions exercise the selected input only.
  await page.locator('#settings').click();await select('open-imported-boards');await select(boardId);
  const tile=await page.locator('#imported-slot-3').elementHandle();
  await select('imported-slot-3');assert.match(await page.locator('#imported-message').textContent(),/My special message/);assert.equal(await page.evaluate(()=>spoken.length),0);
  assert.equal(await tile.evaluate(node=>node.isConnected),true);assert.equal(await tile.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#imported-message').getAttribute('lang'),'en');
  await select('imported-speak');await page.waitForFunction(()=>spoken.length===1);await page.waitForTimeout(1800);assert.equal(await page.evaluate(()=>spoken.length),1);
  await select('imported-next');assert.equal(await page.locator('#imported-slot-5').count(),1);assert.equal(await page.locator('#imported-speak').isDisabled(),true);
  await select('imported-slot-5');await select('imported-speak');await page.waitForFunction(()=>spoken.length===2);assert.match(await page.evaluate(()=>spoken.at(-1)),/water/i);
  await select('imported-back');await page.locator('#'+boardId).waitFor();
  console.log(`PASS ${mode}: board entry, review without speech, one utterance per selection, paging and return`);await context.close();
 }
}finally{await browser.close();}
