self.addEventListener("fetch", event => {
  if (event.request.method === "POST" &&
      new URL(event.request.url).pathname === "/") {
    event.respondWith(handleShare(event.request));
  }
});

async function handleShare(request) {
  const form = await request.formData();
  const files = form.getAll("images");

  const cache = await caches.open("shared-images");

  await cache.put("/__shared__", new Response(files[0]));

  return Response.redirect("/", 303);
}
