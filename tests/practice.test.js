import test from 'node:test';import assert from 'node:assert/strict';import {InputTrial,practiceText} from '../src/practice.js';
test('practice distinguishes wrong targets and deliberate successes without a target timeout',()=>{
 const p=new InputTrial();p.start();p.select(3);assert.equal(p.errors,1);for(const i of [0,3,1,2])p.select(i);assert.equal(p.correct,4);assert.equal(p.phase,'prepareQuiet');
 p.startQuiet();p.select(1);assert.equal(p.quietSelections,1);assert.equal(p.errors,1);
});
test('quiet rest counts active time and available signal separately, pauses when unfocused',()=>{
 const p=new InputTrial();p.start();for(const i of [0,3,1,2])p.select(i);p.startQuiet();p.tick(0,true,false);
 for(let t=100;t<=5000;t+=100)p.tick(t,true,false);p.tick(6000,false,false);p.tick(30000,true,true);assert.equal(p.quietTime,5000);
 for(let t=30100;t<=35000;t+=100)p.tick(t,true,true);assert.equal(p.phase,'result');assert.equal(p.availableTime,5000);
});
test('rest starts only after requested targets and cannot silently pass on a timer stall',()=>{
 const p=new InputTrial();p.startQuiet();assert.equal(p.phase,'ready');p.start();for(const i of [0,3,1,2])p.select(i);p.startQuiet();p.tick(0,true,true);p.tick(50000,true,true);assert.equal(p.phase,'quiet');assert.equal(p.quietTime,250);
 for(const lang of ['en','zh','hi','es','ar','th'])assert.notEqual(practiceText('caution',lang),'caution');
});
