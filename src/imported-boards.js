import {reviewOBF} from './obf-review.js';
import {importedText,importedIssueText} from './imported-language.js';
export function mountImportedBoards(root,{library,person,interfaceLanguage='en',isCurrent,onSpeak,onStop,onHelp,onDelete,onClose,onTransition}){
 const t=(key,values)=>importedText(key,interfaceLanguage,values);
 let disposed=false,generation=0,urls=[];
 const clean=()=>{urls.forEach(URL.revokeObjectURL);urls=[];};
 const active=token=>!disposed&&isCurrent()&&token===generation;
 const button=(id,text,fn)=>{const b=document.createElement('button');b.type='button';b.id=id;b.textContent=text;b.className='secondary-button';b.dataset.access='';b.onclick=()=>{onTransition(b);fn();};return b;};
 const text=(value,cls='intro')=>{const p=document.createElement('p');p.className=cls;p.textContent=value;return p;};
 const clear=()=>{clean();root.replaceChildren();};
 const failure=(status,error,key='storageFailure')=>{
  status.textContent=t(key);root.querySelector('#import-failure-details')?.remove();
  const section=document.createElement('div');section.id='import-failure-details';
  const detail=text(error?.message||String(error));detail.id='import-failure-message';detail.lang='en';detail.dir='ltr';detail.hidden=true;
  const toggle=button('import-failure-toggle',t('technical'),()=>{detail.hidden=!detail.hidden;toggle.setAttribute('aria-expanded',String(!detail.hidden));});toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',detail.id);section.append(toggle,detail);status.after(section);
 };
 const download=source=>{const url=URL.createObjectURL(source),a=document.createElement('a');a.href=url;a.download='reach-imported-board.obf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 async function home(){
  const token=++generation;clear();root.append(text(t('libraryIntro')));
  const label=document.createElement('label');label.textContent=t('chooseFile');const input=document.createElement('input');input.id='board-import-file';input.type='file';input.accept='.obf,application/json';label.append(input);root.append(label);
  const status=text(t('loading'));status.id='imported-status';status.setAttribute('role','status');root.append(status);const list=document.createElement('div');list.className='imported-list';root.append(list);
  input.onchange=()=>{const file=input.files[0];if(file)review(file);};root.append(button('imported-close',t('done'),onClose));
  try{const entries=await library.list(person);if(!active(token))return;status.textContent=entries.length?t('saved',{count:entries.length}):t('none');
   for(const entry of entries){const row=document.createElement('div');row.className='imported-row';row.append(button('open-board-'+entry.id,entry.name,()=>open(entry.id)),button('download-board-'+entry.id,t('download'),async()=>{try{const saved=await library.get(person,entry.id);if(active(token))download(saved.source);}catch(e){if(active(token))failure(status,e);}}),button('delete-board-'+entry.id,t('remove'),()=>{
    const name=text(entry.name);name.dir='auto';name.lang=entry.locale;row.replaceChildren(name,text(t('removePrompt')),button('confirm-board-remove',t('confirmRemove'),async()=>{try{await library.remove(person,entry.id);if(active(token)){onDelete(entry.id);home();}}catch(e){if(active(token))failure(status,e);}}),button('cancel-board-remove',t('keep'),home));
   }));list.append(row);}
  }catch(e){if(active(token)){failure(status,e);root.append(button('import-library-retry',t('retry'),home));}}
 }
 async function review(file){
  const token=++generation;clear();const status=text(t('checking'));status.id='imported-status';status.setAttribute('role','status');root.append(status,button('import-review-cancel',t('cancel'),home));
  try{const result=await reviewOBF(file);if(!active(token))return;status.textContent=t('details',{rows:result.rows,columns:result.columns,count:result.resources.length});const name=text(result.name);name.dir='auto';name.lang=result.locale;root.append(name);
   root.append(text(t('reviewIntro'),'note'));
   const issues=document.createElement('ul');issues.id='import-review-issues';result.issues.forEach((item,index)=>{
    const li=document.createElement('li');li.append(text(importedIssueText(item.code,interfaceLanguage)));
    const detail=text(item.message);detail.id='import-issue-detail-'+index;detail.lang='en';detail.dir='ltr';detail.hidden=true;
    const toggle=button('import-issue-toggle-'+index,t('technical'),()=>{detail.hidden=!detail.hidden;toggle.setAttribute('aria-expanded',String(!detail.hidden));});toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',detail.id);li.append(toggle,detail);issues.append(li);
   });root.append(issues);
   if(result.unplacedButtons.length)root.append(text(t('unplaced',{count:result.unplacedButtons.length}),'note'));
   const preview=document.createElement('ol');preview.id='import-review-slots';for(const slot of result.slots){const li=document.createElement('li');li.dir='auto';li.lang=slot?result.locale:interfaceLanguage;li.textContent=slot?slot.label+(slot.speech!==slot.label?` → ${slot.speech}`:''):t('empty');preview.append(li);}root.append(preview);
   const save=button('import-board-save',t('save'),async()=>{
    save.disabled=true;try{await library.save(person,file,{isCurrent:()=>active(token)});if(active(token))home();}catch(e){if(active(token)){failure(status,e,'saveFailure');save.disabled=!result.ready;}}
   });save.disabled=!result.ready;root.append(save);
  }catch(e){if(active(token))failure(status,e,'fileFailure');}
 }
 async function open(id){
  const token=++generation;clear();const status=text(t('opening'));status.id='imported-status';root.append(status,button('imported-back',t('back'),home));
  try{const {entry,review}=await library.open(person,id);if(!active(token))return;if(!review.ready){status.textContent=t('needsReview');return;}
   let page=0,chosen=null;const capacity=innerHeight<720?2:4,language=review.locale.split('-')[0].toLowerCase();
   function show(){
    clear();const name=text(entry.name);name.lang=review.locale;name.dir='auto';root.append(name,text(t('instructions'),'note'));
    const board=document.createElement('div');board.className='imported-grid';board.id='imported-grid';board.dir=language==='ar'?'rtl':'ltr';root.append(board);
    review.slots.slice(page*capacity,(page+1)*capacity).forEach((slot,index)=>{
     const position=page*capacity+index+1;if(!slot){const empty=document.createElement('div');empty.className='empty-position';empty.textContent=`${position} · ${t('empty')}`;board.append(empty);return;}
     const b=button('imported-slot-'+position,'',()=>{
      chosen=slot;
      board.querySelectorAll('button').forEach(target=>target.setAttribute('aria-pressed',String(target===b)));
      message.textContent=slot.speech;message.lang=review.locale;speech.disabled=!slot.speech.trim();
     });b.className+=' imported-tile';b.setAttribute('aria-pressed',String(chosen===slot));
     const label=document.createElement('span');label.dir='auto';label.lang=review.locale;label.textContent=`${position} · ${slot.label}`;
     if(slot.image){const image=document.createElement('img');const url=URL.createObjectURL(slot.image.blob);urls.push(url);image.src=url;image.alt='';image.onerror=()=>{if(!active(token)||!image.isConnected)return;const notice=document.createElement('span');notice.className='imported-media-error';notice.textContent=t('imageError');image.replaceWith(notice);};b.append(image);}b.append(label);board.append(b);
    });
    const pages=Math.ceil(review.slots.length/capacity),navigation=document.createElement('div');navigation.className='backup-row';const previous=button('imported-prev',t('previous'),()=>{page--;chosen=null;show();}),next=button('imported-next',t('next'),()=>{page++;chosen=null;show();});previous.disabled=page===0;next.disabled=page>=pages-1;const count=text(`${page+1} / ${pages}`);count.dir='ltr';count.id='imported-page-count';navigation.append(previous,count,next);root.append(navigation);
    const message=text(chosen?.speech||t('select'));message.id='imported-message';message.dir='auto';root.append(message);
    const speech=button('imported-speak',t('speak'),()=>{
     if(!chosen)return;const p={id:`imported:${id}:${chosen.id}`,en:chosen.speech,sourceLanguage:language,translations:{[language]:chosen.speech},icon:'MessageCircle',tone:'neutral'};
     if(chosen.sound)p.embeddedAudio={blob:chosen.sound.blob,language,text:chosen.speech};onSpeak(p);
    });speech.disabled=!chosen?.speech.trim();const actions=document.createElement('div');actions.className='imported-actions';actions.append(speech,button('imported-stop',t('stop'),onStop),button('imported-help',t('help'),onHelp));root.append(actions);
    const voice=text('');voice.id='imported-voice-status';voice.setAttribute('role','status');root.append(voice,button('imported-back',t('back'),()=>{onStop();home();}));
   }show();
  }catch(e){if(active(token))failure(status,e);}
 }
 home();return {dispose(){disposed=true;generation++;clean();}};
}



