import {readdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else out.push('/'+p.replaceAll('\\','/').replace(/^dist\//,''));}return out;}
const files=(await walk('dist')).filter(p=>!['/sw.js','/offline-manifest.json'].includes(p));
const records=await Promise.all(files.map(async url=>{const bytes=await readFile('dist'+url);return {url,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}));
const board=records.filter(a=>!a.url.startsWith('/tracking/')),tracking=records.filter(a=>a.url.startsWith('/tracking/'));
const revision=list=>createHash('sha256').update(JSON.stringify(list)).digest('hex').slice(0,12);
const boardCache='reach-board-'+revision(board),trackingCache='reach-camera-'+revision(tracking);
await writeFile('dist/offline-manifest.json',JSON.stringify({version:1,boardCache,trackingCache,board,tracking}));
const assets=[...board.map(a=>a.url),'/offline-manifest.json'];
await writeFile('dist/sw.js',`const CACHE=${JSON.stringify(boardCache)},TRACKING=${JSON.stringify(trackingCache)};
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(ASSETS);await c.put('/',await c.match('/index.html'));await c.put('/offline-ready',new Response('ready'));self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{await self.clients.claim();for(const key of await caches.keys())if(key.startsWith('reach-')&&key!==CACHE&&key!==TRACKING)await caches.delete(key);for(const client of await self.clients.matchAll())client.postMessage('offline-ready');})()));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith((async()=>{const pathname=new URL(event.request.url).pathname,c=await caches.open(pathname.startsWith('/tracking/')?TRACKING:CACHE);if(event.request.mode==='navigate'){try{const response=await fetch(event.request,{cache:'no-store'});if(response.ok)return response;}catch{}return await c.match('/index.html');}const cached=await c.match(event.request,{ignoreVary:true});if(cached&&event.request.cache!=='reload')return cached;const response=await fetch(event.request);if(response.ok&&pathname.startsWith('/tracking/'))await c.put(event.request,response.clone());return response;})());});
`);
console.log('Offline board: '+assets.length+' files. Camera downloads survive app-only updates.');

