const CACHE_NAME = "pwa-fs-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Don’t let a single failure hang install
      await Promise.allSettled(
        FILES_TO_CACHE.map(f =>
          cache.add(f).catch(err => console.warn("Skip caching:", f, err))
        )
      );
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Catch share-target POST
  if (url.pathname === "/index.html" && event.request.method === "POST") {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const files = formData.getAll("file");

        // Save files into IndexedDB
        const dbReq = indexedDB.open("shared-files", 2);
        dbReq.onupgradeneeded = () => {
          const db = dbReq.result;
          if (!db.objectStoreNames.contains("files")) {
            db.createObjectStore("files", { autoIncrement: true });
          }
        };
        dbReq.onsuccess = () => {
          const db = dbReq.result;
          const tx = db.transaction("files", "readwrite");
          const store = tx.objectStore("files");
          files.forEach((file) => store.add({ name: file.name, type: file.type, blob: file }));
        };

        // Redirect back to main page after handling
        return Response.redirect("/index.html", 303);
      })()
    );
  }
});



