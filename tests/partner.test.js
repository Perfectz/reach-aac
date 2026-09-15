import test from 'node:test';
import assert from 'node:assert/strict';
import {exactTranslation,partnerLanguage} from '../src/partner.js';
import {validateSettings} from '../src/access.js';
test('partner languages preserve legacy display and reject invalid preferences',()=>{
 assert.equal(partnerLanguage({language:'en'}),'th');assert.equal(partnerLanguage({language:'ar'}),'en');assert.equal(partnerLanguage({language:'en',partnerLanguage:'none'}),null);
 const settings=validateSettings({partnerLanguage:'ar',speechLanguage:'es'});assert.equal(settings.partnerLanguage,'ar');assert.equal(settings.speechLanguage,'es');assert.equal(validateSettings({speechLanguage:'bad'}).speechLanguage,'auto');
});
test('native fallback text is never mislabeled as an English translation',()=>{
 const p={id:'custom-native',en:'أحبك',sourceLanguage:'ar',translations:{ar:'أحبك'}};
 assert.equal(exactTranslation(p,'en'),null);assert.equal(exactTranslation(p,'ar'),'أحبك');assert.equal(exactTranslation({...p,translations:{...p.translations,en:'I love you'}},'en'),'I love you');
});
