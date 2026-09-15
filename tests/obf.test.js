import test from 'node:test';
import assert from 'node:assert/strict';
import {loadBoard} from '@shayc/open-board-format';
import {createOBF} from '../src/obf.js';
test('OBF preserves slots, duplicate references, exact audio and private user content',async()=>{
 const p={id:'custom-a',en:'Hello',sourceLanguage:'en',icon:'Hand'},q={id:'custom-b',en:'Bye',sourceLanguage:'en',icon:'Hand'};
 const board=await createOBF({phrases:[p,null,q,p],language:'en',columns:3,name:'Example',recordings:[{phrase:p.id,language:'en',text:'Hello',blob:new Blob([new Uint8Array([1,2,3])],{type:'audio/wav'})},{phrase:q.id,language:'en',text:'Old text',blob:new Blob(['stale'],{type:'audio/wav'})}]});
 const parsed=await loadBoard(new Blob([JSON.stringify(board)]));assert.equal(parsed.format,'obf');assert.deepEqual(parsed.board.grid.order,[['button-0',null,'button-1'],['button-0',null,null]]);assert.equal(parsed.board.sounds.length,1);assert.equal(parsed.board.sounds[0].data,'data:audio/wav;base64,AQID');assert.equal(parsed.board.license,undefined);assert.equal(parsed.board.buttons[1].sound_id,undefined);
});
test('missing translation requires explicit empty-position choice, without shifting later phrases',async()=>{
 const a={id:'custom-a',en:'A',sourceLanguage:'en'},b={id:'custom-b',en:'B',translations:{es:'Be'}};
 await assert.rejects(()=>createOBF({phrases:[a,b],language:'es',name:'Example'}),/no translation/);
 const board=await createOBF({phrases:[a,b],language:'es',name:'Example',allowMissing:true,columns:2});assert.deepEqual(board.grid.order,[[null,'button-0']]);assert.deepEqual(board.ext_reach_export.missingPositions,[1]);assert.equal(board.buttons[0].label,'Be');
});
