import {test} from 'node:test';
import assert from 'node:assert/strict';
import {composerPhraseAvailable} from '../src/composer.js';
test('composer accepts original language or explicit translation, not a foreign fallback',()=>{
 const p={id:'custom-ar',en:'مرحبا',sourceLanguage:'ar',translations:{ar:'مرحبا',es:'Hola'}};
 assert.equal(composerPhraseAvailable(p,'en'),false);assert.equal(composerPhraseAvailable(p,'ar'),true);assert.equal(composerPhraseAvailable(p,'es'),true);
 assert.equal(composerPhraseAvailable({id:'yes',en:'Yes',th:'ใช่'},'th'),true);assert.equal(composerPhraseAvailable({en:'Hello'},'en'),true);
});
