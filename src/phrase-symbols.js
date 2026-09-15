const languages=['en','zh','hi','es','ar','th'];
export const phraseSymbols={
 MessageCircle:['Message','消息','संदेश','Mensaje','رسالة','ข้อความ'],
 Users:['People','人们','लोग','Personas','أشخاص','ผู้คน'],
 Heart:['Love','爱','प्यार','Amor','حب','ความรัก'],
 Bed:['Rest','休息','आराम','Descanso','راحة','พักผ่อน'],
 Droplets:['Water','水','पानी','Agua','ماء','น้ำ'],
 Utensils:['Food','食物','भोजन','Comida','طعام','อาหาร'],
 Bath:['Bath','洗澡','नहाना','Baño','استحمام','อาบน้ำ'],
 HeartPulse:['Health','健康','स्वास्थ्य','Salud','صحة','สุขภาพ'],
 Sun:['Day','白天','दिन','Día','نهار','กลางวัน'],
 Moon:['Night','夜晚','रात','Noche','ليل','กลางคืน'],
 Smile:['Happy','开心','खुश','Feliz','سعيد','มีความสุข'],
 Coffee:['Drink','饮品','पेय','Bebida','مشروب','เครื่องดื่ม']
};
const labels={title:['Choose a symbol','选择符号','चिह्न चुनें','Elegir símbolo','اختيار رمز','เลือกสัญลักษณ์'],back:['Back','返回','वापस','Volver','رجوع','กลับ'],next:['Next','下一页','अगला','Siguiente','التالي','ถัดไป'],cancel:['Cancel','取消','रद्द करें','Cancelar','إلغاء','ยกเลิก']};
export const validPhraseSymbol=value=>Object.hasOwn(phraseSymbols,value)?value:'MessageCircle';
export const symbolText=(key,language)=> (phraseSymbols[key]||labels[key])[Math.max(0,languages.indexOf(language))];
function svg(definition){const [tag,attributes,children=[]]=definition,node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);for(const child of children)node.append(svg(child));return node;}
export function mountSymbolPicker(root,{icons,language,current,onChoose,onClose,onTransition}){
 let page=Math.floor(Object.keys(phraseSymbols).indexOf(validPhraseSymbol(current))/4);
 const button=(id,label,fn)=>{const b=document.createElement('button');b.id=id;b.type='button';b.className='secondary-button';b.dataset.access='';b.textContent=label;b.onclick=()=>{onTransition(b);fn();};return b;};
 function render(){root.replaceChildren();const title=document.createElement('p');title.textContent=symbolText('title',language);root.append(title);const grid=document.createElement('div');grid.className='symbol-grid';root.append(grid);
  for(const key of Object.keys(phraseSymbols).slice(page*4,page*4+4)){const b=button('phrase-symbol-'+key,symbolText(key,language),()=>onChoose(key));b.setAttribute('aria-pressed',String(current===key));if(icons[key]){const image=svg(icons[key]);image.setAttribute('aria-hidden','true');b.prepend(image);}grid.append(b);}
  const nav=document.createElement('div');nav.className='compose-actions';const back=button('symbol-previous',symbolText('back',language),()=>{page--;render();}),next=button('symbol-next',symbolText('next',language),()=>{page++;render();});back.disabled=page===0;next.disabled=page===2;nav.append(back,next,button('symbol-cancel',symbolText('cancel',language),onClose));root.append(nav);
 }render();
}
