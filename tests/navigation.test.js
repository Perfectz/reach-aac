import test from 'node:test';
import assert from 'node:assert/strict';
import {pageCapacity,pageSlice,NavigationRelease} from '../src/navigation.js';
test('all messages survive pagination including short screens and simplified layouts',()=>{
  for(const size of [2,4,6,8,12]){const items=Array.from({length:23},(_,i)=>i),found=[];for(let page=0;page<Math.ceil(items.length/size);page++)found.push(...pageSlice(items,page,size).items);assert.deepEqual(found,items);}
  assert.equal(pageCapacity(390,844),4);assert.equal(pageCapacity(1280,640),8);assert.equal(pageCapacity(1280,900,true),4);
  assert.equal(pageCapacity(768,1024),8);assert.equal(pageCapacity(1440,1000),12);assert.equal(pageCapacity(390,640),2);
  assert.equal(pageSlice([],3,4).index,0);
});
test('page navigation stays blocked until pointer leaves, including after tracking loss',()=>{
  const gate=new NavigationRelease();gate.block({left:10,right:100,top:20,bottom:80});
  assert.equal(gate.allows({x:50,y:50}),false);assert.equal(gate.allows(null),false);assert.equal(gate.allows({x:50,y:50}),false);
  assert.equal(gate.allows({x:101,y:50}),true);assert.equal(gate.allows({x:50,y:50}),true);
});
