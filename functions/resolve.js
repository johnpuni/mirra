export async function onRequest({ request }) {
  const u = new URL(request.url);
  const userId = String(u.searchParams.get("user_id") || "").replace(/[^\d]/g, "");
  if (!userId) return json({ mode: "error", url: null, reason: "missing_user_id" }, 400);

  try {
    const api = `https://www.mirrativ.com/api/live/live_history?user_id=${userId}`;
    const res = await fetch(api, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://www.mirrativ.com/",
      },
      cf: { cacheTtl: 3, cacheEverything: false },
    });

    if (!res.ok) {
      return json({ mode: "user", url: `https://www.mirrativ.com/user/${userId}`, reason: `status_${res.status}` });
    }

    const h = await res.json();
    const liveId = h?.lives?.[0]?.live_id || null;

    if (liveId) {
      return json({ mode: "live", url: `https://www.mirrativ.com/live/${liveId}`, live_id: liveId });
    }
    return json({ mode: "user", url: `https://www.mirrativ.com/user/${userId}` });
  } catch (e) {
    return json({ mode: "user", url: `https://www.mirrativ.com/user/${userId}`, reason: "fetch_error" });
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}