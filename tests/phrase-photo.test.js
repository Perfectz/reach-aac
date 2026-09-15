import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validPhrasePhoto} from '../src/phrase-photo.js';
import {validateSettings} from '../src/access.js';
import {createOBF} from '../src/obf.js';
test('personal photo transfer rejects remote/SVG sources and exports private embedded JPEG',async()=>{
 assert.equal(validPhrasePhoto('https://example.com/photo.jpg'),null);assert.equal(validPhrasePhoto('data:image/svg+xml,<svg/>'),null);assert.equal(validPhrasePhoto('data:image/jpeg;base64,/9j/'+ 'a'.repeat(16000)),null);
 const photo='data:image/jpeg;base64,/9j/2Q==',p=validateSettings({phrases:[{en:'Family',photo}]}).phrases[0];assert.equal(p.photo,photo);
 const board=await createOBF({phrases:[p],language:'en',name:'Family'});assert.equal(board.images[0].data,photo);assert.equal(board.images[0].license,undefined);assert.ok(board.buttons[0].image_id);
});
