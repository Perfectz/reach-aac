const codes=['en','zh','hi','es','ar','th'];
const words={
 language:['Board language','沟通板语言','बोर्ड की भाषा','Idioma del tablero','لغة اللوحة','ภาษากระดาน'],
 layout:['Layout','布局','लेआउट','Diseño','التخطيط','รูปแบบ'],
 full:['Adaptive · more on larger screens','自适应 · 大屏显示更多','अनुकूलित · बड़ी स्क्रीन पर अधिक','Adaptable · más en pantallas grandes','متكيف · المزيد على الشاشات الكبيرة','ปรับตามจอ · จอใหญ่แสดงมากขึ้น'],
 simple:['Larger tiles','较大按钮','बड़े बटन','Botones grandes','أزرار أكبر','ปุ่มขนาดใหญ่'],
 voice:['Speak selected messages','朗读所选消息','चुने हुए संदेश बोलें','Leer mensajes seleccionados','نطق الرسائل المختارة','พูดข้อความที่เลือก'],
 contrast:['Higher contrast','高对比度','अधिक कंट्रास्ट','Mayor contraste','تباين أعلى','ความคมชัดสูง'],
 on:['On','开启','चालू','Activado','تشغيل','เปิด'],off:['Off','关闭','बंद','Desactivado','إيقاف','ปิด']
};
export function mountPreferenceControls(root,{language,onSelect}){
 const text=k=>words[k][Math.max(0,codes.indexOf(language))];
 for(const [id,key] of [['setting-language','language'],['setting-layout','layout'],['setting-vocabulary',null]]){
  const select=root.querySelector('#'+id);if(!select)continue;
  const label=select.closest('label'),wrapper=document.createElement('div');wrapper.className='preference-control';label.before(wrapper);wrapper.append(label);
  if(key)label.firstChild.textContent=text(key);
  const group=document.createElement('div');group.className='preference-options';group.setAttribute('role','group');group.setAttribute('aria-label',label.firstChild.textContent);wrapper.append(group);
  const buttons=[...select.options].map(option=>{
   if(key==='layout')option.textContent=text(option.value);
   const b=document.createElement('button');b.type='button';b.className='secondary-button';b.id=id+'-choice-'+option.value;b.dataset.access='';b.textContent=option.textContent;
   if(key==='language')b.lang=option.value;
   b.onclick=()=>{if(select.value===option.value)return;onSelect(b);select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));};group.append(b);return b;
  });
  const sync=()=>buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.id===id+'-choice-'+select.value)));select.addEventListener('change',sync);sync();
 }
 for(const [id,key] of [['setting-voice','voice'],['setting-contrast','contrast']]){
  const input=root.querySelector('#'+id);if(!input)continue;
  const label=input.closest('label');label.querySelector('strong').textContent=text(key);
  const b=document.createElement('button');b.type='button';b.id=id+'-toggle';b.className='setting-link preference-toggle';b.dataset.access='';label.after(b);
  const sync=()=>{b.setAttribute('aria-pressed',String(input.checked));b.textContent=text(key)+' · '+text(input.checked?'on':'off');};
  b.onclick=()=>{onSelect(b);input.checked=!input.checked;input.dispatchEvent(new Event('change',{bubbles:true}));};input.addEventListener('change',sync);sync();
 }
}
