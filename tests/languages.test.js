import {test} from 'node:test';
import assert from 'node:assert/strict';
import {languages,phraseText,presets,translations} from '../src/languages.js';
import {categories,scenarioPhrases,helpPhrase} from '../src/data.js';
import {validateSettings} from '../src/access.js';
test('every prebuilt phrase exists in all six languages',()=>{for(const p of [...categories.flatMap(c=>c.phrases),...scenarioPhrases,helpPhrase])for(const l of languages){assert.ok(phraseText(p,l.id),`${p.id}/${l.id}`);assert.ok(p[l.id]||p.translations?.[l.id]||translations[l.id]?.[p.id],`${p.id}/${l.id} missing translation`);}});
test('scenario presets contain valid distinct messages',()=>{const ids=new Set([...categories.flatMap(c=>c.phrases),...scenarioPhrases].map(p=>p.id));assert.deepEqual(Object.keys(presets),['homeCare','hospital','family']);for(const list of Object.values(presets)){assert.equal(list.length,12);assert.equal(new Set(list).size,12);list.forEach(id=>assert.ok(ids.has(id)));}});
test('new language and personal translations survive settings import',()=>{const s=validateSettings({language:'ar',profile:'hospital',phrases:[{en:'Hello',th:'สวัสดี',translations:{ar:'مرحبا',es:'Hola'}}]});assert.equal(s.language,'ar');assert.equal(s.profile,'hospital');assert.equal(s.phrases[0].translations.ar,'مرحبا');});
