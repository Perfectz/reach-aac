import {chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext(),page=await context.newPage();
 for(const name of ['board-library','obf-review'])await context.route(`**/qa/${name}.js`,route=>route.fulfill({contentType:'text/javascript',path:`src/${name}.js`}));
 await page.goto('http://localhost:4173');const original=await readFile('tests/fixtures/reach-media.obf','utf8');
 const result=await page.evaluate(async raw=>{
  const {BoardLibrary}=await import('/qa/board-library.js');const library=new BoardLibrary(),source=new Blob([raw],{type:'application/json'});
  const a=await library.save('person-a',source),b=await library.save('person-b',source);
  const read=await library.open('person-a',a.id);let isolated=false;try{await library.get('person-b',a.id);}catch{isolated=true;}
  const before=(await library.list('person-a')).length;
  const add=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(){throw new DOMException('Full','QuotaExceededError');};let failed=false;try{await library.save('person-a',source);}catch{failed=true;}finally{IDBObjectStore.prototype.add=add;}
  let changed=false;try{await library.save('person-a',source,{isCurrent:()=>false});}catch{changed=true;}
  const after=(await library.list('person-a')).length;await library.removePerson('person-a');const other=await library.get('person-b',b.id);
  return {same:await read.entry.source.text()===raw,media:read.review.resources.length,isolated,failed,changed,before,after,removed:(await library.list('person-a')).length,remaining:other.id,bId:b.id};
 },original);
 assert.equal(result.same,true);assert.ok(result.media>0);assert.equal(result.isolated,true);assert.equal(result.failed,true);assert.equal(result.changed,true);assert.equal(result.before,result.after);assert.equal(result.removed,0);assert.equal(result.remaining,result.bId);
 await page.reload();const count=await page.evaluate(async()=>{const {BoardLibrary}=await import('/qa/board-library.js');return (await new BoardLibrary().list('person-b')).length;});assert.equal(count,1);
 console.log('PASS original bytes/media preserved, owner isolation, failed-write rollback, changed-person rejection, scoped removal and reload persistence');
}finally{await browser.close();}
