self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === "/index.html" && event.request.method === "POST") {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const files = formData.getAll("file");

      // Open DB and make sure store exists
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

      // Redirect back to index
      return Response.redirect("/index.html", 303);
    })());
  }
});
