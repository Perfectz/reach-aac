import {reviewOBF} from './obf-review.js';
const MAX_BOARDS=20,MAX_TOTAL_BYTES=64*1024*1024;
const request=req=>new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
const completed=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Board storage transaction cancelled.'));});
const metadata=({source,...entry})=>entry;
function owner(person){if(typeof person!=='string'||!person||person.length>128)throw Error('Choose a valid person before opening boards.');}
export class BoardLibrary{
 async db(){
  if(!this.opening){const pending=new Promise((resolve,reject)=>{
   const r=indexedDB.open('reach-boards',1);let rejected=false;
   r.onupgradeneeded=()=>{const store=r.result.createObjectStore('boards',{keyPath:'id'});store.createIndex('person','person');};
   r.onsuccess=()=>{const db=r.result;if(rejected){db.close();return;}db.onversionchange=()=>{db.close();if(this.opening===pending)this.opening=null;};resolve(db);};
   r.onerror=()=>reject(r.error);
   r.onblocked=()=>{rejected=true;reject(Error('Close other Reach tabs before updating board storage.'));};
  });this.opening=pending;pending.catch(()=>{if(this.opening===pending)this.opening=null;});}return this.opening;
 }
 async list(person){owner(person);const db=await this.db();return (await request(db.transaction('boards').objectStore('boards').index('person').getAll(person))).map(metadata);}
 async get(person,id){owner(person);const db=await this.db(),entry=await request(db.transaction('boards').objectStore('boards').get(id));if(!entry||entry.person!==person)throw Error('This board is not available for the selected person.');return entry;}
 async open(person,id){const entry=await this.get(person,id);return {entry,review:await reviewOBF(entry.source)};}
 async save(person,source,{isCurrent=()=>true}={}){
  owner(person);const review=await reviewOBF(source);
  if(!review.ready)throw Error('Resolve the board review issues before saving.');
  if(!isCurrent())throw Error('The selected person changed. Reopen the import.');
  const db=await this.db(),tx=db.transaction('boards','readwrite'),done=completed(tx);done.catch(()=>{});
  try{
   const store=tx.objectStore('boards'),existing=await request(store.index('person').getAll(person));
   if(!isCurrent())throw Error('The selected person changed. Reopen the import.');
   if(existing.length>=MAX_BOARDS||existing.reduce((n,b)=>n+b.bytes,0)+source.size>MAX_TOTAL_BYTES)throw Error('This person can store up to 20 boards or 64 MB. Export and remove an unused board first.');
   const entry={id:crypto.randomUUID(),person,name:review.name,locale:review.locale,rows:review.rows,columns:review.columns,bytes:source.size,created:Date.now(),source};
   store.add(entry);await done;return metadata(entry);
  }catch(error){try{tx.abort();}catch{}await done.catch(()=>{});throw error;}
 }
 async remove(person,id){owner(person);const db=await this.db(),tx=db.transaction('boards','readwrite'),done=completed(tx);done.catch(()=>{});
  try{const store=tx.objectStore('boards'),entry=await request(store.get(id));if(!entry||entry.person!==person)throw Error('This board is not available for the selected person.');store.delete(id);await done;}catch(error){try{tx.abort();}catch{}await done.catch(()=>{});throw error;}
 }
 async removePerson(person){owner(person);const db=await this.db(),tx=db.transaction('boards','readwrite'),done=completed(tx);done.catch(()=>{});
  try{const store=tx.objectStore('boards'),keys=await request(store.index('person').getAllKeys(person));for(const key of keys)store.delete(key);await done;}catch(error){try{tx.abort();}catch{}await done.catch(()=>{});throw error;}
 }
}
