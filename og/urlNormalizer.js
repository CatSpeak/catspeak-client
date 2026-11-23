export function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/"
  const cleaned = pathname.replace(/\/+$/, "")
  return cleaned || "/"
}

export function extractCommunityLang(pathname) {
  const first = normalizePath(pathname).split("/")[1]?.toLowerCase()
  if (first === "zh" || first === "en" || first === "ja") return first
  if (first === "vi" || first === "vn") return "zh"
  return null
}

/**
 * Builds the safe query-parameter subset for a route. Anything not on the
 * allowlist (pwd, ver, utm_*, fbclid, gclid, zarsrc...) is dropped.
 */
export function pickAllowedQueryParams(searchParams, allowedKeys = []) {
  const picked = new URLSearchParams()
  for (const key of allowedKeys) {
    const value = searchParams.get(key)
    if (value && value.trim()) {
      picked.set(key, value.trim())
    }
  }
  return picked
}

export function buildCanonicalOgUrl(origin, normalizedPath, allowedQueryParams) {
  const query = allowedQueryParams?.toString()
  return query ? `${origin}${normalizedPath}?${query}` : `${origin}${normalizedPath}`
}
