import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSettings} from '../src/access.js';
import {packIds,packPhrases} from '../src/packs.js';
test('personal phrase references and empty slots survive repeated backup validation',()=>{
 let s={phrases:[{id:'custom-family-42',en:'My family phrase'}],packs:{homeCare:['yes','no',null,'custom-family-42','water']}};
 for(let i=0;i<3;i++)s=validateSettings(JSON.parse(JSON.stringify(s)));
 assert.equal(s.phrases[0].id,'custom-family-42');assert.deepEqual(packIds(s),['yes','no',null,'custom-family-42','water']);assert.equal(packPhrases(s)[3].en,'My family phrase');
});
test('invalid pack references leave positions empty and preserve protected answers',()=>{
 const s=validateSettings({packs:{homeCare:['bad','bad','unknown',null,'water']},phrases:[null,{id:'yes',en:'cannot overwrite Yes'},{id:'custom-a',en:'one'},{id:'custom-a',en:'two'}]});
 assert.deepEqual(packIds(s),['yes','no',null,null,'water']);assert.equal(new Set(s.phrases.map(p=>p.id)).size,3);assert.ok(s.phrases.every(p=>p.id.startsWith('custom-')));
});
test('removing a personal phrase does not move later pack positions',()=>{
 const s=validateSettings({phrases:[],packs:{family:['yes','no','custom-deleted','photos']},profile:'family'});
 assert.equal(packPhrases(s)[2],null);assert.equal(packPhrases(s)[3].id,'photos');
});
test('personal library supports 200 messages without the old 24-message truncation',()=>{
 const s=validateSettings({phrases:Array.from({length:201},(_,i)=>({id:`custom-${i}`,en:`Phrase ${i}`}))});assert.equal(s.phrases.length,200);
});
