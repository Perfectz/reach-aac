import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateSettings} from '../src/access.js';
test('setup transfers preserve supported personal symbols and reject arbitrary icon names',()=>{
 const phrases=[{id:'custom-a',en:'Family',icon:'Heart'},{id:'custom-b',en:'Unknown',icon:'<script>'}];
 const result=validateSettings({phrases});assert.equal(result.phrases[0].icon,'Heart');assert.equal(result.phrases[1].icon,'MessageCircle');assert.equal(validateSettings(JSON.parse(JSON.stringify(result))).phrases[0].icon,'Heart');
});
