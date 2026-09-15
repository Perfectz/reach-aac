import {categories,scenarioPhrases,helpPhrase} from './data.js';
import {presets} from './languages.js';
import {repairPhrases} from './communication.js';
export const MAX_PACK_SLOTS=60;
export function phraseBank(settings){return [...new Map([helpPhrase,...categories.flatMap(c=>c.phrases),...scenarioPhrases,...Object.values(repairPhrases),...settings.phrases].map(p=>[p.id,p])).values()];}
export function packIds(settings,profile=settings.profile){return [...(settings.packs?.[profile]||presets[profile])];}
export function validatePacks(input,settings){
 const allowed=new Set(phraseBank(settings).map(p=>p.id)),result={};
 for(const profile of Object.keys(presets))if(Array.isArray(input?.[profile])){
  const slots=input[profile].slice(0,MAX_PACK_SLOTS).map(id=>typeof id==='string'&&allowed.has(id)?id:null);
  slots[0]='yes';slots[1]='no';result[profile]=slots;
 }
 return result;
}
export function packPhrases(settings){const bank=new Map(phraseBank(settings).map(p=>[p.id,p]));return packIds(settings).map(id=>bank.get(id)||null);}
