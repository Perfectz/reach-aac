import {validPhrasePhoto} from './phrase-photo.js';
import {validPhraseSymbol} from './phrase-symbols.js';
import {validatePacks} from './packs.js';
import {validatePassport} from './passport.js';
export class Dwell {
  constructor() { this.reset(); }
  reset() { this.target = null; this.since = 0; this.fired = false; }
  update(target, now, duration) {
    if (!target) { this.reset(); return { progress: 0, fire: false }; }
    if (target !== this.target) { this.target = target; this.since = now; this.fired = false; }
    const progress = Math.min(1, (now - this.since) / duration);
    const fire = progress >= 1 && !this.fired;
    if (fire) this.fired = true;
    return { progress, fire };
  }
}

// A sustained movement fires once. Stillness is required before another selection.
export class MotionGate {
  constructor() { this.reset(); }
  reset() { this.armed = false; this.quietSince = null; this.activeSince = null; this.lastFire = -Infinity; }
  update(value, threshold, now) {
    if (value < threshold * 0.55) {
      this.quietSince ??= now;
      if (now - this.quietSince >= 700) this.armed = true;
      this.activeSince = null;
    } else {
      this.quietSince = null;
      if (value >= threshold) this.activeSince ??= now;
      else this.activeSince = null;
    }
    if (this.armed && this.activeSince !== null && now - this.activeSince >= 100 && now - this.lastFire > 1800) {
      this.armed = false; this.activeSince = null; this.lastFire = now; return true;
    }
    return false;
  }
}

export const defaults = { language: 'en', profile:'homeCare', vocabulary: 'everyday', mode: 'touch', dwell: 1400, scan: 2400, voice: true, review: false, scanAudio: false, contrast: false, simple: false, gain: 3, threshold: 8, finger: 8, phrases: [] };
export function validateSettings(input) {
  if (!input || typeof input !== 'object') throw new Error('This is not a Reach settings file.');
  const s = { ...defaults, scanAudioRate:.95, packs:{}, phrases:[],partnerLanguage:'auto',speechLanguage:'auto' };
  if(['auto','none','en','zh','hi','es','ar','th'].includes(input.partnerLanguage))s.partnerLanguage=input.partnerLanguage;
  if(['auto','en','zh','hi','es','ar','th'].includes(input.speechLanguage))s.speechLanguage=input.speechLanguage;
  if (['en','zh','hi','es','ar','th'].includes(input.language)) s.language = input.language;
  s.profile=['homeCare','hospital','family'].includes(input.profile)?input.profile:'homeCare';
  if (['everyday','care'].includes(input.vocabulary)) s.vocabulary=input.vocabulary;
  if (['touch','dwell','switch','motion','hand','eye'].includes(input.mode)) s.mode = input.mode;
  for (const [key,min,max] of [['scanAudioRate',.5,1.5],['dwell',600,4000],['scan',1000,8000],['gain',1,8],['threshold',1,40]]) {
    if (Number.isFinite(input[key])) s[key] = Math.max(min,Math.min(max,input[key]));
  }
  for (const key of ['voice','review','scanAudio','contrast','simple']) if (typeof input[key] === 'boolean') s[key] = input[key];
  if ([4,8,12,16,20].includes(input.finger)) s.finger = input.finger;
  const used=new Set();
  const clip=text=>Array.from(text.trim()).slice(0,500).join('');
  if (Array.isArray(input.phrases)) s.phrases = input.phrases.slice(0,200).filter(p => p&&typeof p.en === 'string' && p.en.trim()).map((p,i) => {
    let id=typeof p.id==='string'&&/^custom-[a-zA-Z0-9-]{1,60}$/.test(p.id)&&!used.has(p.id)?p.id:`custom-import-${i}`;
    while(used.has(id))id+='x';used.add(id);
    return {id,en:clip(p.en),th:typeof p.th==='string'?clip(p.th):'',sourceLanguage:['en','zh','hi','es','ar','th'].includes(p.sourceLanguage)?p.sourceLanguage:'en',translations:Object.fromEntries(['en','zh','hi','es','ar','th'].filter(l=>typeof p.translations?.[l]==='string').map(l=>[l,clip(p.translations[l])])),icon:validPhraseSymbol(p.icon),photo:validPhrasePhoto(p.photo),tone:'neutral'};
  });
  s.packs=validatePacks(input.packs,s);
  s.passport=validatePassport(input.passport);
  if(input.setupGuide&&['read','larger','partner','unsure'].includes(input.setupGuide.reading)&&['seated','reclined','changing','unsure'].includes(input.setupGuide.position))s.setupGuide={reading:input.setupGuide.reading,position:input.setupGuide.position,helper:input.setupGuide.helper===true};
  return s;
}

export function mapHand(point, origin, gain, width, height) {
  return { x: Math.max(8, Math.min(width-8, width*(0.5-(point.x-origin.x)*gain))), y: Math.max(8,Math.min(height-8,height*(0.5+(point.y-origin.y)*gain))) };
}




