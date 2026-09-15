import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSettings} from '../src/access.js';
import {communicationLabel,repairPhrases} from '../src/communication.js';
test('review preference survives backup validation and rejects truthy non-booleans',()=>{
  assert.equal(validateSettings({review:true}).review,true);
  assert.equal(validateSettings({review:'false'}).review,false);
  assert.equal(validateSettings({}).review,false);
});
test('repair messages and preview instructions are explicit in all supported languages',()=>{
  for(const language of ['en','zh','hi','es','ar','th']){
    for(const phrase of Object.values(repairPhrases))assert.ok(phrase.translations[language]?.length>3);
    for(const key of ['review','reviewHint','preview','speakNow','stopped'])assert.notEqual(communicationLabel(key,language),key);
  }
});
