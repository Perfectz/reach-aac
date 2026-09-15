import test from 'node:test';import assert from 'node:assert/strict';
import {CareDraft,careText,careFields,careOptions} from '../src/care.js';
test('care message includes only deliberate selections and preserves uncertainty',()=>{
 const d=new CareDraft();assert.equal(d.phrase(),null);d.select('symptom','pain');d.select('location','shoulder');d.select('side','left');d.select('severity',null);d.select('time','unsure');
 assert.equal(d.phrase().en,'I have pain.\nLocation: Shoulder\nSide: Left\nWhen it started: Not sure');assert.throws(()=>d.select('symptom','diagnosis'));assert.throws(()=>d.select('severity','left'));
 d.select('location','everywhere');assert.equal(d.values.side,null);assert.equal(d.phrase().en.includes('Side:'),false);
});
test('all care options and composed details have explicit six-language text',()=>{
 for(const lang of ['en','zh','hi','es','ar','th']){for(const f of careFields){assert.notEqual(careText(f,lang),f);for(const v of careOptions[f])assert.notEqual(careText(v,lang),v);}const d=new CareDraft();d.select('symptom','numb');d.select('location','foot');d.select('severity','severe');assert.ok(d.phrase().translations[lang].includes(careText('foot',lang)));}
});
