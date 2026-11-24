const V='werewolf-judge-v20';
const FILES=['./','./index.html','./manifest.webmanifest','./app.js','./icon-192.png','./icon-512.png',
 ...'seer medium witch hunter idiot guard knight magician merchant dreamer grave witchhunter hybrid villager wolf wolfking demon beauty elder younger gargoyle mechwolf nightmare bloodmoon'.split(' ').map(k=>`./img/${k}.png`)];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('werewolf-judge-')&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // 缓存优先，后台更新
  e.respondWith(caches.open(V).then(c=>c.match(e.request,{ignoreSearch:true})).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));}return r;}).catch(()=>hit);
    return hit||net;
  }));
});
