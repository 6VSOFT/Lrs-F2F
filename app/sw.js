const V='werewolf-judge-v24';
const FILES=['./','./index.html','./manifest.webmanifest','./app.js','./icon-192.png','./icon-512.png',
 ...'seer medium witch hunter idiot guard knight magician merchant dreamer grave witchhunter hybrid villager wolf wolfking demon beauty elder younger gargoyle mechwolf nightmare bloodmoon'.split(' ').map(k=>`./img/${k}.png`)];
// 整套文件按版本缓存，带版本参数取文件以绕过 CDN 旧缓存；已有旧版在用时先等待，由页面提示用户更新
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>fetch(new Request(`${f}?v=${V}`,{cache:'reload'})).then(r=>{if(!r.ok)throw Error(f);return c.put(f,r);})))));});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('werewolf-judge-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.open(V).then(c=>c.match(e.request,{ignoreSearch:true})).then(hit=>hit||fetch(e.request)));
});
