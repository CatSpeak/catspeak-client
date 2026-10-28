/* Bộ đệm offline cho Sổ tay từ vựng (flashcard, CHK-098).
 *
 * Chỉ đăng ký với scope /<lang>/ai-tutor/vocabulary-notebook, nên chỉ điều khiển các
 * trang sổ từ vựng, không đụng phần còn lại của CatSpeak.
 *
 * Luôn ưu tiên mạng (network-first): có mạng thì hành vi y như không có service
 * worker, chỉ lưu thêm một bản sao. Mất mạng thì trả bản đã lưu, để tải lại trang vẫn
 * mở được sổ và báo rõ đang offline thay vì trang trắng. Không bao giờ lưu API.
 */
const CACHE = "catspeak-flashcard-shell-v1"
const SHELL_KEY = "/__flashcard_shell__"

const OFFLINE_HTML = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Sổ tay từ vựng - offline</title>
<style>body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#fff;color:#0f172a;
display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;text-align:center}
.b{max-width:380px}h1{font-size:20px;margin:0 0 8px}p{color:#64748b;font-size:14px;line-height:1.5}
button{margin-top:12px;height:40px;padding:0 24px;border:0;border-radius:999px;background:#990011;color:#fff;
font-weight:600;font-size:14px;cursor:pointer}</style></head><body><div class="b" role="alert">
<h1>Bạn đang offline</h1><p>Không tải được Sổ tay từ vựng vì mất kết nối mạng. Kết quả ôn đã lưu trên máy
vẫn an toàn và sẽ đồng bộ khi có mạng lại.</p><button onclick="location.reload()">Thử lại</button></div></body></html>`

self.addEventListener("install", () => self.skipWaiting())

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k.startsWith("catspeak-flashcard-") && k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })(),
  )
})

const sameOrigin = (url) => url.origin === self.location.origin
const isApi = (url) => url.pathname.startsWith("/api")

async function put(key, response) {
  if (!response || !response.ok || response.type === "opaque") return
  const cache = await caches.open(CACHE)
  await cache.put(key, response)
}

async function cacheUrls(urls, shellUrl) {
  const cache = await caches.open(CACHE)
  await Promise.all(
    (urls || []).map(async (u) => {
      try {
        const url = new URL(u, self.location.origin)
        if (!sameOrigin(url) || isApi(url)) return
        if (await cache.match(url.href)) return
        const res = await fetch(url.href, { credentials: "same-origin" })
        await put(url.href, res)
      } catch {
        // bỏ qua tài nguyên không tải được
      }
    }),
  )
  if (shellUrl) {
    try {
      const res = await fetch(shellUrl, { credentials: "same-origin", cache: "no-cache" })
      if (res.ok) {
        await put(shellUrl, res.clone())
        await put(SHELL_KEY, res)
      }
    } catch {
      // offline lúc đăng ký: lần sau
    }
  }
}

self.addEventListener("message", (event) => {
  const data = event.data || {}
  if (data.type === "flashcard-cache") event.waitUntil(cacheUrls(data.urls, data.shellUrl))
})

async function navigate(request) {
  try {
    const res = await fetch(request)
    if (res.ok) {
      put(request.url, res.clone())
      put(SHELL_KEY, res.clone())
    }
    return res
  } catch {
    const cache = await caches.open(CACHE)
    return (
      (await cache.match(request.url)) ||
      (await cache.match(SHELL_KEY)) ||
      new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } })
    )
  }
}

async function asset(request) {
  try {
    const res = await fetch(request)
    if (res.ok) put(request.url, res.clone())
    return res
  } catch (err) {
    const cached = await (await caches.open(CACHE)).match(request.url)
    if (cached) return cached
    throw err
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (!sameOrigin(url) || isApi(url)) return
  if (request.mode === "navigate") {
    event.respondWith(navigate(request))
    return
  }
  if (["script", "style", "font", "image", "worker"].includes(request.destination) || url.pathname.startsWith("/assets/")) {
    event.respondWith(asset(request))
  }
})
