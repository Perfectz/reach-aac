import test from 'node:test';import assert from 'node:assert/strict';
import {validatePassport,passportFields,passportText} from '../src/passport.js';import {validateSettings} from '../src/access.js';
test('handover imports bound optional text and do not invent signals',()=>{
 const empty=validatePassport();assert.ok(passportFields.every(k=>empty[k]===''));
 const p=validatePassport({name:'😀'.repeat(120),yes:'  Small finger tap  ',no:42,notes:'x'.repeat(800),unknown:'ignored'});assert.equal(Array.from(p.name).length,100);assert.equal(p.yes,'Small finger tap');assert.equal(p.no,'');assert.equal(p.notes.length,500);assert.equal(p.unknown,undefined);
 const settings=validateSettings({passport:p,profile:'hospital'});assert.deepEqual(settings.passport,p);assert.deepEqual(validateSettings({...settings,profile:'family'}).passport,p);
});
test('handover controls have six explicit language variants',()=>{for(const lang of ['en','zh','hi','es','ar','th'])for(const key of ['title','save','discard','download',...passportFields])assert.notEqual(passportText(key,lang),key);});
