/**
 * CS-21: Only absolute `http:`/`https:` URLs may reach an `href` or
 * `window.open`. Everything else (`javascript:`, `data:`, `vbscript:`, `file:`,
 * relative paths, ...) is rejected.
 *
 * Scheme-less values coming from lesson content (e.g. "example.com/page") are
 * normalised with an `https://` prefix to preserve the existing UX.
 */
function hasControlCharacter(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 0x1f || code === 0x7f) return true
  }
  return false
}

export function getSafeExternalHttpUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null
  const candidate = rawUrl.trim()
  if (!candidate) return null

  // Reject control characters (header/URL smuggling, NUL bytes, ...).
  if (hasControlCharacter(candidate)) return null

  // Relative paths must never be turned into a fake host ("/api" -> "api").
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return null

  let normalized = candidate
  // Protocol-relative URLs are absolute; normalise to https.
  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`
  } else if (!/^[a-z][a-z0-9+.-]*:/i.test(normalized)) {
    // No scheme at all -> treat as a bare host/path.
    normalized = `https://${normalized}`
  }

  let parsed
  try {
    parsed = new URL(normalized)
  } catch {
    return null
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null
  }
  return parsed.toString()
}
