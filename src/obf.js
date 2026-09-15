import {exactTranslation} from './partner.js';
import {encodeAudioBackup} from './audio-backup.js';
import {validPhrasePhoto} from './phrase-photo.js';
export function boardExportSlots(phrases,language){return phrases.map(p=>p?{phrase:p,text:exactTranslation(p,language)}:null);}
export async function createOBF({phrases,language,columns=3,name,allowMissing=false,recordings=[],imageFor=async()=>null}){
 if(![2,3,4].includes(columns))throw Error('Choose 2, 3 or 4 columns.');
 const slots=boardExportSlots(phrases,language);
 if(slots.some(s=>s&&!s.text)&&!allowMissing)throw Error('Some phrases have no translation in this language.');
 const board={format:'open-board-0.1',id:'reach-board',name,locale:language,buttons:[],images:[],sounds:[],grid:{rows:Math.max(1,Math.ceil(slots.length/columns)),columns,order:[]},ext_reach_export:{version:1,missingPositions:[],note:'User content remains private; no permission to republish is granted. Input settings and calibration are not included.'}};
 const buttonIds=new Map(),imageIds=new Map(),order=[];
 for(let index=0;index<slots.length;index++){
  const slot=slots[index];if(!slot||!slot.text){order.push(null);if(slot)board.ext_reach_export.missingPositions.push(index+1);continue;}
  const p=slot.phrase;let id=buttonIds.get(p.id);
  if(!id){
   id='button-'+buttonIds.size;buttonIds.set(p.id,id);const button={id,label:slot.text,vocalization:slot.text};
   const photo=validPhrasePhoto(p.photo),imageKey=photo||p.icon;
   if(!imageIds.has(imageKey)){const image=photo?{content_type:'image/jpeg',data:photo}:await imageFor(p.icon);if(image){image.id='image-'+imageIds.size;imageIds.set(imageKey,image.id);board.images.push(image);}else imageIds.set(imageKey,null);}
   if(imageIds.get(imageKey))button.image_id=imageIds.get(imageKey);
   const clip=recordings.find(c=>c.phrase===p.id&&c.language===language&&c.text===slot.text);
   if(clip){const {recordings:[audio]}=await encodeAudioBackup([clip]);const sound={id:'sound-'+board.sounds.length,content_type:audio.mimeType,data:`data:${audio.mimeType};base64,${audio.data}`};board.sounds.push(sound);button.sound_id=sound.id;}
   board.buttons.push(button);
  }
  order.push(id);
 }
 while(order.length<board.grid.rows*columns)order.push(null);
 for(let i=0;i<order.length;i+=columns)board.grid.order.push(order.slice(i,i+columns));
 return board;
}
