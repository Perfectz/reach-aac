import fs from 'node:fs';
const meta=JSON.parse(fs.readFileSync('audio_meta.json','utf8'));
// Correct recognizer spelling against the locked script; retain measured timings.
for(const voice of meta.voices){
 for(const word of voice.words){
  if(voice.frame===3&&word.text==='arrest')word.text='a rest';
  if(voice.frame===4&&word.text==='reaches')word.text="Reach's";
  if(voice.frame===5&&word.text==='PCI')word.text='PCEye';
  if(voice.frame===5&&word.text==='-5')word.text='5';
  if(voice.frame===6&&word.text==='reach,')word.text='Reach,';
 }
 const joinPair=(a,b,text)=>{const i=voice.words.findIndex((w,n)=>w.text===a&&voice.words[n+1]?.text===b);if(i>=0)voice.words.splice(i,2,{...voice.words[i],end:voice.words[i+1].end,text});};
 if(voice.frame===4)joinPair('Non','-mouse','NonMouse');
 if(voice.frame===5)joinPair('2',',365','2,365');
 if(voice.frame===6)joinPair('Real','-world','Real-world');
}
fs.writeFileSync('audio_meta.json',JSON.stringify(meta,null,2));
let html=fs.readFileSync('index.html','utf8');
for(const v of meta.voices)html=html.replace(new RegExp(`(<audio[^>]*src="${v.path}"[^>]*data-duration=")[^"]+`),`$1${v.duration_s}`);
fs.writeFileSync('index.html',html);
if(fs.existsSync('caption_groups.json')){
 const groups=JSON.parse(fs.readFileSync('caption_groups.json','utf8')).groups;
 const stamp=t=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;};
 fs.writeFileSync('reach-captions.srt',groups.map((g,i)=>`${i+1}\n${stamp(g.start)} --> ${stamp(g.end)}\n${g.text}\n`).join('\n'));
}
console.log('Corrected ASR proper nouns, exact audio windows, and exported subtitles.');
