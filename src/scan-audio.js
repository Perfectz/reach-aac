const languages=['en','zh','hi','es','ar','th'];
const labels={
 tryVoice:['Try preview voice','试听预览语音','संकेत की आवाज़ आज़माएँ','Probar voz de los avisos','تجربة صوت المطالبات','ลองเสียงตัวเลือก'],
 stopPreview:['Stop preview','停止预览','संकेत रोकें','Detener aviso','إيقاف المطالبة','หยุดเสียงตัวเลือก'],
 sample:['This is a scan preview.','这是扫描预览。','यह स्कैन का संकेत है।','Este es un aviso del barrido.','هذه مطالبة للمسح.','นี่คือเสียงตัวเลือกสแกน'],
 idle:['Scan audio waiting','扫描语音等待中','स्कैन आवाज़ प्रतीक्षा में','Audio de barrido en espera','صوت المسح في الانتظار','เสียงสแกนกำลังรอ'],
 playing:['Reading a scan option','正在朗读扫描选项','स्कैन विकल्प पढ़ा जा रहा है','Leyendo una opción del barrido','جارٍ قراءة خيار المسح','กำลังอ่านตัวเลือกสแกน'],
 busy:['Scan audio waits for the message to finish','扫描语音等待消息播放完毕','स्कैन आवाज़ संदेश पूरा होने की प्रतीक्षा कर रही है','El audio de barrido espera a que termine el mensaje','ينتظر صوت المسح انتهاء الرسالة','เสียงสแกนรอให้ข้อความเล่นจบ'],
 failed:['Scan preview could not play','无法播放扫描预览','स्कैन संकेत नहीं चल सका','No se pudo reproducir el aviso','تعذّر تشغيل مطالبة المسح','ไม่สามารถเล่นเสียงตัวเลือกสแกน'],
 timeout:['Scan preview stopped at its time limit','扫描预览已达到时限并停止','स्कैन संकेत समय सीमा पर रुक गया','El aviso alcanzó su límite de tiempo','توقفت مطالبة المسح عند الحد الزمني','เสียงตัวเลือกสแกนหยุดเมื่อครบเวลาที่กำหนด'],
 title:['Speak scan previews','朗读扫描预览','स्कैन के विकल्प सुनाएँ','Leer opciones del barrido','نطق خيارات المسح','อ่านตัวเลือกขณะสแกน'],
 note:['Prompts start with “Option” and do not send a message. The scan waits for the prompt, then gives you the configured selection time. You can select while listening. Prompts stop after 20 seconds if necessary. Use headphones if possible. An offline voice is required.','提示以“选项”开头，不会发送消息。扫描等待提示结束后，再留出设定的选择时间。聆听时也可选择。必要时提示将在 20 秒后停止。尽量使用耳机。需要离线语音。','संकेत “विकल्प” से शुरू होते हैं और संदेश नहीं भेजते। संकेत के बाद चुनने का तय समय मिलता है। सुनते समय भी चुन सकते हैं। ज़रूरत पड़ने पर संकेत 20 सेकंड बाद रुकता है। संभव हो तो हेडफ़ोन इस्तेमाल करें। ऑफ़लाइन आवाज़ ज़रूरी है।','Los avisos empiezan con “Opción” y no envían mensajes. El barrido espera al aviso y después da el tiempo configurado para elegir. Puedes elegir mientras escuchas. Los avisos se detienen a los 20 segundos si es necesario. Usa auriculares si puedes. Se requiere una voz sin conexión.','تبدأ المطالبات بكلمة «خيار» ولا ترسل رسالة. ينتظر المسح انتهاء المطالبة ثم يمنحك وقت الاختيار المحدد. يمكنك الاختيار أثناء الاستماع. تتوقف المطالبات بعد 20 ثانية عند الحاجة. استخدم سماعات إن أمكن. يلزم صوت محلي.','เสียงเริ่มด้วยคำว่า “ตัวเลือก” และไม่ส่งข้อความ การสแกนจะรอให้เสียงจบก่อนให้เวลาเลือกตามที่ตั้งไว้ คุณเลือกขณะฟังได้ เสียงจะหยุดหลัง 20 วินาทีหากจำเป็น ใช้หูฟังหากทำได้ ต้องมีเสียงออฟไลน์'], option:['Option','选项','विकल्प','Opción','خيار','ตัวเลือก'],
 unavailable:['No matching offline voice for this preview.','此预览没有对应的离线语音。','इस विकल्प के लिए उपयुक्त ऑफ़लाइन आवाज़ नहीं है।','No hay una voz sin conexión para esta opción.','لا يوجد صوت محلي مناسب لهذا الخيار.','ไม่มีเสียงออฟไลน์ที่ตรงกับตัวเลือกนี้']
};
export const scanAudioText=(key,language)=>labels[key][Math.max(0,languages.indexOf(language))];
export class ScanAudio{
 constructor(synth,Utterance){this.synth=synth;this.Utterance=Utterance;this.current=null;this.started=0;this.status='idle';}
 holdsScan(now){
  if(!this.current)return false;
  if(now-this.started>=20000){this.stop();this.status='timeout';return false;}
  return true;
 }
 stop(){this.status='idle';if(this.current){this.current=null;this.synth?.cancel();}}
 preview(text,language,now=performance.now(),rate=.95){
  this.stop();
  if(!text?.trim())return false;
  if(this.synth?.speaking||this.synth?.pending){this.status='busy';return false;}
  const voice=this.synth?.getVoices().find(v=>v.localService&&v.lang.toLowerCase().split('-')[0]===language);
  if(!voice||!this.Utterance){this.status='unavailable';return false;}
  const utterance=new this.Utterance(`${scanAudioText('option',language)}: ${text}`);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=Number.isFinite(rate)?Math.max(.5,Math.min(1.5,rate)):.95;
  this.started=now;this.status='playing';this.current=utterance;const finish=status=>{if(this.current===utterance){this.current=null;this.status=status;}};utterance.onend=()=>finish('idle');utterance.onerror=()=>finish('failed');
  try{this.synth.speak(utterance);return true;}catch{finish('failed');return false;}
 }
}

