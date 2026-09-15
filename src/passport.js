const codes=['en','zh','hi','es','ar','th'];
const labels={
 title:['How I communicate','我的沟通方式','मैं कैसे संवाद करता/करती हूँ','Cómo me comunico','كيف أتواصل','วิธีสื่อสารของฉัน'],
 intro:['An optional handover card for people helping you communicate. Include only what you want to share. Saved details stay on this device and are included in setup exports.','供协助您沟通的人使用的可选交接卡。仅填写您愿意分享的内容。保存的详情留在此设备上，并包含在设置导出中。','संवाद में मदद करने वालों के लिए वैकल्पिक जानकारी कार्ड। केवल वही लिखें जो साझा करना चाहते हैं। सहेजा विवरण इस डिवाइस पर रहता है और सेटअप निर्यात में शामिल होता है।','Tarjeta opcional para quienes te ayudan a comunicarte. Incluye solo lo que quieras compartir. Los datos guardados quedan en este dispositivo y se incluyen al exportar la configuración.','بطاقة اختيارية لمن يساعدونك على التواصل. أضف فقط ما تريد مشاركته. تُحفظ التفاصيل على هذا الجهاز وتُضمّن عند تصدير الإعدادات.','บัตรข้อมูลสำหรับผู้ช่วยสื่อสาร ใส่เฉพาะสิ่งที่ต้องการแบ่งปัน ข้อมูลที่บันทึกอยู่ในอุปกรณ์นี้และรวมในการส่งออกการตั้งค่า'],
 name:['Name or nickname','姓名或昵称','नाम या उपनाम','Nombre o apodo','الاسم أو اللقب','ชื่อหรือชื่อเล่น'],
 yes:['My signal for YES','我表示“是”的信号','हाँ का मेरा संकेत','Mi señal para SÍ','إشارتي لنعم','สัญญาณว่าใช่'],
 no:['My signal for NO','我表示“否”的信号','नहीं का मेरा संकेत','Mi señal para NO','إشارتي للا','สัญญาณว่าไม่'],
 wait:['How long to wait for my answer','等待我回答的时间','मेरे उत्तर के लिए कितना इंतज़ार करें','Cuánto esperar mi respuesta','مدة انتظار إجابتي','ควรรอคำตอบนานเท่าไร'],
 position:['Help me get comfortable','帮助我调整到舒适状态','मुझे आरामदायक स्थिति में लाने में मदद','Ayúdame a estar cómodo/a','ساعدني على الجلوس أو الاستلقاء براحة','ช่วยให้ฉันอยู่ในท่าที่สบาย'],
 backup:['If my usual input is not working','如果常用输入方式失效','यदि मेरा सामान्य इनपुट काम न करे','Si mi forma habitual de seleccionar no funciona','إذا لم تعمل طريقة الإدخال المعتادة','หากวิธีเลือกปกติใช้ไม่ได้'],
 notes:['Other things I want you to know','其他想告诉您的事','अन्य बातें जो मैं बताना चाहता/चाहती हूँ','Otras cosas que quiero que sepas','أمور أخرى أريدك أن تعرفها','สิ่งอื่นที่อยากให้รู้'],
 empty:['Not provided — ask me or my communication partner','未提供，请询问我或我的沟通伙伴','नहीं बताया गया — मुझसे या मेरे संवाद साथी से पूछें','Sin indicar: pregúntame a mí o a quien me ayuda a comunicarme','غير مذكور — اسألني أو اسأل شريك التواصل','ยังไม่ระบุ โปรดถามฉันหรือคู่สื่อสาร'],
 view:['View handover card','查看交接卡','जानकारी कार्ड देखें','Ver tarjeta','عرض البطاقة','ดูบัตรข้อมูล'],
 edit:['Edit card','编辑卡片','कार्ड बदलें','Editar tarjeta','تعديل البطاقة','แก้ไขบัตร'],
 save:['Save card','保存卡片','कार्ड सहेजें','Guardar tarjeta','حفظ البطاقة','บันทึกบัตร'],
 discard:['Discard edits','放弃修改','बदलाव छोड़ें','Descartar cambios','تجاهل التعديلات','ยกเลิกการแก้ไข'],
 clear:['Clear these fields','清空这些字段','ये फ़ील्ड साफ़ करें','Vaciar estos campos','مسح هذه الحقول','ล้างช่องข้อมูลเหล่านี้'],
 print:['Print card','打印卡片','कार्ड छापें','Imprimir tarjeta','طباعة البطاقة','พิมพ์บัตร'],
 download:['Download card','下载卡片','कार्ड डाउनलोड करें','Descargar tarjeta','تنزيل البطاقة','ดาวน์โหลดบัตร'],
 close:['Back to communication','返回沟通','बातचीत पर वापस जाएँ','Volver a comunicar','العودة إلى التواصل','กลับไปสื่อสาร'],
 language:['Board language','沟通板语言','बोर्ड की भाषा','Idioma del tablero','لغة اللوحة','ภาษากระดาน'],
 input:['Current selection method','当前选择方式','वर्तमान चयन तरीका','Método de selección actual','طريقة الاختيار الحالية','วิธีเลือกปัจจุบัน'],
 hint:['These are personal communication instructions, not a medical record. Ask one question at a time and allow the person time to respond. Confirm their intended meaning.','这是个人沟通说明，不是病历。一次只问一个问题，留出回答时间，并确认对方想表达的意思。','ये व्यक्तिगत संवाद निर्देश हैं, चिकित्सा रिकॉर्ड नहीं। एक बार में एक सवाल पूछें और जवाब के लिए समय दें। इच्छित अर्थ की पुष्टि करें।','Estas son instrucciones personales de comunicación, no una historia clínica. Haz una pregunta cada vez, da tiempo para responder y confirma el significado.','هذه تعليمات تواصل شخصية وليست سجلاً طبياً. اطرح سؤالاً واحداً في كل مرة وأتح وقتاً للإجابة. تأكد من المعنى المقصود.','นี่คือคำแนะนำการสื่อสารส่วนบุคคล ไม่ใช่เวชระเบียน ถามทีละคำถาม ให้เวลาตอบ และยืนยันความหมายที่ต้องการสื่อ'],
 untranslated:['Personal notes are shown as entered; they are not automatically translated.','个人备注按原文显示，不会自动翻译。','व्यक्तिगत टिप्पणियाँ जैसी लिखी गई हैं वैसी दिखती हैं; उनका अपने आप अनुवाद नहीं होता।','Las notas personales se muestran tal como se escribieron; no se traducen automáticamente.','تُعرض الملاحظات الشخصية كما أُدخلت ولا تُترجم تلقائياً.','ข้อความส่วนตัวแสดงตามที่กรอก ไม่มีการแปลอัตโนมัติ'],
};
export const passportText=(key,lang='en')=>labels[key]?.[codes.indexOf(lang)]||labels[key]?.[0]||key;
export const passportFields=['name','yes','no','wait','position','backup','notes'];
export function validatePassport(value){return Object.fromEntries(passportFields.map(key=>[key,typeof value?.[key]==='string'?Array.from(value[key].trim()).slice(0,key==='name'?100:500).join(''):'']));}
export function passportCard({passport,language,languageName,inputLabel}){
 const t=key=>passportText(key,language),article=document.createElement('article');article.className='passport-card';article.lang=language;article.dir=language==='ar'?'rtl':'ltr';
 const heading=document.createElement('h2');heading.textContent=t('title');article.append(heading);
 const list=document.createElement('dl');article.append(list);
 for(const [key,value] of [...passportFields.map(key=>[key,passport[key]]),['language',languageName],['input',inputLabel]]){const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=t(key);dd.textContent=value||t('empty');dd.dir='auto';group.append(dt,dd);list.append(group);}
 for(const key of ['untranslated','hint']){const p=document.createElement('p');p.textContent=t(key);article.append(p);}return article;
}
export const passportCSS=`body{font:18px/1.6 system-ui,sans-serif;color:#183c32;background:white;margin:24px}.passport-card{max-width:800px;margin:auto}.passport-card h2{font-size:30px}.passport-card dl>div{break-inside:avoid;border-bottom:1px solid #b4c8b0;padding:12px 0}.passport-card dt{font-weight:700}.passport-card dd{margin:6px 0;white-space:pre-wrap;overflow-wrap:anywhere}.passport-card p{font-size:15px}.passport-card h2{break-after:avoid}@media print{body{margin:0;color:black}.passport-card{max-width:none}}`;
export function passportHTML(options){const card=passportCard(options),doc=document.implementation.createHTMLDocument(passportText('title',options.language));doc.documentElement.lang=options.language;doc.documentElement.dir=options.language==='ar'?'rtl':'ltr';const meta=doc.createElement('meta');meta.setAttribute('charset','utf-8');doc.head.prepend(meta);const viewport=doc.createElement('meta');viewport.name='viewport';viewport.content='width=device-width, initial-scale=1';doc.head.append(viewport);const style=doc.createElement('style');style.textContent=passportCSS;doc.head.append(style);doc.body.append(card);return '<!doctype html>\n'+doc.documentElement.outerHTML;}
export function mountPassport(root,{settings,languageName,inputLabel,onSave,onClose,onTransition,onPrint,onDownload}){
 const lang=settings.language,t=key=>passportText(key,lang);let draft=validatePassport(settings.passport),editing=false;
 const options=()=>({passport:validatePassport(settings.passport),language:lang,languageName,inputLabel});
 const button=(id,label,fn)=>{const b=document.createElement('button');b.id=id;b.textContent=label;b.className='secondary-button';b.dataset.access='';b.onclick=()=>fn(b);return b;};
 const change=(b,fn)=>{onTransition(b);fn();render();};
 function render(){root.replaceChildren();const intro=document.createElement('p');intro.className='intro';intro.textContent=t('intro');root.append(intro);
  if(editing){const fields=document.createElement('div');fields.className='passport-fields';root.append(fields);for(const key of passportFields){const label=document.createElement('label');label.textContent=t(key);label.htmlFor='passport-'+key;const field=document.createElement(key==='name'?'input':'textarea');field.id=label.htmlFor;field.value=draft[key];field.maxLength=key==='name'?100:500;field.dir='auto';if(key!=='name')field.rows=2;field.oninput=()=>draft[key]=field.value;label.append(field);fields.append(label);}
   const actions=document.createElement('div');actions.className='backup-row';root.append(actions);actions.append(button('passport-save',t('save'),b=>{if(onSave(validatePassport(draft)))change(b,()=>editing=false);}),button('passport-discard',t('discard'),b=>change(b,()=>{draft=validatePassport(settings.passport);editing=false;})),button('passport-clear',t('clear'),b=>change(b,()=>draft=validatePassport(null))));
  }else{root.append(passportCard(options()));const actions=document.createElement('div');actions.className='backup-row';root.append(actions);actions.append(button('passport-edit',t('edit'),b=>change(b,()=>{draft=validatePassport(settings.passport);editing=true;})),button('passport-print',t('print'),()=>onPrint(options())),button('passport-download',t('download'),()=>onDownload(passportHTML(options()))));}
  root.append(button('passport-close',t('close'),onClose));root.closest('dialog').scrollTop=0;
 }
 render();
}
