const codes=['en','zh','hi','es','ar','th'];
const words={
 enable:['Keep screen awake','保持屏幕常亮','स्क्रीन चालू रखें','Mantener pantalla encendida','إبقاء الشاشة مضاءة','เปิดหน้าจอค้างไว้'],
 disable:['Allow screen to sleep','允许屏幕休眠','स्क्रीन को बंद होने दें','Permitir que la pantalla repose','السماح بسكون الشاشة','อนุญาตให้หน้าจอพัก'],
 off:['Screen follows device sleep settings','屏幕遵循设备休眠设置','स्क्रीन डिवाइस की स्लीप सेटिंग का पालन करती है','La pantalla sigue los ajustes del dispositivo','تتبع الشاشة إعدادات السكون في الجهاز','หน้าจอใช้การตั้งค่าพักของอุปกรณ์'],
 active:['Keeping screen awake','正在保持屏幕常亮','स्क्रीन चालू रखी जा रही है','Manteniendo la pantalla encendida','يجري إبقاء الشاشة مضاءة','กำลังเปิดหน้าจอค้างไว้'],
 pending:['Requesting screen to stay awake','正在请求保持屏幕常亮','स्क्रीन चालू रखने का अनुरोध हो रहा है','Solicitando mantener la pantalla encendida','جارٍ طلب إبقاء الشاشة مضاءة','กำลังขอเปิดหน้าจอค้างไว้'],
 suspended:['Screen-awake request paused while this tab is hidden','此标签页隐藏时暂停常亮请求','यह टैब छिपा होने पर अनुरोध रुका है','Solicitud en pausa mientras esta pestaña está oculta','الطلب متوقف مؤقتاً أثناء إخفاء علامة التبويب','พักคำขอเมื่อแท็บนี้ถูกซ่อน'],
 released:['Device released screen-awake control. You can try again.','设备已停止屏幕常亮控制。您可以重试。','डिवाइस ने स्क्रीन चालू रखने का नियंत्रण छोड़ा। फिर कोशिश कर सकते हैं।','El dispositivo dejó de mantener la pantalla encendida. Puedes reintentarlo.','أوقف الجهاز إبقاء الشاشة مضاءة. يمكنك المحاولة مجدداً.','อุปกรณ์หยุดการเปิดหน้าจอค้างไว้ ลองอีกครั้งได้'],
 failed:['Could not change screen-awake control. Try again.','无法更改屏幕常亮控制。请重试。','स्क्रीन चालू रखने का नियंत्रण नहीं बदला जा सका। फिर कोशिश करें।','No se pudo cambiar el control de pantalla. Inténtalo de nuevo.','تعذّر تغيير التحكم في سكون الشاشة. حاول مجدداً.','เปลี่ยนการเปิดหน้าจอค้างไว้ไม่ได้ ลองอีกครั้ง'],
 unsupported:['This browser does not support keeping the screen awake','此浏览器不支持保持屏幕常亮','यह ब्राउज़र स्क्रीन चालू रखने का समर्थन नहीं करता','Este navegador no permite mantener la pantalla encendida','هذا المتصفح لا يدعم إبقاء الشاشة مضاءة','เบราว์เซอร์นี้ไม่รองรับการเปิดหน้าจอค้างไว้'],
 note:['For this session while Reach is visible. Uses more battery. You can turn it off at any time.','仅在本次使用且 Reach 可见时生效。会增加耗电。您随时可以关闭。','इस सत्र में Reach दिखाई देने तक। बैटरी अधिक लगती है। कभी भी बंद कर सकते हैं।','Durante esta sesión mientras Reach esté visible. Consume más batería. Puedes desactivarlo cuando quieras.','لهذه الجلسة عندما يكون Reach ظاهراً. يستهلك بطارية أكثر ويمكنك إيقافه متى شئت.','ใช้ในครั้งนี้เมื่อมองเห็น Reach ใช้แบตเตอรี่มากขึ้น ปิดได้ทุกเมื่อ']
};
export const awakeText=(key,language)=>words[key][Math.max(0,codes.indexOf(language))];
export class ScreenAwake{
 constructor(api,visible=()=>true,onChange=()=>{}){this.api=api;this.visible=visible;this.onChange=onChange;this.wanted=false;this.lock=null;this.sequence=0;this.status=api?.request?'off':'unsupported';}
 emit(status){this.status=status;this.onChange();}
 async enable(){
  if(!this.api?.request){this.emit('unsupported');return;}
  this.wanted=true;if(this.lock||this.status==='pending')return;
  if(!this.visible()){this.emit('suspended');return;}
  const sequence=++this.sequence;this.emit('pending');
  try{const lock=await this.api.request('screen');
   if(sequence!==this.sequence||!this.wanted||!this.visible()){await lock.release();return;}
   this.lock=lock;lock.addEventListener('release',()=>{if(this.lock!==lock)return;this.lock=null;this.emit(this.wanted?(this.visible()?'released':'suspended'):'off');});
   if(lock.released){this.lock=null;this.emit('released');}else this.emit('active');
  }catch{if(sequence===this.sequence)this.emit('failed');}
 }
 async release(keepWanted=false){
  const sequence=++this.sequence;if(!keepWanted)this.wanted=false;
  const lock=this.lock;
  if(lock){try{await lock.release();if(this.lock===lock)this.lock=null;}catch{if(sequence===this.sequence)this.emit('failed');return;}}
  if(sequence!==this.sequence)return;
  this.emit(this.wanted?'suspended':this.api?.request?'off':'unsupported');
  if(keepWanted&&this.wanted&&this.visible())return this.enable();
 }
 visibilityChanged(){if(!this.visible())return this.release(true);if(this.wanted)return this.enable();}
}
