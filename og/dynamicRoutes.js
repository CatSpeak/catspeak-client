/**
 * Dynamic routes that need a database lookup. The same allowlist is used for
 * the canonical og:url and for the /api/og/resolve call, so pwd/ver/tracking
 * parameters never leak or fragment the CDN cache.
 */
export const DYNAMIC_ROUTE_PATTERNS = [
  {
    name: "shared-material-direct",
    pattern: /^\/shared-material\/[^/]+$/i,
    allowedQueryParams: [],
    fallbackKey: "materials",
  },
  {
    name: "shared-material-query",
    pattern: /^\/workspace\/profile(?:\/\d+)?$/i,
    requireQueryParam: "sharedMaterialToken",
    allowedQueryParams: ["sharedMaterialToken"],
    fallbackKey: "materials",
  },
  {
    name: "shared-event",
    pattern: /^\/events\/shared\/[^/]+$/i,
    allowedQueryParams: [],
    fallbackKey: "calendar",
  },
  {
    name: "public-event-occurrence",
    pattern: /^\/(?:zh|en|ja|vi|vn)\/cat-speak\/calendar$/i,
    requireQueryParam: "occurrenceId",
    allowedQueryParams: ["occurrenceId", "token"],
    fallbackKey: "calendar",
  },
  {
    name: "group-invite",
    pattern: /^\/(?:chat\/)?invite\/[^/]+$/i,
    allowedQueryParams: [],
    fallbackKey: "chat",
  },
  {
    name: "teacher-profile",
    pattern: /^\/(?:workspace\/)?explore(?:-courses)?\/teachers\/[^/]+(?:\/competency)?$/i,
    allowedQueryParams: [],
    fallbackKey: "teachers",
  },
  {
    name: "news-detail",
    pattern: /^\/(?:zh|en|ja|vi|vn)\/cat-speak\/news\/[^/]+$/i,
    allowedQueryParams: [],
    fallbackKey: "news",
  },
  {
    name: "course-detail",
    pattern: /^\/(?:workspace\/)?(?:explore-courses|courses|learning)\/details\/\d+$/i,
    allowedQueryParams: [],
    fallbackKey: "courses",
  },
  {
    name: "class-detail",
    pattern: /^\/(?:workspace\/)?(?:explore-courses|courses|learning)\/class\/\d+$/i,
    allowedQueryParams: [],
    fallbackKey: "courses",
  },
  {
    name: "reel-detail",
    pattern: /^\/(?:(?:zh|en|ja|vi|vn)\/cat-speak|workspace)\/reels\/\d+$/i,
    allowedQueryParams: [],
    fallbackKey: "reels",
  },
  {
    name: "meeting-room",
    pattern: /^\/(?:zh|en|ja|vi|vn)\/meet\/(?:class-\d+|\d+)$/i,
    allowedQueryParams: [],
    fallbackKey: "rooms",
  },
  {
    name: "user-profile",
    pattern: /^\/(?:workspace\/)?profile\/\d+$/i,
    allowedQueryParams: [],
    fallbackKey: "profile",
  },
]

export function matchDynamicRoute(normalizedPath, searchParams) {
  for (const route of DYNAMIC_ROUTE_PATTERNS) {
    if (!route.pattern.test(normalizedPath)) continue
    if (route.requireQueryParam && !searchParams.get(route.requireQueryParam)?.trim()) {
      continue
    }
    return route
  }
  return null
}
