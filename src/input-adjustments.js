const codes=['en','zh','hi','es','ar','th'];
const labels={
 scanAudioRate:['Scan preview speed','扫描预览语速','स्कैन संकेत की गति','Velocidad de los avisos','سرعة مطالبات المسح','ความเร็วเสียงตัวเลือกสแกน'],
 less:['Decrease','减少','कम करें','Reducir','تقليل','ลด'],more:['Increase','增加','बढ़ाएँ','Aumentar','زيادة','เพิ่ม'],
 dwell:['Dwell time','停留时间','ठहराव का समय','Tiempo de permanencia','مدة التثبيت','เวลาจ้องเพื่อเลือก'],
 scan:['Scan time','扫描时间','स्कैन का समय','Tiempo de barrido','مدة المسح','เวลาสแกน'],
 gain:['Movement gain','移动增益','गति संवेदनशीलता','Ganancia de movimiento','مقدار الحركة','อัตราขยายการเคลื่อนไหว'],
 threshold:['Movement threshold','移动阈值','गति की सीमा','Umbral de movimiento','عتبة الحركة','เกณฑ์การเคลื่อนไหว'],
 finger:['Finger to track','跟踪的手指','ट्रैक करने वाली उंगली','Dedo que seguir','الإصبع المراد تتبعه','นิ้วที่ติดตาม'],
 8:['Index finger','食指','तर्जनी','Índice','السبابة','นิ้วชี้'],4:['Thumb','拇指','अंगूठा','Pulgar','الإبهام','นิ้วหัวแม่มือ'],
 12:['Middle finger','中指','मध्यमा','Medio','الوسطى','นิ้วกลาง'],16:['Ring finger','无名指','अनामिका','Anular','البنصر','นิ้วนาง'],20:['Little finger','小指','कनिष्ठा','Meñique','الخنصر','นิ้วก้อย']
};
export function mountInputAdjustments(root,{language,onSelect}){
 const text=key=>labels[key][Math.max(0,codes.indexOf(language))];
 for(const [id,key] of [['dwell-time','dwell'],['scan-time','scan'],['scan-audio-rate','scanAudioRate'],['gain','gain'],['threshold','threshold']]){
  const input=root.querySelector('#'+id);if(!input)continue;
  const label=input.closest('label'),group=document.createElement('div');group.className='input-adjustment';label.before(group);group.append(label);
  const title=[...label.childNodes].find(n=>n.nodeType===3);if(title)title.textContent=text(key)+' ';
  input.setAttribute('aria-label',text(key));
  let output=label.querySelector('output');if(!output){output=document.createElement('output');label.insertBefore(output,input);}
  output.setAttribute('aria-live','polite');
  const row=document.createElement('div');row.className='adjustment-buttons';group.append(row);
  const buttons=[-1,1].map(direction=>{
   const button=document.createElement('button');button.type='button';button.id=id+(direction<0?'-less':'-more');button.className='secondary-button';button.dataset.access='';button.textContent=(direction<0?'− ':'+ ')+text(direction<0?'less':'more');button.setAttribute('aria-label',text(direction<0?'less':'more')+' · '+text(key));
   button.onclick=()=>{onSelect(button);direction<0?input.stepDown():input.stepUp();input.dispatchEvent(new Event('input',{bubbles:true}));};row.append(button);return button;
  });
  const sync=()=>{const value=Number(input.value);buttons[0].disabled=value<=Number(input.min);buttons[1].disabled=value>=Number(input.max);output.textContent=key==='dwell'||key==='scan'?(value/1000).toFixed(1)+' s':value+(key==='gain'?' ×':'');};
  input.addEventListener('input',sync);sync();
 }
 const select=root.querySelector('#finger');if(!select)return;
 // Keep the native select as a synchronized fallback; expose each choice as a target.
 const label=select.closest('label');label.firstChild.textContent=text('finger');
 const choices=document.createElement('div');choices.className='finger-buttons';choices.setAttribute('role','group');choices.setAttribute('aria-label',text('finger'));label.after(choices);
 const buttons=[...select.options].map(option=>{option.textContent=text(option.value);const b=document.createElement('button');b.type='button';b.id='finger-choice-'+option.value;b.className='secondary-button';b.dataset.access='';b.textContent=option.textContent;b.onclick=()=>{if(select.value===option.value)return;onSelect(b);select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));};choices.append(b);return b;});
 const sync=()=>buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.id==='finger-choice-'+select.value)));select.addEventListener('change',sync);sync();
}
