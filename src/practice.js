export class InputTrial {
 constructor(){this.phase='ready';this.sequence=[0,3,1,2];this.correct=0;this.errors=0;this.quietSelections=0;this.elapsed=0;this.quietTime=0;this.availableTime=0;this.last=null;}
 start(){this.phase='targets';this.last=null;}
 select(index){
  if(this.phase==='quiet'){this.quietSelections++;return;}
  if(this.phase!=='targets')return;
  if(index===this.sequence[this.correct]){this.correct++;if(this.correct===4)this.phase='prepareQuiet';}else this.errors++;
 }
 startQuiet(){if(this.phase==='prepareQuiet'){this.phase='quiet';this.last=null;}}
 tick(now,focused,available){
  if(!focused){this.last=null;return;}
  const delta=this.last===null?0:Math.min(250,Math.max(0,now-this.last));this.last=now;
  if(this.phase==='targets')this.elapsed+=delta;
  if(this.phase==='quiet'){this.quietTime+=delta;if(available)this.availableTime+=delta;if(this.quietTime>=10000)this.phase='result';}
 }
}
const langs=['en','zh','hi','es','ar','th'];
const labels={
 title:['Try your input','试用输入方式','अपना इनपुट आज़माएँ','Prueba tu entrada','جرّب طريقة الإدخال','ลองวิธีการเลือก'],
 intro:['Select the numbered target when asked. Then rest for 10 seconds without selecting. No communication messages will be spoken. This is a practice trial, not a reliability assessment.','按提示选择数字目标，然后休息10秒，不选择任何目标。不会朗读沟通消息。这是练习，不是可靠性评估。','कहे जाने पर नंबर वाला लक्ष्य चुनें। फिर 10 सेकंड बिना चयन किए आराम करें। कोई संदेश नहीं बोला जाएगा। यह अभ्यास है, विश्वसनीयता का आकलन नहीं।','Selecciona el número indicado. Después descansa 10 segundos sin seleccionar. No se pronunciarán mensajes. Es una práctica, no una evaluación de fiabilidad.','اختر الرقم المطلوب، ثم استرح 10 ثوانٍ دون اختيار. لن تُنطق رسائل. هذا تدريب وليس تقييماً للموثوقية.','เลือกหมายเลขตามที่บอก แล้วพัก 10 วินาทีโดยไม่เลือก จะไม่มีการพูดข้อความ นี่คือการฝึก ไม่ใช่การประเมินความน่าเชื่อถือ'],
 start:['Start practice','开始练习','अभ्यास शुरू करें','Empezar práctica','بدء التدريب','เริ่มฝึก'],
 target:['Select number','选择数字','नंबर चुनें','Selecciona el número','اختر الرقم','เลือกหมายเลข'],
 rest:['Ready for 10 seconds of rest','准备休息10秒','10 सेकंड आराम के लिए तैयार','Preparado para descansar 10 segundos','جاهز لاستراحة 10 ثوانٍ','พร้อมพัก 10 วินาที'],
 resting:['Rest now. Do not select a number.','现在休息，不要选择数字。','अब आराम करें। कोई नंबर न चुनें।','Descansa. No selecciones ningún número.','استرح الآن. لا تختر رقماً.','พักตอนนี้ อย่าเลือกหมายเลข'],
 done:['Practice results','练习结果','अभ्यास के परिणाम','Resultados de práctica','نتائج التدريب','ผลการฝึก'],
 correct:['Requested targets selected','已选中的指定目标','चुने गए सही लक्ष्य','Objetivos solicitados seleccionados','الأهداف المطلوبة المختارة','เป้าหมายที่เลือกถูกต้อง'],
 errors:['Other target selections','其他目标选择次数','अन्य लक्ष्य चयन','Otras selecciones','اختيارات أهداف أخرى','การเลือกเป้าหมายอื่น'],
 elapsed:['Target practice time (seconds)','目标练习时间（秒）','लक्ष्य अभ्यास समय (सेकंड)','Tiempo de práctica (segundos)','وقت تدريب الأهداف (ثوانٍ)','เวลาฝึกเป้าหมาย (วินาที)'],
 quiet:['Selections during rest','休息时的选择次数','आराम के दौरान चयन','Selecciones durante el descanso','اختيارات أثناء الاستراحة','การเลือกระหว่างพัก'],
 coverage:['Input signal available during rest (seconds)','休息时输入信号可用时间（秒）','आराम में इनपुट सिग्नल उपलब्ध (सेकंड)','Señal disponible en descanso (segundos)','توفر إشارة الإدخال أثناء الاستراحة (ثوانٍ)','เวลาที่มีสัญญาณระหว่างพัก (วินาที)'],
 helper:['Someone helped me select targets','有人帮助我选择目标','किसी ने लक्ष्य चुनने में मदद की','Alguien me ayudó a seleccionar','ساعدني شخص في اختيار الأهداف','มีคนช่วยฉันเลือกเป้าหมาย'],
 caution:['A short trial cannot prove reliable communication. Consider comfort, fatigue and help needed. Repeat in your usual position and lighting.','短暂练习不能证明沟通可靠。请考虑舒适度、疲劳及所需帮助，在日常姿势和光线下再次练习。','छोटा अभ्यास विश्वसनीय संचार साबित नहीं करता। आराम, थकान और मदद पर विचार करें। सामान्य स्थिति और रोशनी में फिर आज़माएँ।','Una prueba breve no demuestra fiabilidad. Considera comodidad, cansancio y ayuda necesaria. Repite en tu posición e iluminación habituales.','لا يثبت التدريب القصير موثوقية التواصل. راعِ الراحة والتعب والمساعدة اللازمة. كرر في وضعيتك وإضاءتك المعتادتين.','การฝึกสั้น ๆ ไม่ยืนยันว่าการสื่อสารเชื่อถือได้ คำนึงถึงความสบาย ความเหนื่อยและความช่วยเหลือ ลองซ้ำในท่าและแสงที่ใช้จริง'],
 missing:['Set up the camera and calibration before starting.','开始前请设置摄像头并校准。','शुरू करने से पहले कैमरा और कैलिब्रेशन सेट करें।','Configura la cámara y calibra antes de empezar.','أعدّ الكاميرا والمعايرة قبل البدء.','ตั้งค่ากล้องและปรับเทียบก่อนเริ่ม'],
 gap:['The input signal was missing for part of the rest. Zero selections does not establish control.','部分休息时间缺少输入信号。零次选择不能证明控制可靠。','आराम के कुछ समय इनपुट सिग्नल नहीं था। शून्य चयन से नियंत्रण साबित नहीं होता।','Faltó señal durante parte del descanso. Cero selecciones no demuestra control.','غابت إشارة الإدخال خلال جزء من الاستراحة. صفر اختيارات لا يثبت التحكم.','ไม่มีสัญญาณในบางช่วงของการพัก การไม่เกิดการเลือกไม่ได้ยืนยันการควบคุม'],
 slower:['Use slower selection','使用较慢选择','धीमा चयन इस्तेमाल करें','Seleccionar más despacio','استخدام اختيار أبطأ','เลือกให้ช้าลง'],
 larger:['Use larger board tiles','使用更大的按钮','बोर्ड के बड़े बटन इस्तेमाल करें','Usar botones más grandes','استخدام أزرار أكبر','ใช้ปุ่มใหญ่ขึ้น'],
 change:['Try another input','尝试其他输入','दूसरा इनपुट आज़माएँ','Probar otra entrada','تجربة إدخال آخر','ลองวิธีการเลือกอื่น'],
 retry:['Practice again','再次练习','फिर अभ्यास करें','Practicar otra vez','التدريب مجدداً','ฝึกอีกครั้ง'],
 close:['Back to communication','返回沟通','बातचीत पर वापस जाएँ','Volver a comunicar','العودة إلى التواصل','กลับไปสื่อสาร'],
};
export const practiceText=(key,lang)=>labels[key]?.[langs.indexOf(lang)]||labels[key]?.[0]||key;
export function mountPractice(root,{language,modeLabel,ready,onClose,onChange,onSlower,onLarger,onTransition,assisted=false}){
 let trial=new InputTrial(),lastPhase='',helper=assisted;
 const t=k=>practiceText(k,language);
 function button(label,action,id){const b=document.createElement('button');b.textContent=label;b.className='secondary-button';b.id=id;b.dataset.access='';b.onclick=e=>action(e);return b;}
 function render(){
  if(trial.phase==='result'&&lastPhase==='quiet')onTransition(null);
  root.replaceChildren();const intro=document.createElement('p');intro.className='intro';intro.textContent=t('intro');root.append(intro);
  const mode=document.createElement('p');mode.className='note';mode.textContent=modeLabel;root.append(mode);
  const status=document.createElement('p');status.id='practice-status';status.setAttribute('role','status');root.append(status);
  if(trial.phase==='ready'){
   status.textContent=ready()?t('start'):t('missing');const start=button(t('start'),e=>{if(!ready()){render();return;}onTransition(e.currentTarget);trial.start();render();},'practice-start');start.disabled=!ready();root.append(start);
  }else if(['targets','prepareQuiet','quiet'].includes(trial.phase)){
   const grid=document.createElement('div');grid.className='practice-grid';
   for(let i=0;i<4;i++){const b=button(String(i+1),e=>{onTransition(e.currentTarget);trial.select(i);update();},`practice-target-${i}`);b.dataset.practiceTarget=i;grid.append(b);}root.append(grid);
   if(trial.phase==='prepareQuiet')root.append(button(t('rest'),e=>{onTransition(e.currentTarget);trial.startQuiet();render();},'practice-rest'));
  }else{
   status.textContent=t('done');const dl=document.createElement('dl');dl.className='practice-results';
   for(const [label,value]of [['correct',`${trial.correct}/4`],['errors',trial.errors],['elapsed',(trial.elapsed/1000).toFixed(1)],['quiet',trial.quietSelections],['coverage',`${(Math.min(trial.availableTime,10000)/1000).toFixed(1)}/10`]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=t(label);dd.textContent=value;dl.append(dt,dd);}root.append(dl);
   const h=button(t('helper'),()=>{helper=!helper;h.setAttribute('aria-pressed',String(helper));},'practice-helper');h.setAttribute('aria-pressed',String(helper));root.append(h);
   const note=document.createElement('p');note.className='note';note.textContent=(trial.availableTime<8000?t('gap')+' ':'')+t('caution');root.append(note);
   root.append(button(t('slower'),onSlower,'practice-slower'),button(t('larger'),onLarger,'practice-larger'),button(t('retry'),()=>{trial=new InputTrial();helper=false;render();},'practice-retry'));
  }
  root.append(button(t('change'),onChange,'practice-change'),button(t('close'),onClose,'practice-close'));lastPhase=trial.phase;update();
 }
 function update(){
  if(lastPhase!==trial.phase){render();return;}
  const status=root.querySelector('#practice-status');
  let text=status.textContent;
  if(trial.phase==='ready'){const canStart=ready();root.querySelector('#practice-start').disabled=!canStart;text=t(canStart?'start':'missing');}
  if(trial.phase==='targets')text=`${t('target')} ${trial.sequence[trial.correct]+1} · ${trial.correct}/4`;
  if(trial.phase==='prepareQuiet')text=t('rest');
  if(trial.phase==='quiet')text=`${t('resting')} ${Math.max(0,Math.ceil((10000-trial.quietTime)/1000))}`;
  if(status.textContent!==text)status.textContent=text;
  root.querySelectorAll('[data-practice-target]').forEach(b=>{b.classList.toggle('requested-target',trial.phase==='targets'&&Number(b.dataset.practiceTarget)===trial.sequence[trial.correct]);});
 }
 render();return {tick(now,focused,available){trial.tick(now,focused,available);update();}};
}
