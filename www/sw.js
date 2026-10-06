var CACHE_NAME = "lifeline-shell-v1";
var SHELL = ["./", "./index.html", "./manifest.webmanifest"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(c){
      return c.addAll(SHELL);
    }).then(function(){
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE_NAME){ return caches.delete(k); }
        return Promise.resolve();
      }));
    }).then(function(){
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET"){ return; }
  e.respondWith(
    fetch(e.request).then(function(resp){
      var copy = resp.clone();
      caches.open(CACHE_NAME).then(function(c){
        c.put(e.request, copy);
      });
      return resp;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){
        return hit || caches.match("./index.html");
      });
    })
  );
});
