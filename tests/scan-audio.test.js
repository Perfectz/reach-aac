import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ScanAudio} from '../src/scan-audio.js';
import {validateSettings} from '../src/access.js';
test('preview speed survives settings validation and is bounded independently of scan timing',()=>{
 const settings=validateSettings({scanAudioRate:.65,scan:2000});assert.equal(settings.scanAudioRate,.65);assert.equal(settings.scan,2000);
 assert.equal(validateSettings({scanAudioRate:'fast'}).scanAudioRate,.95);assert.equal(validateSettings({scanAudioRate:50}).scanAudioRate,1.5);
 const synth={getVoices:()=>[{lang:'en',localService:true}],speak(){},cancel(){}};
 const audio=new ScanAudio(synth,function(text){this.text=text;});audio.preview('Yes','en',0,settings.scanAudioRate);assert.equal(audio.current.rate,.65);audio.preview('No','en',0,NaN);assert.equal(audio.current.rate,.95);
});
test('scan prompts own only their output and never replace committed speech',()=>{
 const calls=[],synth={speaking:false,pending:false,getVoices:()=>[{lang:'en-US',localService:true}],speak:u=>calls.push(u),cancel:()=>calls.push('cancel')};
 const audio=new ScanAudio(synth,function(text){this.text=text;});
 assert.equal(audio.preview('Yes','en'),true);assert.equal(calls[0].text,'Option: Yes');
 audio.preview('No','en');assert.equal(calls[1],'cancel');assert.equal(calls[2].text,'Option: No');calls[0].onend();assert.equal(audio.current,calls[2]);
 calls[2].onend();synth.speaking=true;assert.equal(audio.preview('Water','en'),false);audio.stop();assert.equal(calls.length,3);
 assert.equal(audio.status,'idle');synth.speaking=true;audio.preview('Busy','en');assert.equal(audio.status,'busy');
 synth.speaking=false;assert.equal(audio.preview('水','zh'),false);assert.equal(audio.status,'unavailable');assert.equal(calls.length,3);
});
test('scan audio stays opt-in and rejects non-boolean backup settings',()=>{
 assert.equal(validateSettings({}).scanAudio,false);assert.equal(validateSettings({scanAudio:'true'}).scanAudio,false);assert.equal(validateSettings({scanAudio:true}).scanAudio,true);
});
test('preview holds scanning until completion, with a bounded stalled-voice escape',()=>{
 const synth={getVoices:()=>[{lang:'en',localService:true}],speak(){},cancel(){this.cancelled=true;}};
 const audio=new ScanAudio(synth,function(text){this.text=text;});audio.preview('Long choice','en',100);
 assert.equal(audio.holdsScan(3000),true);audio.current.onend();assert.equal(audio.holdsScan(3100),false);
 audio.preview('Stalled choice','en',4000);assert.equal(audio.holdsScan(23999),true);assert.equal(audio.holdsScan(24000),false);assert.equal(synth.cancelled,true);assert.equal(audio.current,null);assert.equal(audio.status,'timeout');
});
