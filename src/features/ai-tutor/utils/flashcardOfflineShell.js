/**
 * Đăng ký bộ đệm offline cho Sổ tay từ vựng (public/flashcard-sw.js), CHK-098.
 *
 * Scope chỉ là /<lang>/ai-tutor/vocabulary-notebook nên không ảnh hưởng các trang
 * khác. Sau khi đăng ký, gửi danh sách script/style trang đang dùng để service worker
 * lưu sẵn: lần sau tải lại trang khi mất mạng vẫn mở được sổ và báo rõ đang offline.
 */

const registered = new Set()

const sameOriginUrls = () => {
  if (typeof window === "undefined") return []
  const origin = window.location.origin
  const urls = new Set()
  const add = (u) => {
    if (!u) return
    try {
      const url = new URL(u, origin)
      if (url.origin === origin && !url.pathname.startsWith("/api")) urls.add(url.href)
    } catch {
      // url lạ
    }
  }
  document.querySelectorAll("script[src]").forEach((el) => add(el.src))
  document.querySelectorAll('link[rel="stylesheet"],link[rel="modulepreload"],link[rel="icon"]').forEach((el) => add(el.href))
  try {
    performance
      .getEntriesByType("resource")
      .filter((e) => ["script", "link", "css", "img", "other"].includes(e.initiatorType))
      .forEach((e) => add(e.name))
  } catch {
    // trình duyệt không có Performance API
  }
  return [...urls].filter((u) => !/[?&]probe=/.test(u))
}

export async function registerFlashcardOffline(lang = "vi") {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !window.isSecureContext) return
  const scope = `/${lang}/ai-tutor/vocabulary-notebook`
  try {
    const reg = registered.has(scope)
      ? await navigator.serviceWorker.getRegistration(scope)
      : await navigator.serviceWorker.register("/flashcard-sw.js", { scope })
    registered.add(scope)
    const worker = reg?.active || reg?.waiting || reg?.installing
    if (!worker) return
    const send = () =>
      worker.postMessage({
        type: "flashcard-cache",
        urls: sameOriginUrls(),
        shellUrl: `${window.location.origin}${scope}`,
      })
    if (worker.state === "activated") send()
    else
      worker.addEventListener("statechange", function onChange() {
        if (worker.state === "activated") {
          worker.removeEventListener("statechange", onChange)
          send()
        }
      })
  } catch {
    // không đăng ký được (trình duyệt chặn): sổ vẫn chạy bình thường khi có mạng
  }
}
