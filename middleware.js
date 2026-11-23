/* global process */
import { isSocialPreviewBot } from "./og/botDetector.js"
import { matchDynamicRoute } from "./og/dynamicRoutes.js"
import { renderOgHtml } from "./og/htmlRenderer.js"
import { getFallbackMeta, resolveStaticRoute } from "./og/staticRoutes.js"
import {
  buildCanonicalOgUrl,
  extractCommunityLang,
  normalizePath,
  pickAllowedQueryParams,
} from "./og/urlNormalizer.js"

const BACKEND_TIMEOUT_MS = 2500

export const config = {
  // Skip real static assets, but keep slugs that contain a dot
  // (e.g. /explore/teachers/mr.john).
  matcher:
    "/((?!api/|_next/|assets/|og/|sounds/|images/|website-icons/|favicon|.*\\.(?:css|js|mjs|map|ico|svg|png|jpg|jpeg|gif|webp|avif|woff|woff2|ttf|otf|mp3|wav|mp4|webm|pdf|json|xml|txt|webmanifest)$).*)",
}

export default async function middleware(req) {
  const userAgent = req.headers.get("user-agent") || ""
  if (!isSocialPreviewBot(userAgent)) {
    return
  }

  const url = new URL(req.url)
  const normalizedPath = normalizePath(url.pathname)
  const origin = `${url.protocol}//${url.host}`
  const lang = extractCommunityLang(normalizedPath)

  const dynamicRoute = matchDynamicRoute(normalizedPath, url.searchParams)
  if (dynamicRoute) {
    const allowedQuery = pickAllowedQueryParams(url.searchParams, dynamicRoute.allowedQueryParams)
    const canonicalUrl = buildCanonicalOgUrl(origin, normalizedPath, allowedQuery)
    const fallbackMeta = getFallbackMeta(dynamicRoute.fallbackKey, lang)
    const resolved = await fetchDynamicMetadata(normalizedPath, allowedQuery)

    const meta = resolved?.found
      ? {
          ...fallbackMeta,
          ...resolved,
          fallbackKey: resolved.fallbackKey || dynamicRoute.fallbackKey,
        }
      : getFallbackMeta(resolved?.fallbackKey || dynamicRoute.fallbackKey, lang)

    return htmlResponse({ meta, canonicalUrl, origin })
  }

  const staticMeta = resolveStaticRoute(normalizedPath)
  const canonicalUrl = buildCanonicalOgUrl(origin, normalizedPath)

  return htmlResponse({ meta: staticMeta, canonicalUrl, origin })
}

function htmlResponse({ meta, canonicalUrl, origin }) {
  return new Response(renderOgHtml({ meta, canonicalUrl, origin }), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      Vary: "User-Agent",
    },
  })
}

async function fetchDynamicMetadata(normalizedPath, allowedQuery) {
  const backendApiUrl = process.env.VITE_API_BASE_URL
  if (!backendApiUrl) return null

  try {
    const endpoint = new URL("/api/og/resolve", backendApiUrl)
    endpoint.searchParams.set("path", normalizedPath)
    for (const [key, value] of allowedQuery.entries()) {
      endpoint.searchParams.set(key, value)
    }

    const res = await fetch(endpoint.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    })

    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
