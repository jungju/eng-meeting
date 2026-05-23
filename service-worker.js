self.addEventListener("install",e=>{self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(self.clients.claim())});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(u.pathname.match(/^\/assets\/(?:sentence|sentencemd|dialogue)\/.*\.mp3$/)){
    e.respondWith(caches.open("audio").then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}))));
  }
});