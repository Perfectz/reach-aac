import {validateSettings,defaults} from './access.js';
export const PROFILE_KEY='reach-profiles-v1';
export const MAX_PROFILES=12;
const languages=['en','zh','hi','es','ar','th'];
const copy=value=>JSON.parse(JSON.stringify(value));
const cleanName=value=>typeof value==='string'?Array.from(value.trim()).slice(0,60).join(''):'';
export function cleanDraft(value){return {language:languages.includes(value?.language)?value.language:'en',text:typeof value?.text==='string'?Array.from(value.text).slice(0,500).join(''):''};}
export class ProfileStore{
 constructor(storage){this.storage=storage;const raw=storage.getItem(PROFILE_KEY);this.expected=raw;
  if(raw){const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.people)||!data.people.length||data.people.length>MAX_PROFILES)throw Error('Profile storage is invalid.');const ids=new Set();data.people=data.people.map(p=>{if(!p||typeof p.id!=='string'||ids.has(p.id)||!cleanName(p.name))throw Error('Profile storage is invalid.');ids.add(p.id);return {id:p.id,name:cleanName(p.name),settings:validateSettings(p.settings),draft:cleanDraft(p.draft)};});if(!ids.has(data.activeId))throw Error('Active profile is missing.');this.data=data;
  }else{const saved=storage.getItem('reach-settings'),draft=storage.getItem('reach-draft');this.data={version:1,activeId:'original',people:[{id:'original',name:'My profile',settings:validateSettings(saved?JSON.parse(saved):defaults),draft:cleanDraft(draft?JSON.parse(draft):null)}]};}
 }
 get active(){return copy(this.data.people.find(p=>p.id===this.data.activeId));}
 get people(){return this.data.people.map(({id,name})=>({id,name}));}
 commit(next){if(this.storage.getItem(PROFILE_KEY)!==this.expected)throw Error('Profiles changed in another tab. Reload Reach before editing.');const encoded=JSON.stringify(next);this.storage.setItem(PROFILE_KEY,encoded);this.expected=encoded;this.data=next;
  // Legacy keys are compatibility mirrors. The single registry write above is authoritative.
  try{this.storage.setItem('reach-settings',JSON.stringify(this.active.settings));this.storage.setItem('reach-draft',JSON.stringify(this.active.draft));}catch{}
 }
 save(settings,draft){const next=copy(this.data),p=next.people.find(p=>p.id===next.activeId);p.settings=validateSettings(settings);p.draft=cleanDraft(draft);this.commit(next);}
 create(name,id){name=cleanName(name);if(!name)throw Error('Enter a profile name.');if(this.data.people.length>=MAX_PROFILES)throw Error('The device has 12 profiles. Export and remove an unused profile first.');if(this.data.people.some(p=>p.id===id)||!id)throw Error('Invalid profile ID.');const next=copy(this.data);next.people.push({id,name,settings:validateSettings(defaults),draft:cleanDraft(null)});next.activeId=id;this.commit(next);}
 activate(id){if(!this.data.people.some(p=>p.id===id))throw Error('Profile not found.');const next=copy(this.data);next.activeId=id;this.commit(next);}
 rename(name){name=cleanName(name);if(!name)throw Error('Enter a profile name.');const next=copy(this.data);next.people.find(p=>p.id===next.activeId).name=name;this.commit(next);}
 remove(id){if(id===this.data.activeId)throw Error('Switch to another profile before removing this one.');if(!this.data.people.some(p=>p.id===id))throw Error('Profile not found.');const next=copy(this.data);next.people=next.people.filter(p=>p.id!==id);this.commit(next);}
}
const labels={
 title:['People on this device','此设备上的使用者','इस डिवाइस के लोग','Personas en este dispositivo','الأشخاص على هذا الجهاز','ผู้ใช้ในอุปกรณ์นี้'],
 intro:['Each person has their own phrases, languages, draft and handover card. Switching stops speech and camera input. These profiles are not password protected.','每个人都有独立的短语、语言、草稿和交接卡。切换会停止语音和摄像头输入。这些档案没有密码保护。','हर व्यक्ति के अपने वाक्य, भाषाएँ, मसौदे और जानकारी कार्ड हैं। बदलने पर आवाज़ और कैमरा बंद हो जाते हैं। प्रोफ़ाइल पासवर्ड से सुरक्षित नहीं हैं।','Cada persona tiene sus frases, idiomas, borrador y tarjeta. Al cambiar se detienen la voz y la cámara. Los perfiles no tienen contraseña.','لكل شخص عباراته ولغاته ومسودته وبطاقته. يؤدي التبديل إلى إيقاف الصوت والكاميرا. الملفات غير محمية بكلمة مرور.','แต่ละคนมีข้อความ ภาษา ร่าง และบัตรข้อมูลของตนเอง การเปลี่ยนผู้ใช้จะหยุดเสียงและกล้อง โปรไฟล์ไม่มีรหัสผ่าน'],
 current:['Current person','当前使用者','वर्तमान व्यक्ति','Persona actual','الشخص الحالي','ผู้ใช้ปัจจุบัน'],
 name:['Profile name','档案名称','प्रोफ़ाइल का नाम','Nombre del perfil','اسم الملف','ชื่อโปรไฟล์'],
 create:['Add a new person','添加新使用者','नया व्यक्ति जोड़ें','Añadir persona','إضافة شخص','เพิ่มผู้ใช้ใหม่'],
 rename:['Rename current profile','重命名当前档案','वर्तमान प्रोफ़ाइल का नाम बदलें','Renombrar perfil actual','إعادة تسمية الملف الحالي','เปลี่ยนชื่อโปรไฟล์ปัจจุบัน'],
 remove:['Remove profile','删除档案','प्रोफ़ाइल हटाएँ','Eliminar perfil','حذف الملف','ลบโปรไฟล์'],
 warning:['This removes this person’s saved phrases, settings, handover card and draft from this browser. Export their setup first if you need a copy.','这将从此浏览器删除此人的短语、设置、交接卡和草稿。如需副本，请先导出其设置。','इससे इस व्यक्ति के वाक्य, सेटिंग, जानकारी कार्ड और मसौदा इस ब्राउज़र से हटेंगे। प्रति चाहिए तो पहले उनका सेटअप निर्यात करें।','Se eliminarán de este navegador sus frases, ajustes, tarjeta y borrador. Exporta su configuración antes si necesitas una copia.','سيحذف ذلك عبارات هذا الشخص وإعداداته وبطاقته ومسودته من هذا المتصفح. صدّر إعداداته أولاً إذا احتجت نسخة.','จะลบข้อความ การตั้งค่า บัตรข้อมูล และร่างของผู้ใช้นี้จากเบราว์เซอร์ หากต้องการสำเนา ให้ส่งออกการตั้งค่าก่อน'],
 cancel:['Cancel','取消','रद्द करें','Cancelar','إلغاء','ยกเลิก'],
 done:['Done','完成','हो गया','Listo','تم','เสร็จ'],
};
export const profileText=(key,lang='en')=>labels[key]?.[languages.indexOf(lang)]||labels[key]?.[0]||key;
