import { chromium } from '@playwright/test';
import http from 'node:http';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const file='renders/reach-hand-communication.mp4';
const size=fs.statSync(file).size;
const server=http.createServer((req,res)=>{
 if(req.url==='/') {res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><body style="margin:0;background:#111"><video controls style="width:100vw;height:100vh" src="/film.mp4"></video></body></html>');return;}
 if(req.url!=='/film.mp4'){res.writeHead(404);res.end();return;}
 const m=req.headers.range?.match(/bytes=(\d+)-(\d*)/),start=m?+m[1]:0,end=m&&m[2]?Math.min(+m[2],size-1):size-1;
 res.writeHead(m?206:200,{'Content-Type':'video/mp4','Content-Length':end-start+1,'Accept-Ranges':'bytes',...(m?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});fs.createReadStream(file,{start,end}).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
 const info=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));
 assert.equal(info.width,1920);assert.equal(info.height,1080);assert.ok(info.duration>=131&&info.duration<132);
 await page.locator('video').evaluate(async v=>{v.muted=true;v.playbackRate=8;await v.play();});
 await page.waitForFunction(()=>document.querySelector('video').ended,{},{timeout:45000});
 assert.deepEqual(errors,[]);
 fs.writeFileSync('renders/browser-verification.json',JSON.stringify({...info,bytes:size,playback:'Reached ended in Microsoft Edge at 8x; audio track separately decoded',errors},null,2));
 console.log('PASS actual MP4 browser playback',info);
}finally{await browser.close();await new Promise(r=>server.close(r));}
