import {phraseText,languages,spokenLanguage} from './languages.js';
export const composerPhraseAvailable=(phrase,language)=>spokenLanguage(phrase,language)===language;
export const MESSAGE_LIMIT=500;
const codes=['en','zh','hi','es','ar','th'];
export class MessageDraft{
 constructor(language='en'){this.language=language;this.text='';this.history=[];}
 set(text){const next=Array.from(text).slice(0,MESSAGE_LIMIT).join('');if(next!==this.text){this.history.push(this.text);this.history=this.history.slice(-40);this.text=next;}}
 append(text,separator=''){this.set(this.text+(this.text?separator:'')+text);}
 backspace(){const parts=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(this.language,{granularity:'grapheme'}).segment(this.text)].map(s=>s.segment):Array.from(this.text);parts.pop();this.set(parts.join(''));}
 undo(){if(this.history.length)this.text=this.history.pop();}
 phrase(){return {id:'composed-message',en:this.text,th:this.language==='th'?this.text:'',sourceLanguage:this.language,translations:{[this.language]:this.text},icon:'MessageCircle',tone:'neutral'};}
}
const labels={
 missingTranslation:['Some phrases have no translation in this draft’s language and cannot be inserted here. Add a translation, or speak the original phrase from its board.','部分短语没有此草稿语言的翻译，无法在此插入。请添加翻译，或从沟通板朗读原始短语。','कुछ वाक्यों का इस मसौदे की भाषा में अनुवाद नहीं है, इसलिए यहाँ नहीं जोड़ा जा सकता। अनुवाद जोड़ें या बोर्ड से मूल वाक्य बोलें।','Algunas frases no tienen traducción al idioma del borrador y no se pueden insertar aquí. Añade una traducción o habla la frase original desde su tablero.','بعض العبارات غير مترجمة إلى لغة هذه المسودة ولا يمكن إدراجها هنا. أضف ترجمة أو انطق العبارة الأصلية من لوحتها.','บางข้อความไม่มีคำแปลในภาษาของร่างนี้ จึงแทรกที่นี่ไม่ได้ เพิ่มคำแปลหรือพูดข้อความต้นฉบับจากกระดาน'],
 editIntro:['Edit this text using large buttons or your keyboard. Changes are only used when you choose Use this text.','使用大按钮或键盘编辑。选择使用此文本后才会应用更改。','बड़े बटनों या कीबोर्ड से पाठ बदलें। यह पाठ इस्तेमाल करें चुनने पर ही बदलाव लागू होंगे।','Edita con botones grandes o el teclado. Los cambios solo se aplican al elegir Usar este texto.','عدّل النص بالأزرار الكبيرة أو لوحة المفاتيح. لا تُطبّق التغييرات حتى تختار استخدام هذا النص.','แก้ข้อความด้วยปุ่มใหญ่หรือแป้นพิมพ์ จะใช้การเปลี่ยนแปลงเมื่อเลือกใช้ข้อความนี้'],
 applyText:['Use this text','使用此文本','यह पाठ इस्तेमाल करें','Usar este texto','استخدام هذا النص','ใช้ข้อความนี้'],
 discardText:['Discard text edits','放弃文本修改','पाठ के बदलाव छोड़ें','Descartar cambios de texto','تجاهل تعديلات النص','ยกเลิกการแก้ข้อความ'],
 stop:['Stop speaking','停止朗读','बोलना बंद करें','Dejar de hablar','إيقاف الكلام','หยุดพูด'],
 title:['Write a message','编写消息','संदेश लिखें','Escribir un mensaje','كتابة رسالة','เขียนข้อความ'],
 intro:['Combine phrases or use letters. Choose Speak now to say your message. Check the draft status below before closing or reloading this page.','组合短语或使用字母。选择立即朗读来表达消息。关闭或重新加载此页面前，请检查下方的草稿状态。','वाक्य जोड़ें या अक्षर चुनें। संदेश बोलने के लिए अभी बोलें चुनें। पेज बंद या दोबारा लोड करने से पहले नीचे मसौदे की स्थिति देखें।','Combina frases o usa letras. Elige Hablar ahora para decir tu mensaje. Comprueba el estado del borrador antes de cerrar o recargar la página.','اجمع العبارات أو استخدم الحروف. اختر تكلّم الآن لنطق رسالتك. تحقّق من حالة المسودة أدناه قبل إغلاق الصفحة أو إعادة تحميلها.','รวมข้อความหรือเลือกตัวอักษร เลือกพูดตอนนี้เพื่อพูดข้อความ ตรวจสอบสถานะร่างด้านล่างก่อนปิดหรือโหลดหน้านี้ใหม่'],
 text:['Your message','你的消息','आपका संदेश','Tu mensaje','رسالتك','ข้อความของคุณ'],
 phrases:['Phrase library','短语库','वाक्य संग्रह','Biblioteca de frases','مكتبة العبارات','คลังข้อความ'],
 letters:['Letters','字母','अक्षर','Letras','الحروف','ตัวอักษร'],
 space:['Space','空格','स्पेस','Espacio','مسافة','เว้นวรรค'],
 delete:['Delete last character','删除最后一个字符','अंतिम अक्षर हटाएँ','Borrar último carácter','حذف آخر حرف','ลบตัวอักษรสุดท้าย'],
 undo:['Undo edit','撤销编辑','बदलाव वापस लें','Deshacer edición','تراجع عن التعديل','ย้อนการแก้ไข'],
 clear:['Clear draft','清除草稿','मसौदा साफ़ करें','Borrar borrador','مسح المسودة','ล้างร่าง'],
 speak:['Speak now','立即朗读','अभी बोलें','Hablar ahora','تكلّم الآن','พูดตอนนี้'],
 save:['Save to My phrases','保存到我的短语','मेरे वाक्यों में सहेजें','Guardar en Mis frases','حفظ في عباراتي','บันทึกในข้อความของฉัน'],
 draftSaved:['Draft saved on this device','草稿已保存在此设备','मसौदा इस डिवाइस पर सहेजा गया','Borrador guardado en este dispositivo','تم حفظ المسودة على هذا الجهاز','บันทึกร่างในอุปกรณ์นี้แล้ว'],
 draftFailed:['Draft not saved. Keep this page open to keep your message, and retry saving.','草稿未保存。请保持此页面打开以保留消息，然后重试保存。','मसौदा नहीं सहेजा गया। संदेश रखने के लिए यह पेज खुला रखें और फिर सहेजें।','Borrador sin guardar. Mantén esta página abierta para conservar el mensaje e intenta guardarlo de nuevo.','لم تُحفظ المسودة. أبقِ هذه الصفحة مفتوحة للاحتفاظ برسالتك وحاول الحفظ مجدداً.','ยังไม่ได้บันทึกร่าง เปิดหน้านี้ไว้เพื่อเก็บข้อความแล้วลองบันทึกอีกครั้ง'],
 retryDraft:['Retry saving draft','重试保存草稿','मसौदा फिर सहेजें','Reintentar guardar borrador','إعادة محاولة حفظ المسودة','ลองบันทึกร่างอีกครั้ง'],
 download:['Download message','下载消息','संदेश डाउनलोड करें','Descargar mensaje','تنزيل الرسالة','ดาวน์โหลดข้อความ'],
 downloadNote:['Downloads only this message as a text file. It does not send it to anyone.','仅将此消息下载为文本文件，不会发送给任何人。','केवल यह संदेश टेक्स्ट फ़ाइल में डाउनलोड होता है। यह किसी को भेजा नहीं जाता।','Descarga solo este mensaje como archivo de texto. No se envía a nadie.','يُنزّل هذه الرسالة فقط كملف نصي ولا يرسلها إلى أي شخص.','ดาวน์โหลดเฉพาะข้อความนี้เป็นไฟล์ข้อความ ไม่ได้ส่งให้ใคร'],
 downloadFailed:['Could not start the download. Your message is still here.','无法开始下载。消息仍在此处。','डाउनलोड शुरू नहीं हुआ। संदेश यहीं है।','No se pudo iniciar la descarga. Tu mensaje sigue aquí.','تعذّر بدء التنزيل. رسالتك ما زالت هنا.','เริ่มดาวน์โหลดไม่ได้ ข้อความยังอยู่ที่นี่'],
 saved:['Saved to My phrases','已保存到我的短语','मेरे वाक्यों में सहेजा गया','Guardado en Mis frases','تم الحفظ في عباراتي','บันทึกในข้อความของฉันแล้ว'],
 saveFailed:['Could not save to My phrases. Your message is still here; you can speak it or try saving again.','无法保存到我的短语。消息仍在此处；您可以朗读或重试保存。','मेरे वाक्यों में सहेजा नहीं जा सका। संदेश यहीं है; आप इसे बोल सकते हैं या फिर सहेजने की कोशिश कर सकते हैं।','No se pudo guardar en Mis frases. Tu mensaje sigue aquí; puedes decirlo o intentar guardarlo de nuevo.','تعذّر الحفظ في عباراتي. رسالتك ما زالت هنا؛ يمكنك نطقها أو محاولة حفظها مجدداً.','บันทึกในข้อความของฉันไม่ได้ ข้อความยังอยู่ที่นี่ คุณพูดข้อความหรือลองบันทึกอีกครั้งได้'],
 full:['Personal library is full. Export a backup before removing phrases.','个人短语库已满。删除短语前请导出备份。','निजी संग्रह भर गया है। वाक्य हटाने से पहले बैकअप लें।','La biblioteca está llena. Exporta una copia antes de eliminar frases.','المكتبة ممتلئة. صدّر نسخة احتياطية قبل حذف عبارات.','คลังข้อความเต็ม ส่งออกข้อมูลสำรองก่อนลบข้อความ'],
 back:['Back','返回','वापस','Volver','رجوع','กลับ'],
 next:['Next','下一页','अगला','Siguiente','التالي','ถัดไป'],
 previous:['Previous','上一页','पिछला','Anterior','السابق','ก่อนหน้า'],
 close:['Back to communication','返回沟通','बातचीत पर वापस जाएँ','Volver a comunicar','العودة إلى التواصل','กลับไปสื่อสาร'],
 chinese:['For new Chinese words, use your device’s Chinese keyboard in the text box. Phrase selection works with every input method. The letter board below uses Latin characters.','如需输入新的中文词语，请在文本框使用设备的中文键盘。所有输入方式都可选择短语。下方字母板使用拉丁字母。','नए चीनी शब्दों के लिए टेक्स्ट बॉक्स में डिवाइस का चीनी कीबोर्ड उपयोग करें। नीचे लैटिन अक्षर हैं।','Para palabras chinas nuevas, usa el teclado chino del dispositivo. El tablero de letras usa caracteres latinos.','للكلمات الصينية الجديدة استخدم لوحة مفاتيح الجهاز الصينية في مربع النص. لوحة الحروف أدناه لاتينية.','ใช้แป้นพิมพ์ภาษาจีนของอุปกรณ์ในช่องข้อความเพื่อเขียนคำจีนใหม่ กระดานด้านล่างเป็นอักษรละติน'],
};
export const composerText=(key,lang)=>labels[key]?.[codes.indexOf(lang)]||labels[key]?.[0]||key;
const alphabets={en:'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?\'"-:/()',es:'abcdefghijklmnñopqrstuvwxyzáéíóúüABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑ0123456789.,¿?¡!-',ar:'ابتثجحخدذرزسشصضطظعغفقكلمنهويءآأإؤئىةًٌٍَُِّْ0123456789٠١٢٣٤٥٦٧٨٩،.؟!',th:'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทฑธนบปผฝพฟภมยรลวศษสหฬอฮะาำิีึืุูเแโใไ็่้๊๋์ๆฯ0123456789.!?',hi:'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहािीुूृेैोौ्‌ंःँ़०१२३४५६७८९0123456789।,.!?'};
export function keyboardGroups(language){const chars=[...new Set(Array.from((alphabets[language]||alphabets.en)+(language==='th'?'ฤฦๅํ๎๐๑๒๓๔๕๖๗๘๙':'')))].filter(c=>c!=='\u200c');return Array.from({length:Math.ceil(chars.length/4)},(_,i)=>chars.slice(i*4,i*4+4));}
export function mountComposer(root,{draft,phrases,onSpeak,onSave,onClose,onTransition,onStop,onDraftChange=()=>{},onApply=null,uiLanguage=draft.language}){
 const editing=typeof onApply==='function',t=k=>composerText(k,uiLanguage);let mode=editing?'letters':'phrases',page=0,group=null,savedText=null,failedText=null;
 const button=(id,label,action)=>{const b=document.createElement('button');b.id=id;b.textContent=label;b.className='secondary-button';b.dataset.access='';b.onclick=e=>action(e);return b;};
 const move=b=>onTransition(b);
 function render(){
  root.replaceChildren();const intro=document.createElement('p');intro.className='intro';intro.textContent=t(editing?'editIntro':'intro');root.append(intro);
  const label=document.createElement('label');label.textContent=t('text')+(editing?` · ${languages.find(l=>l.id===draft.language)?.name||draft.language}`:'');label.htmlFor='compose-text';root.append(label);
  const field=document.createElement('textarea');field.id='compose-text';field.value=draft.text;field.lang=draft.language;field.dir='auto';field.rows=3;field.maxLength=MESSAGE_LIMIT;field.oninput=()=>{draft.set(field.value);update();};root.append(field);
  const count=document.createElement('p');count.id='compose-count';root.append(count);
  const voice=document.createElement('p');voice.id='composer-voice';voice.className='note';voice.hidden=editing;voice.setAttribute('role','status');root.append(voice);
  const actions=document.createElement('div');actions.className='compose-actions';root.append(actions);
  if(!editing)actions.append(button('compose-speak',t('speak'),()=>onSpeak(draft.phrase())),button('compose-stop',t('stop'),onStop),button('compose-save',t('save'),()=>{if(onSave(draft.phrase())){savedText=draft.text;failedText=null;}else{savedText=null;failedText=draft.text;}update();}));
  actions.append(button('compose-undo',t('undo'),()=>{draft.undo();update();}),button('compose-delete',t('delete'),()=>{draft.backspace();update();}),button('compose-space',t('space'),()=>{draft.append(' ');update();}),button('compose-clear',t('clear'),()=>{draft.set('');update();}));
  if(editing)actions.append(button('compose-apply',t('applyText'),e=>{move(e.currentTarget);onApply(draft.text);}));
  const note=document.createElement('p');note.id='compose-saved';note.setAttribute('role','status');root.append(note);
  if(!editing){const status=document.createElement('p');status.id='compose-draft-status';status.setAttribute('role','status');root.append(status,button('compose-draft-retry',t('retryDraft'),()=>update()));}
  if(!editing){
   const note=document.createElement('p');note.className='note';note.id='compose-download-note';note.textContent=t('downloadNote');root.append(note);
   const download=button('compose-download',t('download'),()=>{if(!draft.text.trim())return;let url;try{url=URL.createObjectURL(new Blob([draft.text],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='reach-message.txt';link.click();note.textContent=t('downloadNote');}catch{note.textContent=t('downloadFailed');}finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);}});download.setAttribute('aria-describedby',note.id);root.append(download);
  }
  const tabs=document.createElement('div');tabs.className='backup-row';root.append(tabs);
  for(const next of editing&&!phrases.length?['letters']:['phrases','letters']){const b=button(`compose-${next}`,t(next),e=>{move(e.currentTarget);mode=next;group=null;page=0;render();});b.setAttribute('aria-pressed',String(mode===next));tabs.append(b);}
  if(mode==='letters'&&draft.language==='zh'){const n=document.createElement('p');n.className='note';n.textContent=t('chinese');root.append(n);}
  const groups=keyboardGroups(draft.language),items=mode==='phrases'?phrases:group===null?groups:groups[group],pages=Math.max(1,Math.ceil(items.length/4));page=Math.min(page,pages-1);
  if(mode==='phrases'&&phrases.some(p=>!composerPhraseAvailable(p,draft.language))){const missing=document.createElement('p');missing.id='compose-missing-translation';missing.className='note';missing.textContent=t('missingTranslation');root.append(missing);}
  const grid=document.createElement('div');grid.className='compose-grid';root.append(grid);
  items.slice(page*4,page*4+4).forEach((item,i)=>{const index=page*4+i,label=mode==='phrases'?phraseText(item,draft.language):Array.isArray(item)?item.join(' '):item;
   const b=button(`compose-choice-${i}`,label,e=>{if(mode==='phrases'){if(!composerPhraseAvailable(item,draft.language))return;draft.append(label,draft.language==='zh'?'':' ');update();}else if(group===null){move(e.currentTarget);group=index;page=0;render();}else{draft.append(item);update();}});b.lang=mode==='phrases'?spokenLanguage(item,draft.language):draft.language;b.dir='auto';if(mode==='phrases'){b.dataset.composePhrase=item.id;b.disabled=!composerPhraseAvailable(item,draft.language);if(b.disabled)b.setAttribute('aria-describedby','compose-missing-translation');}grid.append(b);
  });
  const nav=document.createElement('div');nav.className='compose-actions';root.append(nav);
  const prev=button('compose-prev',t('previous'),e=>{move(e.currentTarget);page--;render();}),next=button('compose-next',t('next'),e=>{move(e.currentTarget);page++;render();});prev.disabled=page===0;next.disabled=page===pages-1;nav.append(prev,next);
  if(group!==null)nav.append(button('compose-groups',t('back'),e=>{move(e.currentTarget);group=null;page=0;render();}));
  root.append(button('compose-close',t(editing?'discardText':'close'),e=>{move(e.currentTarget);onClose();}));update();
 }
 function update(){const f=root.querySelector('#compose-text');if(f.value!==draft.text)f.value=draft.text;root.querySelector('#compose-count').textContent=`${Array.from(draft.text).length} / ${MESSAGE_LIMIT}`;for(const id of ['compose-speak','compose-save','compose-download','compose-clear','compose-delete']){const b=root.querySelector('#'+id);if(b)b.disabled=['compose-clear','compose-delete'].includes(id)?!draft.text.length:!draft.text.trim();}root.querySelector('#compose-undo').disabled=!draft.history.length;root.querySelector('#compose-saved').textContent=failedText===draft.text?t('saveFailed'):savedText===draft.text?t('saved'):'';const persisted=onDraftChange();if(!editing){const status=root.querySelector('#compose-draft-status');status.textContent=persisted===false?t('draftFailed'):persisted===true?t('draftSaved'):'';root.querySelector('#compose-draft-retry').disabled=persisted!==false;}}
 render();
}
