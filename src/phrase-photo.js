export const MAX_PHOTO_LENGTH=16000;
export function validPhrasePhoto(value){return typeof value==='string'&&value.length<=MAX_PHOTO_LENGTH&&/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(value)?value:null;}
export async function preparePhrasePhoto(file){
 if(!file||file.size>10*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Choose a JPEG, PNG or WebP photo up to 10 MB.');
 const image=await createImageBitmap(file);
 try{
  if(!image.width||!image.height||image.width*image.height>16000000)throw Error('Choose a photo smaller than 16 megapixels.');
  for(const size of [256,192,128]){
   const scale=Math.min(1,size/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
   for(const quality of [.85,.65,.45]){const data=canvas.toDataURL('image/jpeg',quality);if(validPhrasePhoto(data))return data;}
  }
  throw Error('This photo is too detailed to store. Try a simpler or cropped photo.');
 }finally{image.close();}
}
const langs=['en','zh','hi','es','ar','th'];
const labels={choose:['Choose a photo','选择照片','फ़ोटो चुनें','Elegir foto','اختيار صورة','เลือกรูปภาพ'],remove:['Remove photo','移除照片','फ़ोटो हटाएँ','Quitar foto','إزالة الصورة','นำรูปภาพออก'],note:['A small copy stays on this device and is included in setup backups. Save the phrase to keep it.','小尺寸副本保存在此设备并包含在设置备份中。保存短语后生效。','छोटी प्रति इस उपकरण पर रहती है और सेटअप बैकअप में शामिल होती है। इसे रखने के लिए वाक्य सहेजें।','Una copia pequeña queda en este dispositivo y se incluye en las copias de configuración. Guarda la frase para conservarla.','تبقى نسخة صغيرة على هذا الجهاز وتُضمّن في نسخ الإعدادات. احفظ العبارة للاحتفاظ بها.','สำเนาขนาดเล็กเก็บในอุปกรณ์นี้และรวมในไฟล์สำรองการตั้งค่า บันทึกข้อความเพื่อเก็บรูปไว้'],working:['Preparing photo…','正在处理照片…','फ़ोटो तैयार हो रही है…','Preparando foto…','جارٍ تجهيز الصورة…','กำลังเตรียมรูปภาพ…'],failed:['Photo could not be added. Try a smaller JPEG, PNG or WebP image.','无法添加照片。请尝试较小的 JPEG、PNG 或 WebP 图片。','फ़ोटो नहीं जोड़ी जा सकी। छोटी JPEG, PNG या WebP फ़ोटो आज़माएँ।','No se pudo añadir la foto. Prueba una imagen JPEG, PNG o WebP más pequeña.','تعذّرت إضافة الصورة. جرّب صورة JPEG أو PNG أو WebP أصغر.','เพิ่มรูปไม่ได้ ลองรูป JPEG, PNG หรือ WebP ที่เล็กกว่า']};
labels.cancel=['Cancel photo processing','取消照片处理','फ़ोटो की प्रक्रिया रद्द करें','Cancelar procesamiento de foto','إلغاء تجهيز الصورة','ยกเลิกการประมวลผลรูปภาพ'];
export const photoText=(key,language)=>labels[key][Math.max(0,langs.indexOf(language))];
