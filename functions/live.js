export async function onRequest({ request }) {
  const u = new URL(request.url);
  const userId = String(u.searchParams.get("user_id") || "").replace(/[^\d]/g, "");
  if (!userId) return j({ ok:false, reason:"missing_user_id" }, 400);

  const target = `https://www.mirrativ.com/user/${userId}`;

  try {
    const res = await fetch(target, {
      redirect: "manual",
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cf: { cacheTtl: 0, cacheEverything: false },
    });

    const status = res.status;
    const location = res.headers.get("location") || res.headers.get("Location") || null;

    // 先頭ちょいだけ読んで、200だった時にJS/metaっぽいか見る
    const text = await res.text();
    const head = text.slice(0, 800);

    return j({
      ok: true,
      target,
      status,
      location,
      hasLiveInHead: head.includes("/live/"),
      headPreview: head.replace(/\s+/g, " ").slice(0, 300)
    });
  } catch (e) {
    return j({ ok:false, target, reason:"fetch_error", error:String(e) }, 200);
  }
}

function j(obj, status=200){
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" }
  });
}