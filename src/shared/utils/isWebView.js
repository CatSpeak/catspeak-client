/**
 * Detects whether the current browser is an in-app WebView.
 *
 * Returns `{ isWebView: boolean, appName: string | null }`.
 * `appName` is a user-friendly label like "Zalo", "Messenger", etc.
 */
export const detectWebView = () => {
  if (typeof navigator === "undefined") {
    return { isWebView: false, appName: null }
  }

  const ua = navigator.userAgent || ""

  // ── Known in-app browsers (order: most specific first) ──
  const patterns = [
    { pattern: /ZaloTheme|Zalo/i, name: "Zalo" },
    { pattern: /FBAN|FBAV|FB_IAB/i, name: "Facebook" },
    { pattern: /\bMessenger\b/i, name: "Messenger" },
    { pattern: /\bInstagram\b/i, name: "Instagram" },
    { pattern: /\bTwitter\b/i, name: "Twitter" },
    { pattern: /BytedanceWebview|TikTok/i, name: "TikTok" },
    { pattern: /MicroMessenger/i, name: "WeChat" },
    { pattern: /\bLine\//i, name: "LINE" },
    { pattern: /\bSnapchat\b/i, name: "Snapchat" },
    { pattern: /\bPinterest\b/i, name: "Pinterest" },
    { pattern: /\bLinkedIn\b/i, name: "LinkedIn" },
  ]

  for (const { pattern, name } of patterns) {
    if (pattern.test(ua)) {
      return { isWebView: true, appName: name }
    }
  }

  // ── Generic Android WebView ──
  // Android WebViews include "; wv)" in the UA string
  if (/Android/i.test(ua) && /; wv\)/i.test(ua)) {
    return { isWebView: true, appName: null }
  }

  // ── Generic iOS WebView (WKWebView) ──
  // Real Safari includes "Safari/" in the UA. WKWebView omits it.
  if (/iPhone|iPad|iPod/i.test(ua) && !/Safari\//i.test(ua)) {
    return { isWebView: true, appName: null }
  }

  return { isWebView: false, appName: null }
}

/**
 * Returns `true` if the device is running Android.
 */
export const isAndroid = () =>
  typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)

/**
 * Returns `true` if the device is running iOS.
 */
export const isIOS = () =>
  typeof navigator !== "undefined" &&
  /iPhone|iPad|iPod/i.test(navigator.userAgent)
