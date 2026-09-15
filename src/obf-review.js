// Review before saving or opening: preserve source data and never fetch external resources.
export const MAX_OBF_BYTES=32*1024*1024;
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
export async function reviewOBF(file){
 if(!file||file.size>MAX_OBF_BYTES)throw Error('Choose an OBF file up to 32 MB.');
 let board;try{board=JSON.parse(await file.text());}catch{throw Error('This is not a readable single-board OBF JSON file. OBZ archives need a separate importer.');}
 if(!object(board)||board.format!=='open-board-0.1')throw Error('Unsupported Open Board Format version.');
 const issues=[],issue=(code,message,button=null)=>issues.push({code,message,button});
 const index=(entries,kind)=>{
  if(!Array.isArray(entries))throw Error(`${kind} must be a list.`);
  const result=new Map();for(const entry of entries){if(!object(entry)||typeof entry.id!=='string'||!entry.id||result.has(entry.id))throw Error(`${kind} contain a missing, duplicate or non-text ID.`);result.set(entry.id,entry);}return result;
 };
 const buttons=index(board.buttons,'Buttons'),images=index(board.images||[],'Images'),sounds=index(board.sounds||[],'Sounds');
 if(buttons.size>1024)throw Error('This board has more than 1024 buttons.');
 const grid=board.grid;if(!object(grid)||!Number.isInteger(grid.rows)||!Number.isInteger(grid.columns)||grid.rows<1||grid.columns<1||grid.rows*grid.columns>1024)throw Error('The board needs a grid of 1 to 1024 positions.');
 if(!Array.isArray(grid.order)||grid.order.length!==grid.rows||grid.order.some(row=>!Array.isArray(row)||row.length!==grid.columns))throw Error('Grid rows and columns do not match its positions.');
 const locale=typeof board.locale==='string'?board.locale:'';
 if(!/^(en|zh|hi|es|ar|th)(-|$)/i.test(locale))issue('language','Choose a supported spoken language before using this board. The original locale is retained.');
 const resources=new Map();
 function media(id,kind,owner){
  if(id===undefined||id===null)return null;
  const key=kind+':'+id;if(resources.has(key))return resources.get(key);
  const entry=(kind==='image'?images:sounds).get(id);
  if(!entry){issue('missing-media',`Missing ${kind} ${String(id)}.`,owner);return null;}
  if(typeof entry.data!=='string'){issue('external-media',`${kind} ${id} is not embedded; Reach has not downloaded it.`,owner);return null;}
  const match=/^data:([^,]+);base64,([A-Za-z0-9+/]*={0,2})$/.exec(entry.data);
  if(!match||match[2].length%4!==0){issue('invalid-media',`${kind} ${id} has invalid embedded data.`,owner);return null;}
  const mime=match[1],base=mime.split(';')[0].toLowerCase();
  if(entry.content_type&&entry.content_type.toLowerCase()!==mime.toLowerCase()){issue('media-type',`${kind} ${id} has conflicting media types.`,owner);return null;}
  if(!(kind==='image'?['image/png','image/jpeg','image/webp']:['audio/wav','audio/x-wav','audio/ogg','audio/webm','audio/mp4']).includes(base)){issue('unsupported-media',`${kind} ${id} uses unsupported type ${base}.`,owner);return null;}
  if(match[2].length>Math.ceil(2*1024*1024/3)*4){issue('media-size',`${kind} ${id} exceeds 2 MB.`,owner);return null;}
  let binary;try{binary=atob(match[2]);}catch{issue('invalid-media',`${kind} ${id} cannot be decoded.`,owner);return null;}
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const ascii=(offset,value)=>value.split('').every((c,i)=>bytes[offset+i]===c.charCodeAt(0));
  const signature=base==='image/png'?bytes[0]===137&&ascii(1,'PNG\r\n\x1a\n'):base==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:base==='image/webp'?ascii(0,'RIFF')&&ascii(8,'WEBP'):base.includes('wav')?ascii(0,'RIFF')&&ascii(8,'WAVE'):base==='audio/ogg'?ascii(0,'OggS'):base==='audio/webm'?bytes[0]===26&&bytes[1]===69&&bytes[2]===223&&bytes[3]===163:ascii(4,'ftyp');
  if(!signature){issue('media-signature',`${kind} ${id} does not match its declared format.`,owner);return null;}
  const resource={id,kind,mime,blob:new Blob([bytes],{type:mime}),original:entry};resources.set(key,resource);return resource;
 }
 const used=new Set(),slots=grid.order.flat().map(id=>{
  if(id===null)return null;
  if(typeof id!=='string'||!buttons.has(id))throw Error('A grid position references a missing or invalid button.');
  const b=buttons.get(id);used.add(id);
  if(typeof b.label!=='string')issue('label','A button has no text label.',id);
  if(b.vocalization!==undefined&&typeof b.vocalization!=='string')issue('vocalization','A button has an invalid spoken message.',id);
  if((typeof b.label==='string'&&b.label.length>5000)||(typeof b.vocalization==='string'&&b.vocalization.length>5000))issue('text-size','This button has more than 5000 characters. Its text has not been truncated.',id);
  if(b.action!==undefined||b.actions!==undefined||b.load_board!==undefined)issue('unsupported-action','This button has actions or board navigation that must not be replaced with plain speech.',id);
  if(Object.keys(b).some(key=>key.startsWith('ext_')))issue('button-extension','This button has app-specific extensions that need review.',id);
  return {id,label:typeof b.label==='string'?b.label:'',speech:typeof b.vocalization==='string'?b.vocalization:typeof b.label==='string'?b.label:'',image:media(b.image_id,'image',id),sound:media(b.sound_id,'sound',id),original:b};
 });
 return {original:board,source:file,name:typeof board.name==='string'?board.name:'Untitled board',locale,rows:grid.rows,columns:grid.columns,slots,resources:[...resources.values()],issues,ready:issues.length===0,unplacedButtons:[...buttons.keys()].filter(id=>!used.has(id))};
}
