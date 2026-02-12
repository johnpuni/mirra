export async function onRequest({ request }) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("user_id") || "";
  const safeUserId = String(userId).replace(/[^\d]/g, "");

  if (!safeUserId) {
    return json({ mode: "error", url: null, reason: "missing user_id" }, 400);
  }

  // ここが肝：Mirrativの profile API を叩いて live_id を拾う
  // ※Mirrativ側仕様が変わったら調整が必要
  const apiUrl = `https://www.mirrativ.com/api/user/profile?user_id=${safeUserId}`; // 例として知られている形  [oai_citation:1‡bytes.keithhacks.cyou](https://bytes.keithhacks.cyou/etc/yt-dlp/commit/02fc6feb6e9b83d8756886efb91c0bf61b4c4de7?utm_source=chatgpt.com)

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://www.mirrativ.com/",
      },
      cf: { cacheTtl: 5, cacheEverything: false },
    });

    if (!res.ok) {
      // 取れなければユーザーページへ
      return json({ mode: "user", url: `https://www.mirrativ.com/user/${safeUserId}`, reason: `api_status_${res.status}` });
    }

    const data = await res.json();

    // ありがちなフィールド名候補：
    // - data.user?.live_id
    // - data.live_id
    // - data.onlive?.live_id
    const liveId =
      data?.user?.live_id ||
      data?.live_id ||
      data?.onlive?.live_id ||
      data?.on_live?.live_id ||
      null;

    if (liveId) {
      return json({ mode: "live", url: `https://www.mirrativ.com/live/${liveId}`, live_id: liveId });
    }

    return json({ mode: "user", url: `https://www.mirrativ.com/user/${safeUserId}` });
  } catch (e) {
    return json({ mode: "user", url: `https://www.mirrativ.com/user/${safeUserId}`, reason: "fetch_error" });
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
