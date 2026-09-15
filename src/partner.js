import {translations} from './languages.js';
export function exactTranslation(p,language){
 if(p.translations?.[language])return p.translations[language];
 if(translations[language]?.[p.id])return translations[language][p.id];
 if(language==='en'&&p.sourceLanguage&&p.sourceLanguage!=='en')return null;
 return p[language]||null;
}
export function partnerLanguage(settings){return settings.partnerLanguage==='none'?null:!settings.partnerLanguage||settings.partnerLanguage==='auto'?(settings.language==='en'?'th':'en'):settings.partnerLanguage;}
const codes=['en','zh','hi','es','ar','th'];
const labels={
 settings:['Display & spoken languages','显示与朗读语言','दिखाने और बोलने की भाषाएँ','Idiomas de pantalla y voz','لغات العرض والكلام','ภาษาที่แสดงและพูด'],
 partner:['Partner display language','对方显示语言','साथी के लिए भाषा','Idioma para tu interlocutor','لغة العرض لشريك التواصل','ภาษาที่แสดงให้คู่สนทนา'],
 speech:['Spoken language','朗读语言','बोलने की भाषा','Idioma hablado','لغة الكلام','ภาษาที่พูด'],
 board:['Use board language','使用沟通板语言','बोर्ड की भाषा इस्तेमाल करें','Usar idioma del tablero','استخدام لغة اللوحة','ใช้ภาษาของกระดาน'],
 none:['No second language','不显示第二语言','दूसरी भाषा नहीं','Sin segundo idioma','دون لغة ثانية','ไม่แสดงภาษาที่สอง'],
 view:['Show my partner','显示给对方','साथी को दिखाएँ','Mostrar a mi interlocutor','عرض لشريك التواصل','แสดงให้คู่สนทนา'],
 speak:['Speak partner language','朗读对方语言','साथी की भाषा में बोलें','Hablar en su idioma','التحدث بلغة الشريك','พูดภาษาของคู่สนทนา'],
 missing:['Translation not provided','未提供翻译','अनुवाद उपलब्ध नहीं','Traducción no disponible','الترجمة غير متوفرة','ไม่มีคำแปล'],
 hint:['Choose the language you read, the language your partner sees, and the language spoken. Only provided translations are used. Your input settings and phrase positions stay the same.','选择您阅读、对方看到和朗读的语言。仅使用已有翻译。输入设置和短语位置保持不变。','अपनी पढ़ने की, साथी को दिखने की और बोलने की भाषा चुनें। केवल उपलब्ध अनुवाद उपयोग होते हैं। इनपुट और वाक्यों के स्थान नहीं बदलते।','Elige el idioma que lees, el que ve tu interlocutor y el hablado. Solo se usan traducciones disponibles. Tu entrada y las posiciones no cambian.','اختر لغة القراءة والعرض لشريكك والكلام. تُستخدم الترجمات المتوفرة فقط. لا تتغير إعدادات الإدخال ومواضع العبارات.','เลือกภาษาที่คุณอ่าน คู่สนทนาเห็น และภาษาที่พูด ใช้เฉพาะคำแปลที่มีอยู่ การตั้งค่าการเลือกและตำแหน่งข้อความไม่เปลี่ยน'],
};
export const partnerText=(key,lang)=>labels[key]?.[codes.indexOf(lang)]||labels[key]?.[0]||key;
