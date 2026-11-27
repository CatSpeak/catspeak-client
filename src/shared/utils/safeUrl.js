/**
 * CS-21: Only absolute `http:`/`https:` URLs may reach an `href` or
 * `window.open`. Everything else (`javascript:`, `data:`, `vbscript:`, `file:`,
 * ...) is rejected.
 *
 * Scheme-less values coming from lesson content (e.g. "example.com/page") are
 * normalised with an `https://` prefix to preserve the existing UX.
 */
export function getSafeExternalHttpUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null
  let candidate = rawUrl.trim()
  if (!candidate) return null

  // Protocol-relative URLs are absolute; normalise to https.
  if (candidate.startsWith("//")) {
    candidate = `https:${candidate}`
  } else if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    // No scheme at all -> treat as a bare host/path.
    candidate = `https://${candidate}`
  }

  let parsed
  try {
    parsed = new URL(candidate)
  } catch {
    return null
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null
  }
  return parsed.toString()
}
