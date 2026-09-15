import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {reviewOBF} from '../src/obf-review.js';
const file=board=>new Blob([JSON.stringify(board)]);
const board=()=>({format:'open-board-0.1',name:'Review',locale:'en',buttons:[{id:'a',label:'Short label',vocalization:'My longer message'}],images:[],sounds:[],grid:{rows:1,columns:2,order:[['a',null]]}});
test('review preserves labels distinct from speech, empty slots, and original extensions/attribution',async()=>{
 const b=board();b.ext_license_note='Do not redistribute';b.license={type:'private'};const r=await reviewOBF(file(b));assert.equal(r.ready,true);assert.equal(r.slots[0].speech,'My longer message');assert.equal(r.slots[0].label,'Short label');assert.equal(r.slots[1],null);assert.deepEqual(r.original,b);
});
test('unsupported behavior and external/missing media block plain-speech import',async()=>{
 const b=board();b.buttons[0].actions=[':clear'];b.buttons[0].load_board={id:'other'};b.buttons[0].image_id='external';b.buttons[0].sound_id='missing';b.images=[{id:'external',url:'https://example.invalid/private-image.png'}];const r=await reviewOBF(file(b));assert.equal(r.ready,false);assert.deepEqual(new Set(r.issues.map(i=>i.code)),new Set(['unsupported-action','external-media','missing-media']));assert.equal(r.original.buttons[0].actions[0],':clear');
});
test('duplicate IDs, broken grids, misleading media and unknown languages are rejected or flagged',async()=>{
 const b=board();b.buttons.push({...b.buttons[0]});await assert.rejects(()=>reviewOBF(file(b)),/duplicate/);b.buttons.pop();b.grid.order=[['a']];await assert.rejects(()=>reviewOBF(file(b)),/rows and columns/);b.grid.order=[['a',null]];b.locale='xx';b.buttons[0].image_id='fake';b.images=[{id:'fake',data:'data:image/png;base64,PGh0bWw+',content_type:'image/png'}];const r=await reviewOBF(file(b));assert.equal(r.ready,false);assert.ok(r.issues.some(i=>i.code==='language'));assert.ok(r.issues.some(i=>i.code==='media-signature'));
});
test('actual Reach export retains exact embedded icon and recording bytes in review',async()=>{
 const bytes=await readFile('tests/fixtures/reach-media.obf'),r=await reviewOBF(new Blob([bytes]));assert.equal(r.ready,true);assert.equal(r.slots.length,6);assert.equal(r.slots[3],null);assert.equal(r.slots[0].sound.mime,'audio/wav');assert.equal(r.slots[0].image.mime,'image/png');assert.match(r.slots[0].image.original.ext_reach_license_text,/ISC License/);const original=JSON.parse(bytes);assert.deepEqual(Buffer.from(await r.slots[0].sound.blob.arrayBuffer()),Buffer.from(original.sounds[0].data.split(',')[1],'base64'));
});

