import {composerText} from './composer.js';
const codes=['en','zh','hi','es','ar','th'];
const words={
 title:['Describe discomfort','描述不适','तकलीफ़ बताएँ','Describir molestias','وصف الانزعاج','บอกอาการไม่สบาย'],
 intro:['Choose only what you want to say. Details are optional. Review your message before speaking.','只选择您想表达的内容。详情可选。朗读前请检查消息。','केवल वही चुनें जो आप कहना चाहते हैं। विवरण वैकल्पिक हैं। बोलने से पहले संदेश देखें।','Elige solo lo que quieres decir. Los detalles son opcionales. Revisa el mensaje antes de hablar.','اختر فقط ما تريد قوله. التفاصيل اختيارية. راجع رسالتك قبل نطقها.','เลือกเฉพาะสิ่งที่ต้องการบอก รายละเอียดไม่บังคับ ตรวจข้อความก่อนพูด'],
 symptom:['What do you feel?','有什么感觉？','क्या महसूस हो रहा है?','¿Qué sientes?','ماذا تشعر؟','รู้สึกอย่างไร'],
 pain:['I have pain.','我疼痛。','मुझे दर्द है।','Tengo dolor.','أشعر بألم.','ฉันมีอาการปวด'],
 discomfort:['I feel uncomfortable.','我感觉不舒服。','मुझे असुविधा हो रही है।','Siento incomodidad.','أشعر بعدم الراحة.','ฉันรู้สึกไม่สบายตัว'],
 itch:['I feel itchy.','我感觉痒。','मुझे खुजली हो रही है।','Tengo picor.','أشعر بحكة.','ฉันรู้สึกคัน'],
 numb:['I feel numbness.','我感觉麻木。','मुझे सुन्नपन महसूस हो रहा है।','Siento entumecimiento.','أشعر بخدر.','ฉันรู้สึกชา'],
 location:['Location','部位','स्थान','Lugar','الموضع','บริเวณ'],
 head:['Head','头部','सिर','Cabeza','الرأس','ศีรษะ'],neck:['Neck','颈部','गर्दन','Cuello','الرقبة','คอ'],shoulder:['Shoulder','肩部','कंधा','Hombro','الكتف','ไหล่'],chest:['Chest','胸部','छाती','Pecho','الصدر','หน้าอก'],
 back:['Back','背部','पीठ','Espalda','الظهر','หลัง'],belly:['Abdomen','腹部','पेट','Abdomen','البطن','ท้อง'],arm:['Arm','手臂','बाँह','Brazo','الذراع','แขน'],hand:['Hand','手','हाथ','Mano','اليد','มือ'],
 hip:['Hip','髋部','कूल्हा','Cadera','الورك','สะโพก'],leg:['Leg','腿','पैर','Pierna','الساق','ขา'],foot:['Foot','脚','पाँव','Pie','القدم','เท้า'],everywhere:['All over','全身','पूरे शरीर में','Todo el cuerpo','في كل الجسم','ทั้งตัว'],
 side:['Side','侧别','तरफ़','Lado','الجانب','ด้าน'],left:['Left','左侧','बाईं ओर','Izquierdo','الأيسر','ซ้าย'],right:['Right','右侧','दाईं ओर','Derecho','الأيمن','ขวา'],both:['Both sides','两侧','दोनों ओर','Ambos lados','الجانبان','ทั้งสองข้าง'],middle:['Middle','中间','बीच में','Centro','الوسط','ตรงกลาง'],
 severity:['How much','程度','कितनी तकलीफ़','Intensidad','الشدة','ระดับความรู้สึก'],little:['A little','轻微','थोड़ी','Leve','قليلة','เล็กน้อย'],moderate:['Moderate','中等','मध्यम','Moderada','متوسطة','ปานกลาง'],severe:['Severe','严重','बहुत ज़्यादा','Intensa','شديدة','มาก'],
 time:['When it started','开始时间','कब शुरू हुआ','Cuándo empezó','وقت البداية','เริ่มเมื่อไร'],now:['Just now','刚刚','अभी','Ahora mismo','الآن للتو','เมื่อสักครู่'],today:['Earlier today','今天早些时候','आज पहले','Hoy, antes','في وقت سابق اليوم','ก่อนหน้านี้วันนี้'],earlier:['Before today','今天之前','आज से पहले','Antes de hoy','قبل اليوم','ก่อนวันนี้'],
 unsure:['Not sure','不确定','पता नहीं','No estoy seguro/a','لست متأكداً','ไม่แน่ใจ'],skip:['Leave this out','不填写此项','यह छोड़ दें','Omitir este dato','تخطي هذا التفصيل','ไม่ระบุ'],review:['Review message','检查消息','संदेश देखें','Revisar mensaje','مراجعة الرسالة','ตรวจข้อความ'],edit:['Change','更改','बदलें','Cambiar','تغيير','เปลี่ยน'],restart:['Start a new message','开始新消息','नया संदेश शुरू करें','Empezar otro mensaje','بدء رسالة جديدة','เริ่มข้อความใหม่'],omitted:['Not included','未填写','शामिल नहीं','Sin incluir','غير مذكور','ไม่ได้ระบุ'],
};
export const careText=(key,lang='en')=>words[key]?.[codes.indexOf(lang)]||words[key]?.[0]||composerText(key,lang);
export const careFields=['symptom','location','side','severity','time'];
export const careOptions={symptom:['pain','discomfort','itch','numb'],location:['head','neck','shoulder','chest','back','belly','arm','hand','hip','leg','foot','everywhere'],side:['left','right','both','middle'],severity:['little','moderate','severe','unsure'],time:['now','today','earlier','unsure']};
export class CareDraft{
 constructor(){this.values={};this.step=0;}
 select(field,value){if(!careFields.includes(field)||!(careOptions[field].includes(value)||(field!=='symptom'&&(value===null||value==='unsure'))))throw Error('Invalid care choice');this.values[field]=value;if(field==='location'&&value==='everywhere')this.values.side=null;}
 phrase(){if(!this.values.symptom)return null;const translations=Object.fromEntries(codes.map(lang=>[lang,[careText(this.values.symptom,lang),...careFields.slice(1).filter(f=>this.values[f]).map(f=>`${careText(f,lang)}: ${careText(this.values[f],lang)}`)].join('\n')]));return {id:'care-message',en:translations.en,th:translations.th,translations,sourceLanguage:'en',icon:'HeartPulse',tone:'neutral'};}
}
export function mountCare(root,{draft,language,onSpeak,onStop,onClose,onTransition,onStatus}){
 const t=k=>careText(k,language);let page=0,editing=false;
 const button=(id,label,fn)=>{const b=document.createElement('button');b.id=id;b.className='secondary-button';b.dataset.access='';b.textContent=label;b.onclick=()=>fn(b);return b;};
 const transition=(b,fn)=>{onTransition(b);fn();render();};
 function render(){
  root.replaceChildren();const intro=document.createElement('p');intro.className='intro';intro.textContent=t('intro');root.append(intro);
  const field=careFields[draft.step],title=document.createElement('h3');title.id='care-step';title.textContent=field?`${draft.step+1} / 5 · ${t(field)}`:t('review');root.append(title);
  if(field){
   const grid=document.createElement('div');grid.className='care-grid';grid.setAttribute('aria-labelledby','care-step');root.append(grid);
   const select=(b,value)=>transition(b,()=>{draft.select(field,value);draft.step=editing?5:draft.step+1;if(draft.step===2&&draft.values.location==='everywhere')draft.step=3;editing=false;page=0;});
   careOptions[field].slice(page*4,page*4+4).forEach(value=>{const b=button('care-'+value,t(value),b=>select(b,value));b.setAttribute('aria-pressed',String(draft.values[field]===value));grid.append(b);});
   const nav=document.createElement('div');nav.className='compose-actions';root.append(nav);
   if(careOptions[field].length>4){const prev=button('care-prev',t('previous'),b=>transition(b,()=>page--)),next=button('care-next',t('next'),b=>transition(b,()=>page++));prev.disabled=page===0;next.disabled=(page+1)*4>=careOptions[field].length;nav.append(prev,next);}
   if(field!=='symptom'){if(!careOptions[field].includes('unsure'))nav.append(button('care-unsure',t('unsure'),b=>select(b,'unsure')));nav.append(button('care-skip',t('skip'),b=>select(b,null)));}
   if(draft.step>0)nav.append(button('care-back',t('back'),b=>transition(b,()=>{draft.step--;if(draft.step===2&&draft.values.location==='everywhere')draft.step=1;page=0;editing=false;})));
  }else{
   const message=document.createElement('p');message.id='care-review';message.className='care-review';message.lang=language;message.dir='auto';message.textContent=draft.phrase().translations[language];root.append(message);
   const actions=document.createElement('div');actions.className='compose-actions';root.append(actions);
   actions.append(button('care-speak',t('speak'),()=>onSpeak(draft.phrase())),button('care-stop',t('stop'),onStop));
   const voice=document.createElement('p');voice.id='care-voice';voice.setAttribute('role','status');root.append(voice);
   const edits=document.createElement('div');edits.className='care-edits';root.append(edits);
   careFields.forEach((f,i)=>{if(f==='side'&&draft.values.location==='everywhere')return;edits.append(button('care-edit-'+f,`${t('edit')} · ${t(f)} · ${draft.values[f]?t(draft.values[f]):t('omitted')}`,b=>transition(b,()=>{draft.step=i;page=0;editing=true;})));});
   root.append(button('care-restart',t('restart'),b=>transition(b,()=>{draft.values={};draft.step=0;page=0;})));
  }
  root.append(button('care-close',t('close'),onClose));onStatus();root.closest('dialog').scrollTop=0;title.tabIndex=-1;title.focus({preventScroll:true});
 }
 render();
}
