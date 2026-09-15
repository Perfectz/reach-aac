import { createIcons, AudioLines, ShieldCheck, SlidersHorizontal, Sprout, CircleHelp, ArrowUpRight, BellRing, MessageCircle, Volume2, X, Hand, Pause, ChevronRight, Circle, CircleDot, Download, Check, LayoutGrid, HeartPulse, Accessibility, Wind, Bath, Sun, Snowflake, Moon, HeartHandshake, Users, Heart, Droplets, Utensils, Droplet, Bed, Lamp, VolumeX, CircleUser, Footprints, Activity, Smile, Frown, Cloud, Zap, ThumbsUp, User, Coffee, Ear, MapPin, Clock, Repeat, Bookmark, MessagesSquare, ArrowRight, Upload, Printer, Plus, Trash2, MousePointer2, Timer, Camera, Focus } from 'lucide';
const icons={ AudioLines, ShieldCheck, SlidersHorizontal, Sprout, CircleHelp, ArrowUpRight, BellRing, MessageCircle, Volume2, X, Hand, Pause, ChevronRight, Circle, CircleDot, Download, Check, LayoutGrid, HeartPulse, Accessibility, Wind, Bath, Sun, Snowflake, Moon, HeartHandshake, Users, Heart, Droplets, Utensils, Droplet, Bed, Lamp, VolumeX, CircleUser, Footprints, Activity, Smile, Frown, Cloud, Zap, ThumbsUp, User, Coffee, Ear, MapPin, Clock, Repeat, Bookmark, MessagesSquare, ArrowRight, Upload, Printer, Plus, Trash2, MousePointer2, Timer, Camera, Focus };
import { categories, helpPhrase, scenarioPhrases } from './data.js';
import { defaults, validateSettings, Dwell } from './access.js';
import { CameraInput } from './camera.js';
import {mountInputAdjustments} from './input-adjustments.js';
import {mountPreferenceControls} from './preference-controls.js';
import {mountBoardExport} from './board-export.js';
import {BoardLibrary} from './board-library.js';
import {mountImportedBoards} from './imported-boards.js';
import {importedText} from './imported-language.js';
const boardLibrary=new BoardLibrary();
let importedBoardsSession=null;
let boardExportSession=null;
import { createPointer } from './pointer.js';
import { EyeInput } from './eye.js';
import { languages, translations, ui, phraseText, presets, spokenLanguage } from './languages.js';
import { communicationLabel, repairPhrases } from './communication.js';
import {pageCapacity,eyeCapacity,pageSlice,NavigationRelease,ScanCursor} from './navigation.js';
import {packIds,packPhrases,phraseBank,MAX_PACK_SLOTS} from './packs.js';
import {mountPractice,practiceText} from './practice.js';
import {MessageDraft,mountComposer,composerText} from './composer.js';
import {exactTranslation,partnerLanguage,partnerText} from './partner.js';
import {CareDraft,mountCare,careText} from './care.js';
import {mountPassport,passportText,passportCard} from './passport.js';
import {ProfileStore,PROFILE_KEY,profileText} from './profiles.js';
import {mountOffline,offlineText,inspectAssets} from './offline.js';
import {RecordingLibrary,RecordedOutput,mountRecordings,recordingText} from './recordings.js';
import {mountAudioBackup,audioBackupText} from './audio-backup.js';
import {mountSetupGuide,guideText} from './setup-guide.js';
import {mountPhraseEditor,phraseEditText} from './phrase-editor.js';
import {ScanAudio,scanAudioText} from './scan-audio.js';
import {ScreenAwake,awakeText} from './screen-awake.js';
import './style.css';
const scanAudio=new ScanAudio(window.speechSynthesis,window.SpeechSynthesisUtterance);
const screenAwake=new ScreenAwake(navigator.wakeLock,()=>!document.hidden,updateAwake);
function updateAwake(){
 const language=settings.language,enable=document.querySelector('#awake-enable'),disable=document.querySelector('#awake-disable'),status=document.querySelector('#awake-status');
 if(enable){enable.textContent=awakeText('enable',language);enable.disabled=screenAwake.status==='unsupported'||screenAwake.status==='pending'||!!screenAwake.lock;}
 if(disable){disable.textContent=awakeText('disable',language);disable.disabled=!screenAwake.wanted&&!screenAwake.lock;}
 if(status)status.textContent=awakeText(screenAwake.status,language);
 const live=document.querySelector('#awake-live');if(live){const hidden=!screenAwake.wanted&&!screenAwake.lock,text=awakeText(screenAwake.status,language),changed=live.hidden!==hidden||live.textContent!==text;live.hidden=hidden;live.textContent=text;if(changed){syncPageLayout();showDock();}}
}
document.addEventListener('visibilitychange',()=>screenAwake.visibilityChanged());
window.addEventListener('pagehide',()=>screenAwake.release());

const $ = (s) => document.querySelector(s);
const escape = (s) => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name) => `<i data-lucide="${name.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase()}" aria-hidden="true"></i>`;
let settings={...defaults}, storageAvailable=true,profileStore=null;
try {profileStore=new ProfileStore(localStorage);settings=profileStore.active.settings;} catch {storageAvailable=false;}
let category='essentials',lastPhrase=null, paused=false, scanning=false, scanCooldown=0, hover=null, handPoint=null, offlineReady=false, activeDialog=null, installPrompt=null;
let voiceStatus='', setupStep=0;
let offlineSession=null;
const recordingLibrary=new RecordingLibrary(),recordedOutput=new RecordedOutput();let recordingSession=null;
let audioBackupSession=null;
let guidedPracticePending=false,guidedEyePractice=false;
let editedPhraseId=null;
let pendingSpeech=false;
let careDraft=new CareDraft();
let boardPage=0,boardPages=1,printing=false,boardOverflow=false;
const navigationRelease=new NavigationRelease();
const scanCursor=new ScanCursor();
let mousePoint=null;
let restScanning=null;
let packDraft=null,packSlot=null;
let practiceSession=null,practiceScanning=null;
let composerDraft=new MessageDraft(settings.language);
try{const d=profileStore?.active.draft;if(d){composerDraft=new MessageDraft(d.language);composerDraft.set(d.text);composerDraft.history=[];}}catch{}
const ct=key=>communicationLabel(key,settings.language);
const dwell = new Dwell();
const isScan = () => ['switch','motion'].includes(settings.mode);
let eyePoint=null,eyeStatus=null,eyePage=0,eyeNeedsRelease=false;
const tr=(en,th) => settings.language==='th'?th:en;
const primary=p=>categories.includes(p)?ui(p.id,settings.language):phraseText(p,settings.language);
const secondary=p=>{const lang=partnerLanguage(settings);return lang&&lang!==settings.language?exactTranslation(p,lang)||'':'';};
const pt=key=>partnerText(key,settings.language);
const t=key=>ui(key,settings.language);
const movementReading=(value,threshold)=>t('motionReading').replace('{value}',value.toFixed(1)).replace('{threshold}',threshold.toFixed(1));
const modeLabels={touch:'Touch or click',dwell:'Dwell to select',switch:'One-switch scanning',motion:'Camera movement switch',hand:'Hand pointer',eye:'Eye control · experimental'};
function save() { try {if(!profileStore)throw Error('Storage unavailable');profileStore.save(settings,{language:composerDraft.language,text:composerDraft.text});storageAvailable=true;return true;} catch {storageAvailable=false;toast(ui('saveFailed',document.documentElement.lang||settings.language));return false;} }
function guideDraft(action,value){try{const key='reach-guide-draft-v1';if(action==='clear'){sessionStorage.removeItem(key);return true;}const person=profileStore?.active.id;if(!person)return action==='read'?null:false;if(action==='read'){const saved=JSON.parse(sessionStorage.getItem(key)||'null');return saved?.person===person?saved.draft:null;}sessionStorage.setItem(key,JSON.stringify({person,draft:value}));return true;}catch{return action==='read'?null:false;}}
function loadPerson(){
  guideDraft('clear');
  stopOutput();stopInputs();scanning=false;paused=false;restScanning=null;practiceScanning=null;practiceSession=null;packDraft=null;packSlot=null;careDraft=new CareDraft();lastPhrase=null;pendingSpeech=false;category='essentials';boardPage=0;eyePage=0;handPoint=null;voiceStatus='';
  settings=profileStore.active.settings;const draft=profileStore.active.draft;composerDraft=new MessageDraft(draft.language);composerDraft.set(draft.text);composerDraft.history=[];$('#pause-overlay').close();$('#pause-overlay').hidden=true;resetInput();activeDialog=null;$('#modal').close();render();openDialog('quick');
  recordingLibrary.load(profileStore.active.id).catch(()=>toast('Saved recordings could not be loaded.'));
}
window.addEventListener('storage',event=>{if(event.key===PROFILE_KEY&&event.newValue!==profileStore?.expected){stopOutput();stopInputs();location.reload();}});
function refreshIcons(){createIcons({icons,attrs:{'stroke-width':1.8}});document.querySelectorAll('.phrase-photo').forEach(img=>{img.onerror=()=>{const p=phraseBank(settings).find(p=>p.id===img.closest('[data-phrase]')?.dataset.phrase);const fallback=document.createElement('span');fallback.textContent=p?primary(p):'';img.replaceWith(fallback);};});}
function toast(text){const el=$('#toast');(activeDialog?$('#modal'):document.body).append(el);el.textContent=text;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),5000);}

$('#app').innerHTML=`
  <a class="skip-link" href="#board">Skip to communication board</a>
  <header class="topbar"><a class="brand" href="/" aria-label="Reach home"><span class="brand-mark">${icon('AudioLines')}</span><span>reach<span class="brand-dot">.</span></span></a><span class="tagline">Your words. Your way.</span><div class="header-actions"><span class="local-status">${icon('ShieldCheck')} Private by design</span><button id="hand-shortcut" class="small-button" aria-label="Set up hand movement">${icon('Hand')} <span>Hand control</span></button><button id="eye-shortcut" class="small-button" aria-label="Eye control">${icon('Focus')} <span>Eye control</span></button><button id="language" class="small-button" aria-label="Switch between English and Thai">EN <span>/ ไทย</span></button><button id="settings" class="small-button" aria-label="Set up">${icon('SlidersHorizontal')} <span>Set up</span></button></div></header>
  <div class="workspace"><aside class="sidebar"><div class="sidebar-caption">MY COMMUNICATION</div><nav id="categories" aria-label="Communication categories"></nav><div class="sidebar-bottom"><div class="small-flower">${icon('Sprout')}</div><strong>A little movement.<br>A world of words.</strong><p>Free to use. Made for you.</p><button id="guide" class="text-button">${icon('CircleHelp')} Getting started ${icon('ArrowUpRight')}</button></div></aside>
  <main><div class="board-heading"><div><div class="eyebrow" id="eyebrow">LET’S CONNECT</div><h1 id="title">Essentials</h1><p id="category-hint"></p></div><button id="help" data-access class="help-button">${icon('BellRing')} <span>I need help<small lang="th">ช่วยด้วย</small></span></button></div>
  <section class="message-bar" aria-label="Selected message"><div class="message-symbol">${icon('MessageCircle')}</div><div class="message-content"><span class="message-caption" id="message-caption">YOUR VOICE</span><div id="message" role="status" aria-live="polite">Choose a tile to say something.</div><div id="message-secondary"></div></div><button id="repeat" data-access class="round-button" aria-label="Repeat last message" disabled>${icon('Volume2')}</button><button id="clear" data-access class="round-button" aria-label="Clear message" disabled>${icon('X')}</button></section>
  <nav id="page-navigation" aria-label="Communication pages"><button id="board-topics" data-access></button><span id="page-status" role="status"></span><button id="page-back" data-access hidden></button><button id="page-next" data-access hidden></button></nav>
  <div id="board" class="board" tabindex="-1" aria-label="Communication board"></div>
  <nav id="conversation-controls" aria-label="Conversation controls"><button id="stop-speaking" data-access></button><button id="wrong-selection" data-access></button><button id="say-wait" data-access></button><button id="say-unsure" data-access></button></nav>
  <section class="access-bar" aria-label="Input controls"><span class="input-icon">${icon('Hand')}</span><div class="access-copy"><strong id="input-label"></strong><span id="input-hint"></span><span id="scan-audio-live" role="status" hidden></span><span id="awake-live" role="status" hidden></span></div><button id="scan-start" class="small-button" hidden>Start scanning</button><button id="pause" class="small-button">${icon('Pause')} Pause input</button><button id="change-input" class="text-button">Change ${icon('ChevronRight')}</button></section>
  <div id="switch-pad" hidden><button class="switch-pad">${icon('CircleDot')} Select highlighted item <small>or press Space / Enter</small></button></div>
  <footer><span id="offline-status">${icon('Circle')} Preparing offline access</span><span id="speech-status"></span><button id="install" class="text-button" hidden>Install app ${icon('Download')}</button></footer>
  </main></div>
  <dialog id="modal" aria-labelledby="dialog-title"><div class="dialog-head"><div><span class="eyebrow">MAKE IT YOURS</span><h2 id="dialog-title"></h2></div><button id="close-dialog" class="round-button" aria-label="Close settings">${icon('X')}</button></div><div id="dialog-body"></div></dialog>
  <div id="toast" role="status"></div><div id="camera-pointer" hidden></div><dialog id="pause-overlay" aria-labelledby="pause-title" hidden><span id="pause-title"></span><button id="resume">Resume input</button></dialog>
`;

const showPointer=createPointer($('#camera-pointer'));
const partnerButton=document.createElement('button');partnerButton.id='partner-view';partnerButton.className='round-button';partnerButton.dataset.access='';partnerButton.disabled=true;partnerButton.innerHTML=icon('Users');$('.message-bar').append(partnerButton);
const restButton=document.createElement('button');restButton.id='take-break';restButton.className='small-button';$('.access-bar').insertBefore(restButton,$('#pause'));
const composeButton=document.createElement('button');composeButton.id='write-message';composeButton.className='small-button';$('.access-bar').insertBefore(composeButton,restButton);
const trackingNotice=document.createElement('p');trackingNotice.id='tracking-notice';trackingNotice.setAttribute('role','status');$('footer').before(trackingNotice);
document.querySelectorAll('.access-bar button').forEach(b=>b.setAttribute('data-access',''));
const dock=document.createElement('nav');dock.id='access-dock';dock.setAttribute('popover','manual');dock.setAttribute('aria-label','Navigation controls');document.body.append(dock);
function showDock(){
  if(paused||activeDialog==='eye'||activeDialog==='rest'){if(dock.matches(':popover-open'))dock.hidePopover();return;}
  if(dock.matches(':popover-open'))dock.hidePopover();
  (activeDialog?$('#modal'):document.body).append(dock);
  dock.innerHTML=`<button data-scroll="-1" data-access aria-label="${t('up')}"><span aria-hidden="true">↑</span><small>${t('up')}</small></button><button data-scroll="1" data-access aria-label="${t('down')}"><span aria-hidden="true">↓</span><small>${t('down')}</small></button><button id="dock-home" data-access><span aria-hidden="true">⌂</span><small>${t('home')}</small></button><button id="dock-setup" data-access><span aria-hidden="true">☷</span><small>${t('setup')}</small></button>`;
  if(!activeDialog&&settings.mode!=='eye'&&!boardOverflow)dock.querySelectorAll('[data-scroll]').forEach(b=>{const previous=b.dataset.scroll==='-1';b.setAttribute('aria-label',ct(previous?'previous':'next'));b.querySelector('span').textContent=previous?'←':'→';b.querySelector('small').textContent=ct(previous?'previous':'next');b.disabled=previous?boardPage===0:boardPage>=boardPages-1;});
  if(dock.matches(':popover-open'))dock.hidePopover();dock.showPopover();
}
function scrollPage(direction){const surface=$('#modal').open?$('#modal'):document.scrollingElement;surface.scrollBy({top:Number(direction)*Math.max(160,(surface===document.scrollingElement?innerHeight:surface.clientHeight)*.55),behavior:'instant'});}
function syncPageLayout(){
  if(settings.mode==='eye'||printing)return;
  $('#page-back').hidden=true;$('#page-next').hidden=true;
  boardOverflow=innerHeight<640||document.documentElement.scrollHeight>innerHeight+2;
  $('#page-back').hidden=!boardOverflow;$('#page-next').hidden=!boardOverflow;
}
function render(){
  updateAwake();
  document.querySelector('.board-heading').dataset.printInstructions=t('printHelp');
  document.documentElement.lang=settings.language;
  document.documentElement.dir=settings.language==='ar'?'rtl':'ltr';
  document.body.classList.toggle('high-contrast',settings.contrast);
  document.body.classList.toggle('simple',settings.simple);
  document.body.classList.toggle('eye-mode',settings.mode==='eye'&&!printing);
  document.body.classList.toggle('paged-board',settings.mode!=='eye'&&!printing);
  const cat=categories.find(c=>c.id===category);
  $('#categories').innerHTML=categories.map(c=>`<button data-category="${c.id}" data-access class="nav-item ${c.id===category?'active':''}" aria-current="${c.id===category?'page':'false'}">${icon(c.icon)}<span>${escape(primary(c))}</span>${c.id===category?icon('ChevronRight'):''}</button>`).join('');
  $('#title').textContent=primary(cat);$('#category-hint').textContent=t('choose');
  $('#eyebrow').textContent=t(settings.profile);$('.sidebar-caption').textContent=t('yourVoice');
  $('#language').textContent=languages.find(l=>l.id===settings.language).name;$('#language').setAttribute('aria-label',t('language'));
  let phrases=category==='mine'?settings.phrases:settings.simple&&category==='essentials'?cat.phrases.slice(0,6):cat.phrases;
  if(category==='essentials'&&settings.vocabulary==='everyday')phrases=phrases.map(p=>p.id==='position'?categories[1].phrases.find(p=>p.id==='rest'):p.id==='suction'?categories[1].phrases.find(p=>p.id==='water'):p);
  if(category==='essentials'){phrases=packPhrases(settings);$('#category-hint').textContent=t(settings.profile+'Desc');}
  const capacity=pageCapacity(innerWidth,innerHeight,settings.simple),page=pageSlice(phrases,boardPage,capacity);boardPage=page.index;boardPages=page.count;
  if(!printing&&settings.mode!=='eye')phrases=page.items;
  document.body.dataset.capacity=capacity;
  $('#board-topics').textContent=ct('topics');$('#page-status').textContent=`${primary(cat)} · ${boardPage+1} / ${boardPages}`;
  for(const [id,back] of [['page-back',true],['page-next',false]]){const b=$('#'+id);b.hidden=innerHeight>=640;b.textContent=ct(back?'previous':'next');b.disabled=back?boardPage===0:boardPage>=boardPages-1;}
  $('#page-navigation').hidden=settings.mode==='eye'||printing;
  $('#board').innerHTML=phrases.length?phrases.map(p=>p?`<button class="tile ${p.tone}" data-phrase="${p.id}" data-access><span class="tile-icon">${p.photo?`<img class="phrase-photo" src="${escape(p.photo)}" alt="">`:icon(p.icon)}</span><span class="tile-label" lang="${spokenLanguage(p,settings.language)}" dir="auto">${escape(primary(p))}</span><span class="tile-secondary" lang="${partnerLanguage(settings)||settings.language}" dir="auto">${escape(secondary(p))}</span><span class="dwell-progress"></span></button>`:`<div class="empty-position" aria-hidden="true"></div>`).join(''):`<div class="empty-state">${icon('Bookmark')}<h2>${tr('Words that feel like you','ข้อความของคุณ')}</h2><p>${tr('Add names, everyday requests, or a favourite saying.','เพิ่มชื่อ คำขอ หรือข้อความที่ใช้บ่อย')}</p><button id="add-first" data-access class="primary-button">${tr('Add a phrase','เพิ่มข้อความ')}</button></div>`;
  $('#input-label').textContent=t(settings.mode);
  if(settings.mode==='eye'&&!printing)renderEyeBoard();
  $('#input-hint').textContent=settings.mode==='touch'?t('choose'):settings.mode==='dwell'?t('dwellHint').replace('{s}',(settings.dwell/1000).toFixed(1)):t(settings.mode+'Desc');
  $('#scan-start').hidden=!isScan();$('#scan-start').textContent=t(scanning?'stopScan':'startScan');
  $('#switch-pad').hidden=!isScan();
  $('#help span').textContent=primary(helpPhrase);
  $('#hand-shortcut').setAttribute('aria-label',t('welcomeHand'));$('#hand-shortcut').title=t('welcomeHand');$('#hand-shortcut span').textContent=t('handControl');$('#eye-shortcut').title=t('eye');$('#settings').setAttribute('aria-label',t('setup'));$('#settings span').textContent=t('setup');$('#eye-shortcut').setAttribute('aria-label',t('eye'));$('#eye-shortcut span').textContent=t('eye');
  $('#pause-title').textContent=t('paused');$('#pause').textContent=t('pause');$('#resume').textContent=t('resume');$('#repeat').setAttribute('aria-label',t('repeat'));$('#clear').setAttribute('aria-label',t('clear'));$('#change-input').textContent=t('input');
  $('#message-caption').textContent=profileStore?.people.length>1?`${t('yourVoice')} · ${profileStore.active.name}`:t('yourVoice');
  $('#partner-view').setAttribute('aria-label',pt('view'));$('#partner-view').disabled=!lastPhrase;
  $('#take-break').textContent=ct('rest');$('#write-message').textContent=composerText('title',settings.language);updateTrackingNotice();
  $('#conversation-controls').setAttribute('aria-label',ct('tools'));
  for(const [id,label] of [['stop-speaking','stopSpeaking'],['wrong-selection','wrong'],['say-wait','wait'],['say-unsure','unsure']])$('#'+id).textContent=ct(label);
  if(!lastPhrase){$('#message').textContent=t('choose');$('#message-secondary').textContent='';$('#repeat').disabled=true;$('#clear').disabled=true;$('#repeat').classList.remove('speak-pending');$('#repeat').innerHTML=icon('Volume2');}
  else showMessage(lastPhrase);
  resetInput();refreshIcons();updateSpeechStatus();syncPageLayout();showDock();if(offlineReady)$('#offline-status').textContent=navigator.onLine?t('saved'):t('offline');
}
function showMessage(p){$('#message').textContent=primary(p);$('#message').lang=spokenLanguage(p,settings.language);$('#message-secondary').textContent=secondary(p);$('#message-secondary').lang=partnerLanguage(settings)||settings.language;$('#repeat').disabled=false;$('#clear').disabled=false;$('#partner-view').disabled=false;$('#repeat').setAttribute('aria-label',pendingSpeech?ct('speakNow'):t('repeat'));$('#repeat').classList.toggle('speak-pending',pendingSpeech);$('#repeat').innerHTML=pendingSpeech?escape(ct('speakNow')):icon('Volume2');$('#message-caption').textContent=(pendingSpeech?ct('preview'):ct('selected'))+(profileStore?.people.length>1?` · ${profileStore.active.name}`:'');}
function renderEyeBoard(){
  const bank=phraseBank(settings),ids=packIds(settings);
  const priority=packPhrases(settings);
  const all=[...priority.slice(2),...bank.filter(p=>!ids.includes(p.id)&&!['yes','no','help'].includes(p.id))];
  const capacity=eyeCapacity(innerWidth,innerHeight,settings.simple);document.body.dataset.eyeCapacity=capacity;
  const firstCount=capacity-4,pages=[[categories[0].phrases[0],categories[0].phrases[1],helpPhrase,...all.slice(0,firstCount)]];
  for(let i=firstCount;i<all.length;i+=capacity-1)pages.push(all.slice(i,i+capacity-1));
  for(const items of pages)while(items.length<capacity-1)items.push(null);
  eyePage%=pages.length;
  $('#title').textContent=t('eye');
  $('#category-hint').textContent=t('choose');
  $('#board').innerHTML=pages[eyePage].map(p=>p?`<button class="tile ${p.tone}" data-phrase="${p.id}" data-access><span class="tile-icon">${p.photo?`<img class="phrase-photo" src="${escape(p.photo)}" alt="">`:icon(p.icon)}</span><span class="tile-label" lang="${spokenLanguage(p,settings.language)}" dir="auto">${escape(primary(p))}</span><span class="tile-secondary" lang="${partnerLanguage(settings)||settings.language}" dir="auto">${escape(secondary(p))}</span><span class="dwell-progress"></span></button>`:`<div class="empty-position" aria-hidden="true"></div>`).join('')+`<button id="eye-more" class="tile neutral" data-access><span class="tile-icon">${icon('ChevronRight')}</span><span class="tile-label">${t('more')}</span><span class="tile-secondary">${eyePage+1} / ${pages.length}</span><span class="dwell-progress"></span></button>`;
}
function speak(p,languageOverride,useRecording=true){
  if(!settings.voice) return;
  stopOutput();
  const requested=languageOverride||(settings.speechLanguage&&settings.speechLanguage!=='auto'?settings.speechLanguage:settings.language);
  if((languageOverride||(settings.speechLanguage&&settings.speechLanguage!=='auto'))&&!exactTranslation(p,requested)){voiceStatus=pt('missing');updateSpeechStatus();return;}
  const voiceLanguage=spokenLanguage(p,requested);
  const embedded=p.embeddedAudio;
  const clip=useRecording&&(recordingLibrary.get(p.id,voiceLanguage,phraseText(p,requested))||(embedded?.blob instanceof Blob&&embedded.language===voiceLanguage&&embedded.text===phraseText(p,requested)?embedded:null));
  if(clip){voiceStatus=recordingText('playing',settings.language);recordedOutput.play(clip.blob,()=>{voiceStatus='Recorded audio could not play. The message is still shown.';updateSpeechStatus();});updateSpeechStatus();return true;}
  if(!('speechSynthesis' in window)){voiceStatus='Speech is unavailable. Show the message to your partner.';updateSpeechStatus();return;}
  const voices=speechSynthesis.getVoices();const matches=voices.filter(v=>v.lang.toLowerCase().startsWith(voiceLanguage));
  const voice=matches.find(v=>v.localService)||matches[0];
  if(!voice){voiceStatus=t('voiceMissing');updateSpeechStatus();return;}
  if(!navigator.onLine&&!voice.localService){voiceStatus='This voice needs internet. Use the visible message or install an offline voice.';updateSpeechStatus();return;}
  const utterance=new SpeechSynthesisUtterance(phraseText(p,requested));utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=0.85;
  utterance.onerror=(e)=>{if(e.error!=='interrupted'&&e.error!=='canceled'){voiceStatus='Audio could not play. The message is still shown.';updateSpeechStatus();}};
  voiceStatus=voice.localService?t('localVoice'):t('onlineVoice');
  speechSynthesis.speak(utterance);updateSpeechStatus();return true;
}
function choose(p,{immediate=false}={}){stopOutput();pendingSpeech=settings.review&&!immediate;lastPhrase=p;showMessage(p);if(!pendingSpeech)speak(p);refreshIcons();syncPageLayout();showDock();$('#message').classList.remove('pop');void $('#message').offsetWidth;$('#message').classList.add('pop');scanCooldown=performance.now()+1800;scanCursor.next=scanCooldown+settings.scan;}
function updateSpeechStatus(){
  const voices=window.speechSynthesis?.getVoices()||[];
  const found=voices.some(v=>v.lang.toLowerCase().startsWith(settings.speechLanguage&&settings.speechLanguage!=='auto'?settings.speechLanguage:settings.language));
  $('#speech-status').textContent=!settings.voice?t('voiceOff'):voiceStatus||(!found?t('voiceMissing'):t('voiceReady'));
  if($('#composer-voice'))$('#composer-voice').textContent=$('#speech-status').textContent;
  if($('#partner-voice-status'))$('#partner-voice-status').textContent=$('#speech-status').textContent;
  if($('#care-voice'))$('#care-voice').textContent=$('#speech-status').textContent;
  if($('#imported-voice-status'))$('#imported-voice-status').textContent=$('#speech-status').textContent;
}
window.speechSynthesis?.addEventListener('voiceschanged',updateSpeechStatus);
function resetInput(){scanAudio.stop();dwell.reset();hover=null;scanCursor.reset(performance.now(),settings.scan);document.querySelectorAll('.scanning,.dwelling').forEach(e=>e.classList.remove('scanning','dwelling'));}
function accessTargets(){return [...new Set([...(activeDialog&&activeDialog!=='eye'?[...$('#modal').querySelectorAll('button,[data-access]')]:[...document.querySelectorAll('#board [data-access]'),$('#help'),$('#repeat'),$('#clear'),$('#partner-view'),...document.querySelectorAll('#conversation-controls [data-access],#page-navigation [data-access],.access-bar [data-access]'),...(settings.mode==='eye'?[]:document.querySelectorAll('#categories [data-access]'))]),...dock.querySelectorAll('button')])].filter(e=>e&&!e.disabled&&e.getBoundingClientRect().width>0);}
function scanSelect(){
  if(printing||activeDialog==='eye'||paused||!scanning||!isScan()||document.hidden||!document.hasFocus()||performance.now()<scanCooldown)return;
  const target=scanCursor.selected(accessTargets());
  if(!target||!target.classList.contains('scanning'))return;
  scanCooldown=performance.now()+1800;scanAudio.stop();target.click();
}
function updateScanning(now){
  if(scanAudio.holdsScan(now))scanCursor.next=now+settings.scan;
  const targets=accessTargets(),{target,changed}=scanCursor.update(targets,now,settings.scan);
  document.querySelectorAll('.scanning').forEach(el=>{if(el!==target)el.classList.remove('scanning');});
  target?.classList.add('scanning');
  if(changed)target?.scrollIntoView({block:'nearest',inline:'nearest'});
  if(changed){
    scanAudio.stop();
    if(settings.scanAudio&&settings.voice&&!recordedOutput.audio&&!['recordings','audio-backup'].includes(activeDialog)){
      const label=target?.querySelector('.tile-label,span[lang]');
      const language=(label?.lang||target?.lang||settings.language).split('-')[0];
      scanAudio.preview(label?.textContent||targetName(target),language,now,settings.scanAudioRate);
    }
  }
  return target;
}
function setPause(value){paused=value;const overlay=$('#pause-overlay');overlay.hidden=!value;if(value){stopOutput();stopInputs();scanning=false;if(!overlay.open)overlay.showModal();}else overlay.close();render();$(value?'#resume':'#pause').focus({preventScroll:true});}
$('#pause-overlay').addEventListener('cancel',e=>{e.preventDefault();setPause(false);});
function updateTrackingNotice(){
  if($('#calibrate'))$('#calibrate').disabled=!camera.running||!!camera.calibratingUntil;
  scanAudio.holdsScan(performance.now());
  for(const el of [$('#scan-audio-live'),$('#scan-audio-status')])if(el){
    el.hidden=el.id==='scan-audio-live'&&(!settings.scanAudio||!isScan());
    const status=recordedOutput.audio?'busy':scanAudio.status;
    const message=!settings.voice?t('voiceOff'):scanAudioText(status,settings.language);
    if(el.textContent!==message)el.textContent=message;
  }
  if($('#motion-scan')){
    const ready=camera.running&&camera.calibrated&&!camera.calibratingUntil;
    $('#motion-scan').disabled=!ready;$('#motion-practice').disabled=!ready;
    const label=t(scanning?'stopScan':'startScan');if($('#motion-scan').textContent!==label)$('#motion-scan').textContent=label;
    $('#motion-scan').setAttribute('aria-pressed',String(scanning));
  }
  const cameraMode=['hand','eye','motion'].includes(settings.mode);trackingNotice.hidden=!cameraMode;
  let label='';
  if(cameraMode){const running=settings.mode==='eye'?eye.running:camera.running;
    label=!running?ct('cameraOff'):settings.mode==='eye'?!eye.ready?ct('calibrateFirst'):eyePoint?ct('trackingReady'):ct('trackingLost'):settings.mode==='hand'?!camera.origin?ct('calibrateFirst'):handPoint?ct('trackingReady'):ct('trackingLost'):!camera.calibrated||camera.calibratingUntil?ct('calibrateFirst'):ct('trackingReady');}
  if(trackingNotice.textContent!==label){trackingNotice.textContent=label;syncPageLayout();}
  if(activeDialog==='rest'&&$('#rest-description')){const text=ct(camera.running||eye.running?'restCamera':'restNoCamera');if($('#rest-description').textContent!==text)$('#rest-description').textContent=text;}
}

const camera=new CameraInput({
  calibrated:threshold=>{if(!savePreference('threshold',threshold))return false;const input=$('#threshold');if(input){input.value=threshold;input.dispatchEvent(new CustomEvent('input',{bubbles:true,detail:{calibration:true}}));}return true;},
  status:text=>{if($('#camera-status'))$('#camera-status').textContent=text;else toast(text);},
  point:point=>{handPoint=point;if(!point){showPointer(null);dwell.reset();document.querySelectorAll('.dwelling').forEach(e=>{e.classList.remove('dwelling');e.style.setProperty('--progress',0);});}},
  finger:point=>{const marker=$('#finger-marker');if(marker){marker.hidden=!point;if(point){marker.style.left=`${(1-point.x)*100}%`;marker.style.top=`${point.y*100}%`;}}},
  select:scanSelect,
  meter:(value,threshold)=>{if($('#motion-meter')){const text=movementReading(value,threshold);$('#motion-meter').value=value;$('#motion-meter').setAttribute('aria-valuetext',text);$('#motion-threshold').textContent=text;}}
});
const eye=new EyeInput({point:p=>{eyePoint=p;if(!p){showPointer(null);dwell.reset();document.querySelectorAll('.dwelling').forEach(e=>e.classList.remove('dwelling'));}},status:text=>{eyeStatus=text;},done:success=>{const practice=guidedEyePractice;guidedEyePractice=false;if(activeDialog==='eye')activeDialog=null;render();if(success&&practice)openDialog('practice');}});
function stopInputs(){scanAudio.stop();guidedEyePractice=false;camera.stop();eye.stop();eyePoint=null;eyeStatus=null;if(activeDialog==='eye'){activeDialog=null;}}

// Capture geometry before handlers run; protect transitions after they finish.
// Ordinary selections retain their selected-state feedback and scroll can repeat.
document.addEventListener('click',e=>{
  if(printing){e.preventDefault();e.stopImmediatePropagation();return;}
  const target=e.target.closest('button,[data-access]');
  if(!target||target.disabled)return;
  if(target.dataset.scroll&&(activeDialog||settings.mode==='eye'||boardOverflow))return;
  const rect=target.getBoundingClientRect(),dialog=activeDialog;
  queueMicrotask(()=>{if(!target.isConnected||activeDialog!==dialog)navigationRelease.block(rect);});
},true);
document.addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn)return;
  if(paused&&!['resume','close-dialog'].includes(btn.id))return;
  if(btn.dataset.scroll){if(!activeDialog&&settings.mode!=='eye'&&!boardOverflow){navigationRelease.block(btn.getBoundingClientRect());boardPage+=Number(btn.dataset.scroll);render();}else scrollPage(btn.dataset.scroll);return;}
  if(btn.id==='page-next'||btn.id==='page-back'){navigationRelease.block(btn.getBoundingClientRect());boardPage+=btn.id==='page-next'?1:-1;render();return;}
  if(btn.id==='board-topics'){navigationRelease.block(btn.getBoundingClientRect());openDialog('topics');return;}
  if(btn.id==='dock-home'){navigationRelease.block(btn.getBoundingClientRect());if(activeDialog)closeDialog();category='essentials';boardPage=0;eyePage=0;render();window.scrollTo({top:0,behavior:'instant'});return;}
  if(btn.id==='dock-setup'){if(activeDialog!=='quick')openDialog('quick');return;}
  if(btn.dataset.category){navigationRelease.block(btn.getBoundingClientRect());category=btn.dataset.category;boardPage=0;if(activeDialog==='topics')closeDialog();render();}
  if(btn.dataset.phrase){const phrase=phraseBank(settings).find(p=>p.id===btn.dataset.phrase);if(phrase)choose(phrase,{immediate:['help','repair-wrong'].includes(phrase.id)});}
  if(btn.id==='eye-more'){eyePage++;eyeNeedsRelease=true;render();}
  if(btn.id==='help')choose(helpPhrase,{immediate:true});
  if(btn.id==='repeat'&&lastPhrase){pendingSpeech=false;showMessage(lastPhrase);speak(lastPhrase);refreshIcons();}
  if(btn.id==='stop-speaking'){stopOutput();$('#message-caption').textContent=ct('stopped');}
  if(btn.id==='wrong-selection')choose(repairPhrases.wrong,{immediate:true});
  if(btn.id==='say-wait')choose(repairPhrases.wait);
  if(btn.id==='say-unsure')choose(repairPhrases.unsure);
  if(btn.id==='clear'){stopOutput();pendingSpeech=false;lastPhrase=null;$('#message-secondary').textContent='';$('#repeat').disabled=true;$('#clear').disabled=true;$('#repeat').classList.remove('speak-pending');$('#repeat').innerHTML=icon('Volume2');$('#message-caption').textContent=t('yourVoice');render();}
  if(btn.id==='language')openDialog('languages');
  if(btn.id==='pause')setPause(true);
  if(btn.id==='partner-view'&&lastPhrase){navigationRelease.block(btn.getBoundingClientRect());openDialog('partner');}
  if(btn.id==='write-message'){navigationRelease.block(btn.getBoundingClientRect());openDialog('composer');}
  if(btn.id==='describe-care'){navigationRelease.block(btn.getBoundingClientRect());openDialog('care');}
  if(btn.id==='take-break'){navigationRelease.block(btn.getBoundingClientRect());stopOutput();restScanning=scanning;openDialog('rest');if(isScan())scanning=true;}
  if(btn.id==='rest-resume'){navigationRelease.block(btn.getBoundingClientRect());closeDialog();}
  if(btn.id==='rest-input'){closeDialog();openDialog('input');}
  if(btn.id==='rest-off'){closeDialog();setPause(true);}
  if(btn.id==='resume')setPause(false);
  if(btn.id==='settings')openDialog('quick');
  if(btn.id==='hand-shortcut')openHandSetup();
  if(btn.id==='eye-shortcut')openEyeSetup();
  if(btn.id==='guide')openDialog('welcome');
  if(btn.id==='change-input')openDialog('input');
  if(btn.id==='add-first')openDialog('phrases');
  if(btn.id==='close-dialog')closeDialog();
  if(btn.id==='scan-start'){scanAudio.stop();scanning=!scanning;scanCooldown=0;render();}
  if(btn.classList.contains('switch-pad'))scanSelect();
});
// Native button activation must also stop while the print view owns interaction.
for(const type of ['keydown','keyup'])document.addEventListener(type,e=>{
  if(printing){e.preventDefault();e.stopImmediatePropagation();}
  else if(type==='keydown'&&e.repeat&&(e.key==='Escape'||([' ','Enter'].includes(e.key)&&e.target.closest?.('button')))){e.preventDefault();e.stopImmediatePropagation();}
},true);
document.addEventListener('keydown',e=>{
  if(activeDialog&&activeDialog!=='eye'&&isScan()&&scanning&&!paused&&!e.repeat&&[' ','Enter'].includes(e.key)&&!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();scanSelect();return;}
  if(e.key==='Escape'){if(!activeDialog){e.preventDefault();setPause(!paused);}return;}
  if(activeDialog||paused||e.repeat||['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName))return;
  if(isScan()&&[' ','Enter'].includes(e.key)){e.preventDefault();scanSelect();}
});
// A switch also works after a button click has left focus on a control.
document.addEventListener('keydown',e=>{
  if(!activeDialog&&!paused&&!e.repeat&&isScan()&&scanning&&e.target.tagName==='BUTTON'&&[' ','Enter'].includes(e.key)){
    e.preventDefault();scanSelect();
  }
});
document.addEventListener('pointermove',e=>{mousePoint={x:e.clientX,y:e.clientY};if(settings.mode==='dwell')hover=e.target.closest('[data-access],button');});
document.addEventListener('pointerout',e=>{if(!e.relatedTarget)hover=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){audioBackupSession?.dispose();audioBackupSession=null;recordingSession?.dispose();recordingSession=null;stopInputs();scanning=false;resetInput();stopOutput();}else{render();if(activeDialog==='recordings'||activeDialog==='audio-backup')openDialog(activeDialog);}});
window.addEventListener('blur',()=>{scanAudio.stop();hover=null;dwell.reset();});
window.addEventListener('focus',()=>{
  hover=null;dwell.reset();
  if(scanning&&!document.hidden)scanCursor.next=performance.now()+settings.scan;
});
window.addEventListener('pagehide',()=>{audioBackupSession?.dispose();recordingSession?.dispose();stopOutput();stopInputs();});
let resizeTimer;
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(settings.mode!=='eye'||!eye.running)render();},200);});
window.addEventListener('beforeprint',()=>{printing=true;stopOutput();resetInput();render();});
window.addEventListener('afterprint',()=>{printing=false;document.body.classList.remove('printing-passport');$('#passport-print-sheet')?.remove();render();});

function frame(now){
  if(printing){requestAnimationFrame(frame);return;}
  updateTrackingNotice();
  if(activeDialog==='practice'&&practiceSession)practiceSession.tick(now,!document.hidden&&document.hasFocus(),settings.mode==='eye'?!!eyePoint:settings.mode==='hand'?!!handPoint:settings.mode==='motion'?camera.running&&!camera.calibratingUntil:true);
  if(activeDialog&&activeDialog!=='eye'&&!paused&&!document.hidden&&document.hasFocus()){
    if(isScan()&&scanning)updateScanning(now);
    const point=settings.mode==='hand'?handPoint:settings.mode==='eye'?eyePoint:null;
    const hit=point?document.elementFromPoint(point.x,point.y)?.closest('button,[data-access]'):settings.mode==='dwell'?hover:null;
    const target=navigationRelease.allows(settings.mode==='dwell'?mousePoint:point)&&accessTargets().includes(hit)?hit:null;
    const duration=settings.mode==='eye'?Math.max(settings.dwell,1800):settings.dwell;
    const result=dwell.update(target,now,duration);
    accessTargets().forEach(el=>{el.classList.toggle('dwelling',el===target);el.style.setProperty('--progress',el===target?result.progress:0);});
    showPointer(point,target?`${targetName(target)} · ${((1-result.progress)*duration/1000).toFixed(1)}s`:'Point at a control',result.progress,dwell.fired);
    if(result.fire){target.click();if(target.dataset.scroll)dwell.reset();}
    requestAnimationFrame(frame);return;
  }
  if(settings.mode==='eye'){
    $('#input-hint').textContent=eyeStatus||t('eyeOff');
    if(!paused&&!activeDialog&&!document.hidden&&document.hasFocus()&&eye.ready){
      let target=eyePoint?document.elementFromPoint(eyePoint.x,eyePoint.y)?.closest('[data-access]'):null;
      if(!accessTargets().includes(target))target=null;
      if(!navigationRelease.allows(eyePoint))target=null;
      if(target?.id!=='eye-more')eyeNeedsRelease=false;
      if(eyeNeedsRelease)target=null;
      const duration=Math.max(1800,settings.dwell),result=dwell.update(target,now,duration);
      accessTargets().forEach(el=>{el.classList.toggle('dwelling',el===target);el.style.setProperty('--progress',el===target?result.progress:0);});
      showPointer(eyePoint,target?`${dwell.fired?'Selected':'Looking at'}: ${targetName(target)}${dwell.fired?' · look away':` · ${((1-result.progress)*duration/1000).toFixed(1)}s`}`:'Look at a large tile',result.progress,dwell.fired);
      if(result.fire){target.click();if(target.dataset.scroll)dwell.reset();}
    }else showPointer(null);
    requestAnimationFrame(frame);return;
  }
  if(settings.mode==='hand'){
    if(paused||document.hidden||!document.hasFocus())showPointer(null);
    else if(activeDialog)showPointer(activeDialog==='input'?handPoint:null,'Practice pointer · no selection');
    else if(!handPoint)showPointer(null);
    if(!activeDialog){
      $('#input-hint').textContent=t(!camera.running?'handCameraOff':!camera.origin?'handRestNeeded':!handPoint?'handNotVisible':'handPointerHint');
    }
  }else showPointer(null);
  if(!paused&&!activeDialog&&!document.hidden&&document.hasFocus()){
    const targets=accessTargets();
    if(isScan()&&scanning){
      const scanned=updateScanning(now);
      
      if(settings.mode==='motion')$('#input-hint').textContent=t('motionSelect').replace('{item}',targetName(scanned));
    }
    if(settings.mode==='dwell'||settings.mode==='hand'){
      let scrolling=false;
      if(settings.mode==='hand'&&handPoint){
        const dy=handPoint.y>innerHeight-36?4:handPoint.y<36?-4:0;
        if(dy&&((dy>0&&scrollY+innerHeight<document.documentElement.scrollHeight)||(dy<0&&scrollY>0))){window.scrollBy(0,dy);scrolling=true;}
        const nav=$('#categories'),r=nav.getBoundingClientRect();
        if(handPoint.y>r.top&&handPoint.y<r.bottom&&nav.scrollWidth>nav.clientWidth){const dx=handPoint.x>r.right-30?4:handPoint.x<r.left+30?-4:0;if(dx){nav.scrollBy(dx,0);scrolling=true;}}
      }
      const hit=settings.mode==='hand'?(!scrolling&&handPoint?document.elementFromPoint(handPoint.x,handPoint.y)?.closest('[data-access]'):null):hover;
      const target=navigationRelease.allows(settings.mode==='hand'?handPoint:mousePoint)&&targets.includes(hit)?hit:null;
      const result=dwell.update(target,now,settings.dwell);
      targets.forEach(el=>{el.classList.toggle('dwelling',el===target);el.style.setProperty('--progress',el===target?result.progress:0);});
      if(settings.mode==='hand')showPointer(handPoint,scrolling?'Scrolling…':target?`${dwell.fired?'Selected':'Selecting'}: ${targetName(target)}${dwell.fired?' · move away':` · ${Math.max(0,(1-result.progress)*settings.dwell/1000).toFixed(1)}s`}`:'Point at a tile to select',result.progress,dwell.fired);
    if(result.fire){target.click();if(target.dataset.scroll)dwell.reset();}
    }
  }
  requestAnimationFrame(frame);
}
function targetName(target){return target?.querySelector('.tile-label')?.textContent||target?.getAttribute('aria-label')||target?.innerText.replace(/\s+/g,' ').trim()||'';}

function openDialog(type){
  importedBoardsSession?.dispose();importedBoardsSession=null;
  boardExportSession?.dispose();boardExportSession=null;
  if(type!=='input')guidedPracticePending=false;
  if(audioBackupSession){audioBackupSession.dispose();audioBackupSession=null;}
  if(recordingSession){recordingSession.dispose();recordingSession=null;}
  if(offlineSession){offlineSession.dispose();offlineSession=null;}
  if(activeDialog==='practice'&&type!=='practice'){practiceSession=null;if(practiceScanning!==null){scanning=practiceScanning;practiceScanning=null;}}
  camera.park();
  showPointer(null);
  activeDialog=type;resetInput();$('#dialog-title').textContent={settings:'Your communication, your way',input:'Find a comfortable way to select',phrases:'Make room for your own words',welcome:'Welcome to Reach'}[type];
  const body=$('#dialog-body');
  if(type==='imported-boards'){
    $('#dialog-title').textContent=importedText('title',settings.language);const person=profileStore.active.id;
    importedBoardsSession=mountImportedBoards(body,{library:boardLibrary,person,interfaceLanguage:settings.language,isCurrent:()=>profileStore.active.id===person,onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onClose:closeDialog,onSpeak:p=>{choose(p,{immediate:true});updateSpeechStatus();},onStop:()=>{stopOutput();voiceStatus=ct('stopped');updateSpeechStatus();},onHelp:()=>choose(helpPhrase,{immediate:true}),onDelete:id=>{if(lastPhrase?.id.startsWith(`imported:${id}:`)){stopOutput();lastPhrase=null;pendingSpeech=false;render();}}});
  }
  if(type==='board-export'){
    $('#dialog-title').textContent='Export an open-format board';
    boardExportSession=mountBoardExport(body,{phrases:packPhrases(settings),language:settings.language,name:t(settings.profile),icons,library:recordingLibrary,onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onClose:closeDialog});
  }
  if(type==='phrase-new'){
    $('#dialog-title').textContent=phraseEditText('create',settings.language);
    const phrase={id:`custom-${crypto.randomUUID()}`,en:'',th:'',translations:{},sourceLanguage:settings.language,icon:'MessageCircle',tone:'neutral'};
    mountPhraseEditor(body,{icons,phrase,language:settings.language,creating:true,phrases:phraseBank(settings),onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onCancel:()=>openDialog('phrases'),onSave:next=>{
      if(settings.phrases.length>=200)throw Error('You have 200 phrases. Export a backup before removing any.');
      const previous=settings.phrases;settings.phrases=[...previous,next];
      if(!save()){settings.phrases=previous;return;}
      render();openDialog('phrases');
    }});
  }
  if(type==='phrase-edit'){
    const phrase=settings.phrases.find(p=>p.id===editedPhraseId);if(!phrase){openDialog('phrases');return;}
    $('#dialog-title').textContent=phraseEditText('title',settings.language);mountPhraseEditor(body,{icons,phrase,language:settings.language,phrases:phraseBank(settings),onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onCancel:()=>openDialog('phrases'),onSave:next=>{const old=settings.phrases,index=old.findIndex(p=>p.id===next.id);if(index<0){toast('This phrase is no longer available.');return;}settings.phrases=old.map((p,i)=>i===index?next:p);if(!save()){settings.phrases=old;return;}render();openDialog('phrases');}});
  }
  if(type==='phrase-remove'){
    const phrase=settings.phrases.find(p=>p.id===editedPhraseId);if(!phrase){openDialog('phrases');return;}$('#dialog-title').textContent=phraseEditText('remove',settings.language);body.replaceChildren();const text=document.createElement('p');text.className='care-review';text.dir='auto';text.textContent=primary(phrase);const note=document.createElement('p');note.className='intro';note.textContent=phraseEditText('removeHint',settings.language);const remove=document.createElement('button');remove.id='phrase-remove-confirm';remove.className='secondary-button';remove.dataset.access='';remove.textContent=phraseEditText('remove',settings.language);remove.onclick=()=>{navigationRelease.block(remove.getBoundingClientRect());const old=settings.phrases;settings.phrases=old.filter(p=>p.id!==editedPhraseId);if(!save()){settings.phrases=old;return;}render();openDialog('phrases');};const keep=document.createElement('button');keep.id='phrase-remove-cancel';keep.className='secondary-button';keep.dataset.access='';keep.textContent=phraseEditText('keep',settings.language);keep.onclick=()=>openDialog('phrases');body.append(text,note,remove,keep);
  }
  body.lang=settings.language;body.dir=settings.language==='ar'?'rtl':'ltr';$('#dialog-title').dir='auto';
  if(type==='setup-guide')mountSetupGuide(body,{settings,draft:guideDraft('read'),onDraftChange:value=>guideDraft('write',value),onTitle:title=>$('#dialog-title').textContent=title,onClose:closeDialog,onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onApply:next=>{const previous=settings;settings=next;if(!save()){settings=previous;return false;}guideDraft('clear');stopOutput();stopInputs();scanning=false;render();if(['hand','motion','eye'].includes(settings.mode)){openDialog('input');guidedPracticePending=true;}else openDialog('practice');return true;}});
  if(type==='audio-backup'){$('#dialog-title').textContent=audioBackupText('title',settings.language);audioBackupSession=mountAudioBackup(body,{library:recordingLibrary,language:settings.language,phrases:phraseBank(settings),textFor:exactTranslation,onClose:closeDialog,onStop:stopOutput,onTransition:b=>navigationRelease.block(b.getBoundingClientRect())});}
  if(type==='recordings'){
    $('#dialog-title').textContent=recordingText('title',settings.language);const lang=settings.speechLanguage&&settings.speechLanguage!=='auto'?settings.speechLanguage:settings.language;
    recordingSession=mountRecordings(body,{library:recordingLibrary,language:lang,uiLanguage:settings.language,onBackup:()=>openDialog('audio-backup'),backupLabel:audioBackupText('title',settings.language),phrases:phraseBank(settings).map(p=>({id:p.id,text:exactTranslation(p,lang)})).filter(p=>p.text),onClose:closeDialog,onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onStop:stopOutput});
  }
  if(type==='offline'){$('#dialog-title').textContent=offlineText('title',settings.language);offlineSession=mountOffline(body,{settings,onClose:closeDialog,onTest:()=>speak(categories[0].phrases[0],undefined,false),onStop:()=>stopOutput(),onTransition:b=>navigationRelease.block(b.getBoundingClientRect())});}
  if(type==='people'){
    const text=key=>profileText(key,settings.language);$('#dialog-title').textContent=text('title');
    body.innerHTML=`<p class="intro">${text('intro')}</p><div id="person-list" class="profile-choices"></div><label for="person-name">${text('name')}</label><input id="person-name" dir="auto" maxlength="60"><div class="backup-row"><button id="person-create" data-access class="primary-button">${text('create')}</button><button id="person-rename" data-access class="secondary-button">${text('rename')}</button></div><div id="person-confirm" class="note" hidden></div><button id="people-done" data-access class="secondary-button">${text('done')}</button>`;
    const attempt=fn=>{try{fn();}catch(error){toast(error.message);}};
    for(const person of profileStore?.people||[]){const row=document.createElement('div');row.className='person-row';const select=document.createElement('button');select.className='profile-choice';select.dataset.person=person.id;select.dataset.access='';select.textContent=person.name;select.dir='auto';const current=person.id===profileStore.active.id;select.setAttribute('aria-pressed',String(current));if(current)select.textContent+=` · ${text('current')}`;select.onclick=()=>{if(current)return;navigationRelease.block(select.getBoundingClientRect());if(save())attempt(()=>{profileStore.activate(person.id);loadPerson();});};row.append(select);
      if(!current){const remove=document.createElement('button');remove.className='secondary-button';remove.dataset.access='';remove.dataset.removePerson=person.id;remove.textContent=text('remove');remove.setAttribute('aria-label',`${text('remove')} · ${person.name}`);remove.onclick=()=>{navigationRelease.block(remove.getBoundingClientRect());const confirm=$('#person-confirm');confirm.hidden=false;confirm.replaceChildren();const p=document.createElement('p');p.textContent=`${person.name}: ${text('warning')}`;const yes=document.createElement('button');yes.id='person-delete-confirm';yes.dataset.access='';yes.className='secondary-button';yes.textContent=text('remove');yes.onclick=()=>attempt(()=>{navigationRelease.block(yes.getBoundingClientRect());recordingLibrary.removePerson(person.id).then(()=>boardLibrary.removePerson(person.id)).then(()=>{profileStore.remove(person.id);openDialog('people');}).catch(error=>toast(error.message));});const no=document.createElement('button');no.dataset.access='';no.className='secondary-button';no.textContent=text('cancel');no.onclick=()=>{confirm.hidden=true;};confirm.append(p,yes,no);confirm.scrollIntoView({block:'nearest'});};row.append(remove);}$('#person-list').append(row);
    }
    $('#person-create').onclick=e=>{navigationRelease.block(e.currentTarget.getBoundingClientRect());const name=$('#person-name').value;if(save())attempt(()=>{profileStore.create(name,crypto.randomUUID());loadPerson();});};
    $('#person-rename').onclick=e=>attempt(()=>{navigationRelease.block(e.currentTarget.getBoundingClientRect());profileStore.rename($('#person-name').value);openDialog('people');});$('#people-done').onclick=closeDialog;
  }
  if(type==='passport'){
    $('#dialog-title').textContent=passportText('title',settings.language);
    mountPassport(body,{settings,languageName:languages.find(l=>l.id===settings.language).name,inputLabel:t(settings.mode),onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onClose:closeDialog,onSave:value=>{const previous=settings.passport;settings.passport=value;if(save())return true;settings.passport=previous;return false;},onDownload:html=>{const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='reach-communication-card.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},onPrint:options=>{const sheet=passportCard(options);sheet.id='passport-print-sheet';$('#passport-print-sheet')?.remove();document.body.append(sheet);document.body.classList.add('printing-passport');window.print();}});
  }
  if(type==='care'){
    $('#dialog-title').textContent=careText('title',settings.language);
    mountCare(body,{draft:careDraft,language:settings.language,onSpeak:p=>choose(p,{immediate:true}),onStop:()=>stopOutput(),onClose:closeDialog,onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onStatus:updateSpeechStatus});
  }
  if(type==='partner'){
    $('#dialog-title').textContent=pt('view');
    const lang=partnerLanguage(settings),text=lang&&lastPhrase?exactTranslation(lastPhrase,lang):null;
    const source=lastPhrase?spokenLanguage(lastPhrase,settings.language):settings.language;
    const name=id=>languages.find(l=>l.id===id)?.name||id;
    body.innerHTML=`<div class="partner-message"><small>${escape(name(source))}</small><p id="partner-primary" lang="${source}" dir="auto">${escape(lastPhrase?primary(lastPhrase):'')}</p></div>${lang?`<div class="partner-message"><small>${escape(name(lang))}</small><p id="partner-translation" lang="${text?lang:settings.language}" dir="auto">${escape(text||pt('missing'))}</p></div>`:''}<div class="backup-row"><button id="partner-speak" data-access class="primary-button" ${!text||!settings.voice?'disabled':''}>${pt('speak')}</button><button id="partner-stop" data-access class="secondary-button">${ct('stopSpeaking')}</button></div><p id="partner-voice-status" role="status"></p><button id="partner-settings" data-access class="setting-link">${pt('settings')}</button><button id="partner-back" data-access class="secondary-button">${t('back')}</button>`;
    $('#partner-speak').onclick=()=>{pendingSpeech=false;showMessage(lastPhrase);speak(lastPhrase,lang);refreshIcons();};
    $('#partner-stop').onclick=()=>stopOutput();
    $('#partner-settings').onclick=()=>openDialog('communication-languages');$('#partner-back').onclick=closeDialog;
  }
  if(type==='communication-languages'){
    $('#dialog-title').textContent=pt('settings');
    const choices=(key,extra)=>`<div class="language-choices">${[...extra,...languages].map(l=>`<button data-language-setting="${key}" data-language-value="${l.id}" data-access aria-pressed="${(key==='partnerLanguage'?(partnerLanguage(settings)||'none'):(settings[key]||'auto'))===l.id}" class="language-choice ${(key==='partnerLanguage'?(partnerLanguage(settings)||'none'):(settings[key]||'auto'))===l.id?'selected':''}" ${languages.some(x=>x.id===l.id)?`lang="${l.id}"`:''}>${escape(l.name)}</button>`).join('')}</div>`;
    body.innerHTML=`<p class="intro">${pt('hint')}</p><button id="board-language-settings" data-access class="setting-link">${t('language')} · ${languages.find(l=>l.id===settings.language).name}</button><h3>${pt('partner')}</h3>${choices('partnerLanguage',[{id:'none',name:pt('none')}])}<h3>${pt('speech')}</h3>${choices('speechLanguage',[{id:'auto',name:pt('board')}])}<button id="communication-languages-done" data-access class="primary-button">${t('done')}</button>`;
    body.querySelectorAll('[data-language-setting]').forEach(b=>b.onclick=()=>{navigationRelease.block(b.getBoundingClientRect());if(!savePreference(b.dataset.languageSetting,b.dataset.languageValue))return;stopOutput();voiceStatus='';render();openDialog(type);});
    $('#board-language-settings').onclick=()=>openDialog('languages');$('#communication-languages-done').onclick=closeDialog;
  }
  if(type==='composer'){
    if(!composerDraft.text)composerDraft=new MessageDraft(settings.language);
    $('#dialog-title').textContent=composerText('title',composerDraft.language);
    const phraseList=[...packPhrases(settings).filter(Boolean),...phraseBank(settings).filter(p=>!packIds(settings).includes(p.id))];
    mountComposer(body,{draft:composerDraft,phrases:phraseList,onTransition:b=>navigationRelease.block(b.getBoundingClientRect()),onClose:closeDialog,onStop:()=>stopOutput(),onDraftChange:()=>save(),onSpeak:p=>{choose(p,{immediate:true});},onSave:p=>{
      const existing=settings.phrases.find(x=>x.en===p.en&&(x.sourceLanguage||'en')===p.sourceLanguage);
      if(!existing&&settings.phrases.length>=200){toast(composerText('full',composerDraft.language));return false;}
      return existing?save():savePreference('phrases',[...settings.phrases,{...p,id:`custom-${crypto.randomUUID()}`}]);
    }});
  }
  if(type==='practice'){
    $('#dialog-title').textContent=practiceText('title',settings.language);practiceScanning??=scanning;scanning=isScan();
    const ready=()=>settings.mode==='eye'?eye.ready:settings.mode==='hand'?camera.running&&!!camera.origin:settings.mode==='motion'?camera.running&&camera.calibrated&&!camera.calibratingUntil:true;
    const block=button=>{const p=settings.mode==='eye'?eyePoint:settings.mode==='hand'?handPoint:mousePoint;if(button)navigationRelease.block(button.getBoundingClientRect());else if(p)navigationRelease.block({left:p.x-45,right:p.x+45,top:p.y-45,bottom:p.y+45});};
    practiceSession=mountPractice(body,{language:settings.language,assisted:settings.setupGuide?.helper===true,modeLabel:t(settings.mode),ready,onTransition:block,onClose:closeDialog,onChange:()=>{closeDialog();openDialog('input');},onSlower:()=>{const previous=settings;settings={...settings,dwell:Math.min(4000,settings.dwell+400),scan:Math.min(8000,settings.scan+400)};if(!save()){settings=previous;return;}closeDialog();openDialog('input');},onLarger:()=>{if(savePreference('simple',true))closeDialog();}});
  }
  if(type==='rest'){$('#dialog-title').textContent=ct('resting');body.innerHTML=`<p id="rest-description" class="intro">${ct(camera.running||eye.running?'restCamera':'restNoCamera')}</p><div class="rest-choices"><button id="rest-resume" data-access class="primary-button">${t('resume')}</button><button id="rest-input" data-access class="secondary-button">${t('input')}</button><button id="rest-off" data-access class="secondary-button">${ct('turnOff')}</button></div>`;}
  if(type==='topics'){$('#dialog-title').textContent=ct('topics');body.innerHTML=`<div class="topic-choices">${categories.map(c=>`<button data-category="${c.id}" data-access class="profile-choice"><strong>${escape(primary(c))}</strong></button>`).join('')}</div>`;}
  if(type==='topics'){const b=document.createElement('button');b.id='describe-care';b.dataset.access='';b.className='profile-choice';b.textContent=careText('title',settings.language);body.querySelector('.topic-choices').prepend(b);}
  if(type==='pack'){
    packDraft??=packIds(settings);const bank=phraseBank(settings),lookup=new Map(bank.map(p=>[p.id,p]));
    $('#dialog-title').textContent=`${t(settings.profile)} · ${ct('editPack')}`;
    const button=(id,label)=>`<button id="${id}" data-access class="secondary-button">${escape(label)}</button>`;
    body.innerHTML=`<p class="intro">${ct('packHint')}</p>`;
    if(packSlot===null){
      body.innerHTML+=`<div class="pack-positions">${packDraft.map((id,i)=>`<button data-pack-slot="${i}" data-access class="profile-choice" ${i<2?'disabled':''}><small>${i+1}</small><strong>${escape(lookup.has(id)?primary(lookup.get(id)):ct('emptySlot'))}</strong></button>`).join('')}</div><div class="backup-row">${packDraft.length<MAX_PACK_SLOTS?button('pack-add',ct('addSlot')):''}${button('pack-restore',ct('restorePack'))}</div><div class="dialog-actions">${button('pack-discard',ct('discardPack'))}<button id="pack-apply" data-access class="primary-button">${ct('applyPack')}</button></div>`;
      body.querySelectorAll('[data-pack-slot]').forEach(b=>b.onclick=()=>{navigationRelease.block(b.getBoundingClientRect());packSlot=Number(b.dataset.packSlot);openDialog('pack');$('#modal').scrollTop=0;});
      if($('#pack-add'))$('#pack-add').onclick=()=>{packSlot=packDraft.length;packDraft.push(null);openDialog('pack');$('#modal').scrollTop=0;};
      $('#pack-restore').onclick=e=>{navigationRelease.block(e.currentTarget.getBoundingClientRect());packDraft=[...presets[settings.profile]];openDialog('pack');};
      $('#pack-discard').onclick=()=>{packDraft=null;closeDialog();};
      $('#pack-apply').onclick=e=>{navigationRelease.block(e.currentTarget.getBoundingClientRect());if(!savePreference('packs',{...settings.packs,[settings.profile]:[...packDraft]}))return;packDraft=null;category='essentials';boardPage=0;eyePage=0;closeDialog();};
    }else{
      body.innerHTML+=`<div class="backup-row">${button('pack-back',t('back'))}${button('pack-hide',ct('hideSlot'))}</div><div class="pack-catalog">${bank.map(p=>`<button data-pack-phrase="${p.id}" data-access class="profile-choice"><strong>${escape(primary(p))}</strong><small>${escape(secondary(p))}</small></button>`).join('')}</div>`;
      const returnToPack=()=>{packSlot=null;openDialog('pack');$('#modal').scrollTop=0;};
      $('#pack-back').onclick=returnToPack;
      $('#pack-hide').onclick=e=>{navigationRelease.block(e.currentTarget.getBoundingClientRect());packDraft[packSlot]=null;returnToPack();};
      body.querySelectorAll('[data-pack-phrase]').forEach(b=>b.onclick=()=>{navigationRelease.block(b.getBoundingClientRect());packDraft[packSlot]=b.dataset.packPhrase;returnToPack();});
    }
  }
  if(type==='quick'||type==='languages'){
    $('#dialog-title').textContent=type==='languages'?t('language'):t('setup');
    body.innerHTML=`<h3>${t('step1')}</h3><div class="language-choices">${languages.map(l=>`<button data-lang="${l.id}" data-access class="language-choice ${l.id===settings.language?'selected':''}" lang="${l.id}">${l.name}<small>${l.label}</small></button>`).join('')}</div>`;
    if(type==='quick')body.innerHTML+=`<h3>${t('step2')}</h3><div class="profile-choices">${Object.keys(presets).map(id=>`<button data-profile="${id}" data-access class="profile-choice ${settings.profile===id?'selected':''}"><strong>${t(id)}</strong><small>${t(id+'Desc')}</small></button>`).join('')}</div><h3>${t('step3')}</h3><button id="quick-input" data-access class="setting-link"><span><strong>${t('input')}</strong><small>${t(settings.mode)}</small></span>${icon('ChevronRight')}</button><button id="quick-advanced" data-access class="secondary-button">${t('customize')}</button>`;
    if(type==='quick')body.innerHTML+=`<button id="edit-pack" data-access class="setting-link">${ct('editPack')}</button><button id="review-toggle" data-access class="profile-choice review-choice" aria-pressed="${settings.review}"><strong>${ct('review')} · ${primary(categories[0].phrases[settings.review?0:1])}</strong><small>${ct('reviewHint')}</small></button>`;
    body.innerHTML+=`<div class="dialog-actions"><button id="quick-done" data-access class="primary-button">${t('done')}</button></div>`;
    const languageButton=document.createElement('button');languageButton.id='communication-languages';languageButton.dataset.access='';languageButton.className='setting-link';languageButton.textContent=pt('settings');languageButton.onclick=()=>openDialog('communication-languages');$('#quick-done').parentElement.before(languageButton);
    if(type==='quick'){const b=document.createElement('button');b.id='open-passport';b.className='setting-link';b.dataset.access='';b.textContent=passportText('title',settings.language);b.onclick=()=>openDialog('passport');languageButton.after(b);}
    if(type==='quick'){const b=document.createElement('button');b.id='open-people';b.className='setting-link';b.dataset.access='';b.textContent=`${profileText('title',settings.language)} · ${profileStore?.active.name||''}`;b.onclick=()=>openDialog('people');body.prepend(b);}
    if(type==='quick'){const b=document.createElement('button');b.id='open-setup-guide';b.className='setting-link';b.dataset.access='';b.textContent=guideText('title',settings.language);b.onclick=()=>openDialog('setup-guide');body.prepend(b);}
    if(type==='quick'){const b=document.createElement('button');b.id='open-offline';b.className='setting-link';b.dataset.access='';b.textContent=offlineText('title',settings.language);b.onclick=()=>openDialog('offline');languageButton.after(b);}
    if(type==='quick'){
      const section=document.createElement('section'),row=document.createElement('div');row.className='backup-row';
      for(const [id,action] of [['awake-enable',()=>screenAwake.enable()],['awake-disable',()=>screenAwake.release()]]){const b=document.createElement('button');b.id=id;b.className='secondary-button';b.dataset.access='';b.onclick=action;row.append(b);}
      const status=document.createElement('p');status.id='awake-status';status.setAttribute('role','status');const note=document.createElement('p');note.className='note';note.textContent=awakeText('note',settings.language);section.append(row,status,note);$('#quick-done').parentElement.before(section);updateAwake();
    }
    if(type==='quick'){const b=document.createElement('button');b.id='open-recordings';b.className='setting-link';b.dataset.access='';b.textContent=recordingText('title',settings.language);b.onclick=()=>openDialog('recordings');languageButton.after(b);}
    if(type==='quick'){const b=document.createElement('button');b.id='open-board-export';b.className='setting-link';b.dataset.access='';b.textContent='Export board to another app';b.onclick=()=>openDialog('board-export');languageButton.after(b);}
    if(type==='quick'){const b=document.createElement('button');b.id='open-imported-boards';b.className='setting-link';b.dataset.access='';b.textContent=importedText('title',settings.language);b.onclick=()=>openDialog('imported-boards');languageButton.after(b);}
    if(type==='quick'){const b=document.createElement('button');b.id='quick-practice';b.className='setting-link';b.dataset.access='';b.textContent=practiceText('title',settings.language);b.onclick=()=>openDialog('practice');$('#quick-input').after(b);}
    if($('#edit-pack'))$('#edit-pack').onclick=()=>{packDraft=packIds(settings);packSlot=null;openDialog('pack');$('#modal').scrollTop=0;};
    if($('#review-toggle'))$('#review-toggle').onclick=()=>{if(savePreference('review',!settings.review))openDialog(type);};
    body.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{if(!savePreference('language',b.dataset.lang))return;voiceStatus='';render();openDialog(type);});
    body.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{if(!savePreference('profile',b.dataset.profile))return;category='essentials';boardPage=0;eyePage=0;render();openDialog(type);});
    if($('#quick-input'))$('#quick-input').onclick=()=>openDialog('input');if($('#quick-advanced'))$('#quick-advanced').onclick=()=>openDialog('settings');$('#quick-done').onclick=closeDialog;
  }
  if(type==='welcome'){
    $('#dialog-title').textContent=t('welcomeTitle');
    body.innerHTML=`<div class="language-choices">${languages.map(l=>`<button data-welcome-lang="${l.id}" data-access class="language-choice ${l.id===settings.language?'selected':''}" lang="${l.id}" aria-pressed="${l.id===settings.language}">${l.name}</button>`).join('')}</div><div class="welcome-art">${icon('MessagesSquare')}<span>${t('welcomeLead')}</span></div><p class="intro">${t('welcomeSteps')}</p><div class="note">${t('welcomePrivacy')}</div><div class="dialog-actions welcome-actions"><button id="welcome-hand" class="primary-button">${icon('Hand')} ${t('welcomeHand')}</button><button id="welcome-touch" class="secondary-button">${t('welcomeTouch')}</button><button id="welcome-setup" class="secondary-button">${t('welcomeSetup')} ${icon('ArrowRight')}</button></div>`;
    body.querySelectorAll('[data-welcome-lang]').forEach(b=>b.onclick=()=>{navigationRelease.block(b.getBoundingClientRect());if(!savePreference('language',b.dataset.welcomeLang))return;voiceStatus='';render();openDialog('welcome');});
    $('#welcome-hand').onclick=()=>openHandSetup();
    $('#welcome-touch').onclick=()=>{if(settings.mode!=='touch'&&!savePreference('mode','touch'))return;closeDialog();};$('#welcome-setup').onclick=()=>openDialog('setup-guide');
  }
  if(type==='settings'){
    $('#dialog-title').textContent=t('customize');
    body.innerHTML=`<p class="intro">Set this up for yourself or alongside a communication partner. Everything stays on this device.</p>
      <div class="setting-grid"><label>Board language<select id="setting-language">${languages.map(l=>`<option value="${l.id}">${l.name} · ${l.label}</option>`).join('')}</select></label><label>Layout<select id="setting-layout"><option value="full">Adaptive · more tiles on larger screens</option><option value="simple">Larger tiles · up to 4 per page</option></select></label><label>${t('step2')}<select id="setting-vocabulary">${Object.keys(presets).map(id=>`<option value="${id}">${t(id)}</option>`).join('')}</select></label></div>
      <label class="toggle-row"><span><strong>Speak selected messages</strong><small>Uses an installed voice for the selected language.</small></span><input type="checkbox" id="setting-voice"></label><div id="voice-detail" class="note"></div>
      <label class="toggle-row"><span><strong>Higher contrast</strong><small>Stronger borders and darker text.</small></span><input type="checkbox" id="setting-contrast"></label>
      <button id="open-input" class="setting-link">${icon('Hand')}<span><strong>Input & movement</strong><small>${modeLabels[settings.mode]} · change timing and camera settings</small></span>${icon('ChevronRight')}</button>
      <button id="open-phrases" class="setting-link">${icon('Bookmark')}<span><strong>Personal phrases</strong><small>Add names, requests, and anything you want to say.</small></span>${icon('ChevronRight')}</button>
      <div class="backup-row"><button id="export" class="secondary-button">${icon('Download')} Export setup</button><label class="secondary-button import-label">${icon('Upload')} Import setup<input type="file" id="import" accept="application/json,.json"></label><button id="print" class="secondary-button">${icon('Printer')} Print board</button></div>
      <p class="fine-print">Export includes only settings, personal phrases and the handover card for the current person. Other profiles, unsaved message drafts and audio recordings are excluded. Download recordings separately. Keep them somewhere private. Reach signals help on this device only; it does not contact a caregiver or emergency service.</p>
      <div class="dialog-actions"><button id="settings-done" class="primary-button">Done ${icon('Check')}</button></div>`;
    $('#setting-language').value=settings.language;$('#setting-layout').value=settings.simple?'simple':'full';$('#setting-voice').checked=settings.voice;$('#setting-contrast').checked=settings.contrast;
    $('#setting-vocabulary').value=settings.profile;$('#setting-vocabulary').onchange=e=>{if(savePreference('profile',e.target.value))render();e.target.value=settings.profile;};
    const voice=window.speechSynthesis?.getVoices().find(v=>v.lang.startsWith(settings.speechLanguage&&settings.speechLanguage!=='auto'?settings.speechLanguage:settings.language)&&v.localService);
    $('#voice-detail').textContent=voice?`Offline voice available: ${voice.name}. Use a tile to test the sound.`:'No matching offline voice detected. You can still show messages. Install a voice for your chosen spoken language in your device’s speech/language settings, then reopen Reach.';
    $('#setting-language').onchange=e=>{if(!savePreference('language',e.target.value)){e.target.value=settings.language;return;}voiceStatus='';render();openDialog('settings');};
    $('#setting-layout').onchange=e=>{if(savePreference('simple',e.target.value==='simple'))render();e.target.value=settings.simple?'simple':'full';};
    $('#setting-voice').onchange=e=>{if(savePreference('voice',e.target.checked)){if(!settings.voice)stopOutput();updateSpeechStatus();}e.target.checked=settings.voice;};
    $('#setting-contrast').onchange=e=>{if(savePreference('contrast',e.target.checked))render();e.target.checked=settings.contrast;};
    mountPreferenceControls(body,{language:settings.language,onSelect:b=>navigationRelease.block(b.getBoundingClientRect())});
    $('#settings-done').textContent=t('done');
    $('#open-input').onclick=()=>openDialog('input');$('#open-phrases').onclick=()=>openDialog('phrases');$('#settings-done').onclick=closeDialog;
    $('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({app:'Reach',version:1,settings},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='reach-setup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
    let setupImportRequest=0;
    $('#import').onchange=async e=>{
      const request=++setupImportRequest,input=e.currentTarget,person=profileStore?.active.id,file=input.files[0];input.value='';
      try{
        if(!file)return;if(file.size>8000000)throw Error('Setup file is too large.');const data=JSON.parse(await file.text());
        if(request!==setupImportRequest||!input.isConnected||activeDialog!=='settings'||profileStore?.active.id!==person)return;
        if(data.app!=='Reach'||data.version!==1)throw Error('Choose an exported Reach setup file.');
        const updated=validateSettings(data.settings),previous=settings;settings=updated;
        if(!save()){settings=previous;return;}
        stopOutput();stopInputs();scanning=false;render();openDialog('settings');toast('Setup imported. Start camera or scanning when ready.');
      }catch(error){if(request===setupImportRequest&&input.isConnected&&activeDialog==='settings'&&profileStore?.active.id===person)toast(error.message||'Could not read this setup file.');}
    };
    $('#print').onclick=()=>{closeDialog();window.print();};
  }
  if(type==='phrases'){
    body.innerHTML=`<p class="intro">Add a person’s name, a daily routine, or a complete message. Up to 200 personal phrases.</p><form id="phrase-form"><div class="setting-grid"><label>English text<input id="phrase-en" maxlength="500" required placeholder="I would like to listen to music"></label><label>Thai text (optional)<input id="phrase-th" maxlength="500" placeholder="อยากฟังเพลง" lang="th"></label></div><button class="primary-button" type="submit">${icon('Plus')} Add phrase</button></form><div class="phrase-list">${settings.phrases.map((p,i)=>`<div><span><strong>${escape(p.en)}</strong><small>${escape(p.th)}</small></span><button class="round-button delete-phrase" data-index="${i}" aria-label="Delete ${escape(p.en)}">${icon('Trash2')}</button></div>`).join('')||'<p class="fine-print">Your personal phrases will appear here and on the My phrases board.</p>'}</div><div class="dialog-actions"><button id="phrases-done" class="primary-button">Done</button></div>`;
    const fields=document.createElement('div');fields.className='setting-grid';fields.innerHTML=languages.filter(l=>!['en','th'].includes(l.id)).map(l=>`<label>${l.name}<input id="phrase-${l.id}" lang="${l.id}" dir="auto" maxlength="500"></label>`).join('');$('#phrase-form button').before(fields);
    const create=document.createElement('button');create.id='create-personal-phrase';create.className='primary-button';create.dataset.access='';create.textContent=phraseEditText('create',settings.language);create.onclick=()=>openDialog('phrase-new');body.prepend(create);
    $('#phrase-form').onsubmit=e=>{e.preventDefault();const en=$('#phrase-en').value.trim(),th=$('#phrase-th').value.trim();if(!en)return;if(settings.phrases.length>=200){toast('You have 200 phrases. Export a backup before removing any.');return;}const phrase={id:`custom-${Date.now()}`,en,th,translations:Object.fromEntries(['zh','hi','es','ar'].map(l=>[l,$('#phrase-'+l).value.trim()])),icon:'MessageCircle',tone:'neutral'};if(!savePreference('phrases',[...settings.phrases,phrase]))return;render();openDialog('phrases');$('#phrase-en').focus();};
    document.querySelectorAll('.delete-phrase').forEach(b=>{const phrase=settings.phrases[Number(b.dataset.index)],edit=document.createElement('button');edit.className='secondary-button edit-personal-phrase';edit.dataset.access='';edit.dataset.phraseId=phrase.id;edit.textContent=phraseEditText('title',settings.language);edit.setAttribute('aria-label',`${phraseEditText('title',settings.language)}: ${primary(phrase)}`);edit.onclick=()=>{navigationRelease.block(edit.getBoundingClientRect());editedPhraseId=phrase.id;openDialog('phrase-edit');};b.before(edit);b.onclick=()=>{navigationRelease.block(b.getBoundingClientRect());editedPhraseId=phrase.id;openDialog('phrase-remove');};});$('#phrases-done').onclick=closeDialog;
  }
  if(type==='input')renderInput(body);
  if(!$('#modal').open)$('#modal').showModal();
  showDock();
  $('#modal .eyebrow').textContent=t('setup');
  updateSpeechStatus();
  refreshIcons();
}
function savePreference(key,value){const previous=settings[key];settings[key]=value;if(save())return true;settings[key]=previous;return false;}
function renderInput(body){
  $('#dialog-title').textContent=t('input');
  body.innerHTML=`<p class="intro">${t('inputIntro')}</p><div class="input-options">${[
    ['hand','Hand','Hand pointer · experimental','Move a finger to steer a pointer. Rest over an item to select.'],
    ['touch','MousePointer2','Touch or click','For a touchscreen, mouse, trackpad, or an existing pointer device.'],
    ['dwell','Timer','Dwell to select','Rest a pointer on an item. No click or held key needed.'],
    ['switch','CircleDot','One switch','Items highlight in turn. Press Space / Enter, or use a keyboard switch.'],
    ['motion','Camera','Camera movement switch · experimental','A small movement inside a camera region selects the highlighted item.'],
    ['eye','Focus','Eye control · experimental','Look at large tiles to select. Browser camera only — no extension or app installation.']
  ].map(([value,ic,title,desc])=>`<label class="input-option" data-access><input type="radio" name="mode" value="${value}" ${settings.mode===value?'checked':''}>${icon(ic)}<span><strong>${t(value)}</strong><small>${t(value+'Desc')}</small></span></label>`).join('')}</div>
  <div class="setting-grid"><label>Time to select with dwell <output id="dwell-value">${(settings.dwell/1000).toFixed(1)}s</output><input id="dwell-time" type="range" min="600" max="4000" step="100" value="${settings.dwell}"></label><label>Time on each scanned item <output id="scan-value">${(settings.scan/1000).toFixed(1)}s</output><input id="scan-time" type="range" min="1000" max="8000" step="200" value="${settings.scan}"></label></div>
  <section id="camera-setup" ${['motion','hand'].includes(settings.mode)?'':'hidden'}><div class="camera-panel"><div id="camera-preview"><span id="finger-marker" hidden aria-hidden="true"></span><div class="camera-placeholder">${icon('Camera')} ${t('cameraOff')}</div><div class="roi" ${settings.mode==='motion'?'':'hidden'}><span>${t('cameraMovementArea')}</span></div></div><div class="camera-instructions"><strong>${t(settings.mode==='hand'?'cameraHandStep':'cameraMotionStep')}</strong><p>${t(settings.mode==='hand'?'cameraHandPosition':'cameraMotionPosition')}</p><strong>${t('cameraPracticeStep')}</strong><p>${t(settings.mode==='hand'?'cameraHandPractice':'cameraMotionPractice')}</p></div></div>
  <p id="camera-status" role="status">${t('cameraPrivate')}</p><div class="backup-row"><button id="camera-start" class="secondary-button">${icon('Camera')} ${t('cameraStart')}</button><button id="calibrate" class="secondary-button" disabled>${icon('Focus')} ${t(settings.mode==='hand'?'cameraRest':'cameraStill')}</button><button id="camera-stop" class="secondary-button">${t('cameraStop')}</button></div>
  ${settings.mode==='hand'?`<div class="setting-grid"><label>Finger to track<select id="finger"><option value="8">Index finger</option><option value="4">Thumb</option><option value="12">Middle finger</option><option value="16">Ring finger</option><option value="20">Little finger</option></select></label><label>Movement gain <output id="gain-value">${settings.gain}×</output><input id="gain" type="range" min="1" max="8" step="0.5" value="${settings.gain}"></label></div>`:`<label>Movement threshold (lower is more sensitive)<input id="threshold" type="range" min="1" max="40" step="0.5" value="${settings.threshold}"></label><meter id="motion-meter" aria-label="${t('motionLevel')}" aria-valuetext="${movementReading(0,settings.threshold)}" min="0" max="40" value="0"></meter><div class="meter-labels"><span id="motion-threshold">${movementReading(0,settings.threshold)}</span><strong id="practice-count">0 movements detected</strong></div>`}
  <div class="note">${t('cameraPracticeNote')}</div></section>
  <div class="dialog-actions"><button id="input-done" class="primary-button">${t('done')} ${icon('ArrowRight')}</button></div>`;
  const saveInput=(key,value)=>{const previous=settings[key];settings[key]=value;if(save())return true;settings[key]=previous;return false;};
  body.querySelectorAll('[name="mode"]').forEach(r=>r.onchange=()=>{if(!saveInput('mode',r.value)){body.querySelectorAll('[name="mode"]').forEach(option=>option.checked=option.value===settings.mode);return;}stopInputs();scanning=false;render();openDialog('input');});
  $('#dwell-time').oninput=e=>{saveInput('dwell',+e.target.value);e.target.value=settings.dwell;$('#dwell-value').textContent=(settings.dwell/1000).toFixed(1)+'s';};
  $('#scan-time').oninput=e=>{saveInput('scan',+e.target.value);e.target.value=settings.scan;$('#scan-value').textContent=(settings.scan/1000).toFixed(1)+'s';};
  const audioOption=document.createElement('button');audioOption.id='scan-audio-toggle';audioOption.type='button';audioOption.className='secondary-button';audioOption.dataset.access='';audioOption.textContent=scanAudioText('title',settings.language);audioOption.setAttribute('aria-pressed',String(!!settings.scanAudio));
  audioOption.onclick=()=>{if(saveInput('scanAudio',!settings.scanAudio))scanAudio.stop();audioOption.setAttribute('aria-pressed',String(settings.scanAudio));};
  const audioNote=document.createElement('p');audioNote.className='note';audioNote.textContent=scanAudioText('note',settings.language);
  const audioStatus=document.createElement('p');audioStatus.id='scan-audio-status';audioStatus.setAttribute('role','status');
  const audioRate=document.createElement('label');audioRate.append(document.createTextNode('Scan preview speed '));const rateInput=document.createElement('input');rateInput.id='scan-audio-rate';rateInput.type='range';rateInput.min='.5';rateInput.max='1.5';rateInput.step='.05';rateInput.value=settings.scanAudioRate??.95;audioRate.append(rateInput);
  rateInput.oninput=()=>{const previous=settings.scanAudioRate;settings.scanAudioRate=Number(rateInput.value);if(!save()){settings.scanAudioRate=previous;rateInput.value=previous??.95;}};
  const audioTryRow=document.createElement('div');audioTryRow.className='backup-row';
  for(const [id,key] of [['scan-audio-try','tryVoice'],['scan-audio-stop','stopPreview']]){
    const button=document.createElement('button');button.id=id;button.type='button';button.className='secondary-button';button.dataset.access='';button.textContent=scanAudioText(key,settings.language);audioTryRow.append(button);
    button.onclick=()=>{if(key==='stopPreview')scanAudio.stop();else if(settings.voice){if(recordedOutput.audio)scanAudio.status='busy';else scanAudio.preview(scanAudioText('sample',settings.language),settings.language,performance.now(),settings.scanAudioRate);}updateTrackingNotice();};
  }
  $('#input-done').parentElement.before(audioOption,audioRate,audioTryRow,audioNote,audioStatus);
  if(['motion','hand'].includes(settings.mode)){
    // UI attempts outlive CameraInput's internal cleanup generation on failure.
    // Stop/new setup invalidates only the old button's pending completion.
    let startAttempt=0;
    $('#camera-start').onclick=async()=>{const b=$('#camera-start'),attempt=++startAttempt;b.disabled=true;await camera.start(settings.mode,settings);if(attempt!==startAttempt||!b.isConnected)return;b.disabled=false;if(camera.running){if(activeDialog==='input'&&$('#camera-preview')){camera.preview($('#camera-preview'));$('.camera-placeholder').hidden=true;}else camera.park();}};
    $('#calibrate').onclick=()=>{camera.calibrate();updateTrackingNotice();};
    $('#camera-stop').onclick=()=>{startAttempt++;stopInputs();$('#camera-start').disabled=false;$('#camera-status').textContent=t('cameraOff');$('.camera-placeholder').hidden=false;updateTrackingNotice();};
    if($('#gain'))$('#gain').oninput=e=>{saveInput('gain',+e.target.value);e.target.value=settings.gain;$('#gain-value').textContent=settings.gain+'×';};
    if($('#finger')){$('#finger').value=settings.finger;$('#finger').onchange=e=>{if(saveInput('finger',+e.target.value)){camera.resetHandReference();$('#camera-status').textContent=t('cameraFingerChanged');}e.target.value=settings.finger;};}
    if($('#threshold'))$('#threshold').oninput=e=>{if(!e.detail?.calibration&&saveInput('threshold',+e.target.value))camera.gate.reset();e.target.value=settings.threshold;};
    if(camera.running){camera.preview($('#camera-preview'));$('.camera-placeholder').hidden=true;$('#camera-status').textContent=t('cameraRunning');}
  }
  mountInputAdjustments(body,{language:settings.language,onSelect:b=>navigationRelease.block(b.getBoundingClientRect())});
  if(settings.mode==='motion'){
    $('#practice-count').remove();
    const actions=document.createElement('div');actions.className='backup-row';actions.innerHTML=`<button id="motion-scan" data-access class="secondary-button" disabled>${t('startScan')}</button><button id="motion-practice" data-access class="secondary-button" disabled>${practiceText('title',settings.language)}</button>`;$('#motion-meter').after(actions);
    $('#motion-scan').onclick=()=>{scanning=!scanning;resetInput();};
    $('#motion-practice').onclick=()=>openDialog('practice');
  }
  $('#input-done').onclick=()=>{const practice=guidedPracticePending;save();closeDialog();if(practice)openDialog('practice');};
  if(settings.mode==='eye'){
    const panel=document.createElement('section');panel.className='note';panel.id='eye-setup-info';
    const heading=document.createElement('strong');heading.textContent=t('eyeSetup');panel.append(heading);
    for(const key of ['eyeSetupSteps','eyeSetupPrivacy','eyeSetupAccess']){const p=document.createElement('p');p.textContent=t(key);panel.append(p);}
    const start=document.createElement('button');start.id='eye-start';start.className='primary-button';start.textContent=t('eyeSetup');panel.append(start);
    body.querySelector('.dialog-actions').before(panel);
    $('#eye-start').onclick=async()=>{const practice=guidedPracticePending;stopInputs();closeDialog();guidedEyePractice=practice;activeDialog='eye';showDock();eyePage=0;await eye.start(settings.language);};
  }
}
function closeDialog(){if(activeDialog==='setup-guide')guideDraft('clear');if(activeDialog==='welcome'){try{localStorage.setItem('reach-welcomed','1');}catch{}}importedBoardsSession?.dispose();importedBoardsSession=null;boardExportSession?.dispose();boardExportSession=null;guidedPracticePending=false;audioBackupSession?.dispose();audioBackupSession=null;recordingSession?.dispose();recordingSession=null;offlineSession?.dispose();offlineSession=null;camera.park();practiceSession=null;if(practiceScanning!==null){scanning=practiceScanning;practiceScanning=null;}if(restScanning!==null){scanning=restScanning;restScanning=null;}activeDialog=null;$('#modal').close();save();render();}
function openHandSetup(){if(settings.mode!=='hand'&&!savePreference('mode','hand'))return;stopInputs();scanning=false;if(activeDialog==='welcome')closeDialog();render();openDialog('input');$('#camera-setup').scrollIntoView({block:'start'});$('#camera-start').focus({preventScroll:true});}
function openEyeSetup(){if(settings.mode!=='eye'&&!savePreference('mode','eye'))return;stopInputs();eyePage=0;render();openDialog('input');$('#eye-start').scrollIntoView({block:'center'});$('#eye-start').focus({preventScroll:true});}
$('#modal').addEventListener('cancel',e=>{e.preventDefault();closeDialog();});

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install').hidden=false;});
$('#install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('#install').hidden=true;}};
async function updateOffline(){
  offlineReady=false;
  try{if(navigator.serviceWorker?.controller){const response=await caches.match('/offline-manifest.json');if(response){const manifest=await response.json(),cache=await caches.open(manifest.boardCache);offlineReady=(await inspectAssets(cache,manifest.board)).missing.length===0;}}}catch{}
  $('#offline-status').textContent=offlineReady?(navigator.onLine?t('saved'):t('offline')):(navigator.onLine?'Preparing offline access':'Offline · some features may be unavailable');
}
if('serviceWorker' in navigator){window.addEventListener('load',async()=>{try{const registration=await navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'});registration.update().catch(()=>{});await navigator.serviceWorker.ready;await updateOffline();}catch{$('#offline-status').textContent='Offline installation unavailable';}});navigator.serviceWorker.addEventListener('message',updateOffline);}
window.addEventListener('online',updateOffline);window.addEventListener('offline',updateOffline);
if('serviceWorker' in navigator){
  const alreadyControlled=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(!alreadyControlled||$('#app-update'))return;
    const banner=document.createElement('div');banner.id='app-update';banner.setAttribute('role','status');
    banner.innerHTML='A Reach update is ready. <button class="primary-button">Reload app</button>';
    banner.querySelector('button').onclick=()=>location.reload();document.body.append(banner);
  });
}
render();requestAnimationFrame(frame);
try{if(!localStorage.getItem('reach-welcomed')&&!settings.setupGuide)openDialog('welcome');}catch{toast('Private session: export your setup to keep it.');}
if(new URLSearchParams(location.search).get('input')==='eye')openEyeSetup();
else if(new URLSearchParams(location.search).get('setup')==='1')openDialog('quick');








function stopOutput(){scanAudio.stop();window.speechSynthesis?.cancel();recordedOutput.stop();}
if(profileStore)recordingLibrary.load(profileStore.active.id).catch(()=>toast('Saved recordings could not be loaded.'));















