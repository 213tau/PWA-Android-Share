const CACHE_NAME = "pwa-fs-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install & cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Handle file share POST
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === "/index.html" && event.request.method === "POST") {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const files = formData.getAll("file");

      const dbReq = indexedDB.open("shared-files", 1);
      dbReq.onupgradeneeded = () => {
        dbReq.result.createObjectStore("files", { autoIncrement: true });
      };
      dbReq.onsuccess = () => {
        const db = dbReq.result;
        const tx = db.transaction("files", "readwrite");
        const store = tx.objectStore("files");
        files.forEach(file => store.add(file));
      };

      return Response.redirect("/index.html", 303);
    })());
  }
});
