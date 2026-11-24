const CACHE_NAME = "catspeak-flashcard-v1"
const SHELL_KEY = "/__flashcard_shell__"

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))),
    ).then(() => self.clients.claim()),
  )
})

function isValidSameOriginPath(rawUrl) {
  if (typeof rawUrl !== "string") return false
  const trimmed = rawUrl.trim()
  if (!trimmed || trimmed.startsWith("//")) return false
  try {
    const parsed = new URL(trimmed, self.location.origin)
    if (parsed.origin !== self.location.origin) return false
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false
    if (parsed.pathname === "/api" || parsed.pathname.startsWith("/api/")) return false
    if (trimmed.includes("..")) return false
    return true
  } catch {
    return false
  }
}

async function put(key, response) {
  const cache = await caches.open(CACHE_NAME)
  await cache.put(key, response)
}

async function cacheUrls(urls = [], shellUrl) {
  const safeUrls = Array.isArray(urls)
    ? urls.filter((url) => isValidSameOriginPath(url))
    : []

  await Promise.all(
    safeUrls.map(async (url) => {
      try {
        const res = await fetch(url, { mode: "cors", credentials: "omit" })
        if (res.ok) await put(url, res)
      } catch {
        // mất mạng giữa chừng -> bỏ qua URL này, các URL khác vẫn cache bình thường
      }
    }),
  )

  if (shellUrl && isValidSameOriginPath(shellUrl)) {
    try {
      const targetUrl = new URL(shellUrl, self.location.origin)
      const res = await fetch(targetUrl.pathname + targetUrl.search, {
        credentials: "same-origin",
        cache: "no-cache",
      })
      if (res.ok) {
        await put(targetUrl.pathname + targetUrl.search, res.clone())
        await put(SHELL_KEY, res)
      }
    } catch {
      // offline lúc đăng ký: lần sau
    }
  }
}

self.addEventListener("message", (event) => {
  if (event.origin !== self.location.origin) {
    return
  }
  const data = event.data || {}
  if (data.type === "flashcard-cache") {
    event.waitUntil(cacheUrls(data.urls, data.shellUrl))
  }
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)

  // Audio hoặc file media cùng/ngoài origin đã được prefetch
  if (
    url.pathname.endsWith(".mp3") ||
    url.pathname.endsWith(".wav") ||
    url.pathname.endsWith(".ogg") ||
    url.pathname.endsWith(".m4a")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request.url) || await cache.match(url.pathname)
        if (cached) return cached
        const net = await fetch(request)
        if (net.ok) cache.put(request.url, net.clone())
        return net
      }),
    )
    return
  }

  // Navigation requests đến flashcard route -> ưu tiên network, rớt mạng thì trả app shell đã cache
  if (request.mode === "navigate" && url.pathname.includes("/flashcard")) {
    event.respondWith(
      fetch(request)
        .then(async (res) => {
          if (res.ok) await put(SHELL_KEY, res.clone())
          return res
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME)
          return (
            (await cache.match(request)) ||
            (await cache.match(SHELL_KEY)) ||
            new Response("Offline", { status: 503, statusText: "Offline" })
          )
        }),
    )
  }
})
