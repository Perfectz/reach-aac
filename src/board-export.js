import {languages} from './languages.js';
import {boardExportSlots,createOBF} from './obf.js';
import lucideLicense from '../public/lucide-LICENSE?raw';
async function iconImage(definition){
 if(!definition)return null;
 const make=([tag,attributes,children=[]])=>{const el=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,String(value));for(const child of children)el.append(make(child));return el;};
 const svg=make(definition);svg.setAttribute('width','160');svg.setAttribute('height','160');svg.setAttribute('stroke','#173b39');
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
 try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,160,160);ctx.drawImage(image,16,16,128,128);return {width:160,height:160,content_type:'image/png',data:canvas.toDataURL('image/png'),license:{type:'ISC',author_name:'Lucide contributors; Feather portions by Cole Bemis',copyright_notice_url:'https://github.com/lucide-icons/lucide/blob/main/LICENSE'},ext_reach_license_text:lucideLicense};}finally{URL.revokeObjectURL(url);}
}
export function mountBoardExport(root,{phrases,language,name,icons,library,onClose,onTransition}){
 let lang=language,columns=3,includeAudio=false,allowMissing=false,disposed=false,busy=false;
 const button=(id,text,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=text;b.type='button';b.dataset.access='';b.className='secondary-button obf-option';b.onclick=()=>{onTransition(b);fn();};return b;};
 function render(){
  root.replaceChildren();const intro=document.createElement('p');intro.className='intro';intro.textContent='Export this phrase pack for another AAC app. Positions and empty slots are preserved. Icons are embedded. Choose one language and the number of columns.';root.append(intro);
  const langs=document.createElement('div');langs.className='language-choices';for(const l of languages){const b=button('obf-language-'+l.id,l.name,()=>{lang=l.id;allowMissing=false;render();});b.lang=l.id;b.setAttribute('aria-pressed',String(lang===l.id));langs.append(b);}root.append(langs);
  const sizes=document.createElement('div');sizes.className='backup-row';for(const n of [2,3,4]){const b=button('obf-columns-'+n,n+' columns',()=>{columns=n;render();});b.setAttribute('aria-pressed',String(columns===n));sizes.append(b);}root.append(sizes);
  const audio=button('obf-audio',includeAudio?'Matching recordings: included':'Matching recordings: excluded',()=>{includeAudio=!includeAudio;render();});audio.setAttribute('aria-pressed',String(includeAudio));root.append(audio);
  const note=document.createElement('p');note.className='note';note.textContent='The download contains personal phrase text. Recordings are included only if chosen and their language and text match exactly. Another app may not support the recording codec. Camera settings, other profiles, drafts and the handover card are excluded. Exporting does not grant permission to republish private content.';root.append(note);
  const slots=boardExportSlots(phrases,lang),missing=slots.filter(s=>s&&!s.text).length;
  const compatibility=document.createElement('p');compatibility.className='note';compatibility.textContent='Tested with AsTeRICS AAC: the test board retained its text, positions and icons. Its OBZ re-export did not retain recordings or icon attribution. Keep the original Reach file. In AsTeRICS, choose a home grid before exporting OBZ.';root.append(compatibility);
  if(missing){const warning=document.createElement('p');warning.setAttribute('role','status');warning.textContent=`${missing} positions have no translation. Choose another language, or explicitly leave those positions empty.`;root.append(warning);const b=button('obf-allow-missing','Leave untranslated positions empty',()=>{allowMissing=!allowMissing;render();});b.setAttribute('aria-pressed',String(allowMissing));root.append(b);}
  const list=document.createElement('ol');list.id='obf-preview';for(const slot of slots){const li=document.createElement('li');li.dir='auto';li.lang=lang;li.textContent=slot?slot.text||'No translation — empty position':'Empty position';list.append(li);}root.append(list);
  const status=document.createElement('p');status.id='obf-status';status.setAttribute('role','status');root.append(status);
  const download=button('obf-download','Download .obf board',async()=>{
   if(busy)return;busy=true;root.querySelectorAll('button').forEach(b=>{if(b.id!=='obf-close')b.disabled=true;});status.textContent='Preparing board…';
   try{
    const recordings=includeAudio?await library.all():[];
    const board=await createOBF({phrases,language:lang,columns,name,allowMissing,recordings,imageFor:key=>iconImage(icons[key])});
    if(disposed)return;
    const blob=new Blob([JSON.stringify(board,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`reach-${lang}.obf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent=`Downloaded ${board.buttons.length} messages, ${board.images.length} icons and ${board.sounds.length} recordings. Import support varies by app.`;
   }catch(error){if(!disposed)status.textContent='Export failed: '+error.message;}
   finally{busy=false;if(!disposed){root.querySelectorAll('button').forEach(b=>b.disabled=false);download.disabled=!!missing&&!allowMissing;}}
  });download.disabled=!!missing&&!allowMissing;root.append(download,button('obf-close','Done',onClose));
 }
 render();return {dispose(){disposed=true;}};
}

