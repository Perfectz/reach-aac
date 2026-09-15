import test from 'node:test';
import assert from 'node:assert/strict';
import {ScanCursor} from '../src/navigation.js';
test('inserting or removing earlier controls preserves the highlighted identity',()=>{
 const a={},b={},c={},newControl={},s=new ScanCursor();s.reset(0,1000);assert.equal(s.update([a,b,c],0,1000).target,a);assert.equal(s.update([a,b,c],1000,1000).target,b);
 assert.equal(s.update([newControl,a,b,c],1100,1000).target,b);assert.equal(s.selected([newControl,a,b,c]),b);assert.equal(s.update([b,c],1200,1000).target,b);assert.equal(s.update([b,c],2000,1000).target,c);
});
test('removed targets cannot activate their replacement and replacements receive a full interval',()=>{
 const a={},b={},c={},s=new ScanCursor();s.update([a,b,c],0,1000);s.update([a,b,c],1000,1000);assert.equal(s.selected([a,c]),null);assert.equal(s.update([a,c],1999,1000).target,c);assert.equal(s.update([a,c],2000,1000).target,c);assert.equal(s.update([a,c],2999,1000).target,a);
 assert.equal(s.update([],3000,1000).target,null);assert.equal(s.selected([]),null);assert.equal(s.update([b],4000,1000).target,b);assert.equal(s.update([b],5000,1000).target,b);
});
