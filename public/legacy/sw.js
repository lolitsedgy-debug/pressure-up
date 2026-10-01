self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('everclean-')).map(k=>caches.delete(k))))));
// Business records and appointment availability always come from the server.
