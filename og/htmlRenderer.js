import { OG_DEFAULTS, OG_IMAGE_META } from "./staticRoutes.js"

const BLOCKED_IMAGE_EXTENSIONS = [
  ".svg",
  ".ico",
  ".pdf",
  ".mp4",
  ".mov",
  ".webm",
  ".mp3",
  ".wav",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
]

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

function pathWithoutQuery(url) {
  return url.split("?")[0].split("#")[0].toLowerCase()
}

function isBlockedImage(url) {
  if (!url || !url.trim()) return true
  const lower = url.trim().toLowerCase()
  if (lower.startsWith("data:")) return true
  const path = pathWithoutQuery(lower)
  return BLOCKED_IMAGE_EXTENSIONS.some((extension) => path.endsWith(extension))
}

function inferImageType(url) {
  const path = pathWithoutQuery(url)
  if (path.endsWith(".png")) return "image/png"
  if (path.endsWith(".webp")) return "image/webp"
  if (path.endsWith(".gif")) return "image/gif"
  return "image/jpeg"
}

function resolveImage(meta, origin) {
  const fallbackKey = meta.fallbackKey
  const fallbackMeta = OG_DEFAULTS[fallbackKey] || OG_DEFAULTS.home
  let imageUrl = String(meta.imageUrl || fallbackMeta.imageUrl || OG_DEFAULTS.home.imageUrl).trim()

  if (isBlockedImage(imageUrl)) {
    imageUrl = fallbackMeta.imageUrl || OG_DEFAULTS.home.imageUrl
  }

  if (imageUrl.startsWith("/og/")) {
    const known = OG_IMAGE_META[imageUrl]
    return {
      url: `${origin}${imageUrl}`,
      type: known?.type || "image/jpeg",
      width: meta.imageWidth || known?.width || null,
      height: meta.imageHeight || known?.height || null,
    }
  }

  if (imageUrl.startsWith("//")) {
    imageUrl = `https:${imageUrl}`
  }

  if (!/^https?:\/\//i.test(imageUrl)) {
    return resolveImage(
      { ...meta, imageUrl: OG_DEFAULTS.home.imageUrl, imageWidth: null, imageHeight: null },
      origin,
    )
  }

  imageUrl = imageUrl.replace(/^http:\/\//i, "https://")

  const width = Number(meta.imageWidth)
  const height = Number(meta.imageHeight)

  return {
    url: imageUrl,
    type: inferImageType(imageUrl),
    width: Number.isFinite(width) && width > 0 ? width : null,
    height: Number.isFinite(height) && height > 0 ? height : null,
  }
}

export function renderOgHtml({ meta = {}, canonicalUrl = "", origin = "" }) {
  const fallbackKey = meta.fallbackKey
  const fallbackMeta = OG_DEFAULTS[fallbackKey] || OG_DEFAULTS.home

  const title = meta.title || fallbackMeta.title
  const description = meta.description || fallbackMeta.description
  const ogType = meta.ogType || fallbackMeta.ogType || "website"
  const locale = meta.locale || fallbackMeta.locale || "vi_VN"
  const image = resolveImage(meta, origin)
  const imageAlt = meta.imageAlt || title
  const url = canonicalUrl || `${origin}/`

  const lines = [
    "<!DOCTYPE html>",
    '<html lang="vi" prefix="og: https://ogp.me/ns#">',
    "<head>",
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
  ]

  if (meta.noIndex) {
    lines.push('<meta name="robots" content="noindex, nofollow" />')
  }

  lines.push(
    `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(image.url)}" />`,
  )

  if (image.url.startsWith("https://")) {
    lines.push(`<meta property="og:image:secure_url" content="${escapeHtml(image.url)}" />`)
  }

  lines.push(`<meta property="og:image:type" content="${escapeHtml(image.type)}" />`)

  if (image.width && image.height) {
    lines.push(
      `<meta property="og:image:width" content="${image.width}" />`,
      `<meta property="og:image:height" content="${image.height}" />`,
    )
  }

  lines.push(
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    '<meta property="og:site_name" content="Cat Speak" />',
    `<meta property="og:locale" content="${escapeHtml(locale)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image.url)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`,
    "</head>",
    "<body></body>",
    "</html>",
  )

  return lines.join("\n")
}
