export async function onRequest({ request }) {
  const u = new URL(request.url);
  const userId = String(u.searchParams.get("user_id") || "").replace(/[^\d]/g, "");
  if (!userId) return json({ mode: "error", url: null, reason: "missing_user_id" }, 400);

  const userUrl = `https://www.mirrativ.com/user/${userId}`;

  try {
    // リダイレクトを“追わずに”Locationを見る
    const res = await fetch(userUrl, {
      redirect: "manual",
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cf: { cacheTtl: 2, cacheEverything: false },
    });

    const status = res.status;
    const loc = res.headers.get("location") || res.headers.get("Location") || "";

    // 30x で /live/ が返るなら配信中扱い
    if ((status === 301 || status === 302 || status === 303 || status === 307 || status === 308) && loc.includes("/live/")) {
      const liveUrl = loc.startsWith("http") ? loc : `https://www.mirrativ.com${loc}`;
      return json({ mode: "live", url: liveUrl, location: loc, status });
    }

    // リダイレクト無し or /live/じゃない → ユーザーページ
    return json({ mode: "user", url: userUrl, location: loc, status });
  } catch (e) {
    return json({ mode: "user", url: userUrl, reason: "fetch_error" });
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}