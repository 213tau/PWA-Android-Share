self.addEventListener('fetch', event => {
  if (event.request.method === 'POST' && event.request.url.endsWith('/index.html')) {
    event.respondWith((async () => {
      const formData = await event.request.formData();
      const file = formData.get('file');
      // Save in IndexedDB or Cache
      console.log("Received file:", file);

      // Redirect back to index.html (GET) so app can read saved data
      return Response.redirect('/index.html?share-target');
    })());
  }
});
