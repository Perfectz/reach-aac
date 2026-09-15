import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanGuideDraft} from '../src/setup-guide.js';
test('guide drafts reject invalid fields and incomplete review states',()=>{
 const valid={step:5,answers:{language:'es',reading:'larger',position:'reclined',method:'eye'}};
 assert.deepEqual(cleanGuideDraft(valid),valid);
 for(const value of [null,{...valid,step:9},{...valid,step:2.5},{...valid,answers:{...valid.answers,language:'unknown'}},{...valid,answers:{...valid.answers,reading:null}},{...valid,answers:{...valid.answers,position:null}},{...valid,answers:{...valid.answers,method:'camera'}}])assert.equal(cleanGuideDraft(value),null);
 assert.equal(cleanGuideDraft({...valid,step:4}).answers.method,'eye');
 const clean=cleanGuideDraft({...valid,extra:'ignore',answers:{...valid.answers,private:'ignore'}});assert.equal(clean.extra,undefined);assert.equal(clean.answers.private,undefined);
});
