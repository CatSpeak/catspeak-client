import React from "react"

/**
 * Regex matching HTTP/HTTPS/WWW URLs in text.
 */
export const URL_REGEX = /(https?:\/\/[^\s<]+|(?:www\.)[^\s<]+)/gi

/**
 * Clean trailing punctuation from a URL matched in plain text.
 */
export const cleanUrl = (urlStr) => {
  let cleaned = urlStr
  let trailing = ""

  while (cleaned.length > 0 && /[.,:;"'\]\)!?]$/.test(cleaned)) {
    trailing = cleaned.slice(-1) + trailing
    cleaned = cleaned.slice(0, -1)
  }

  return { cleanedUrl: cleaned, trailing }
}

/**
 * Parses YouTube URL and extracts Video ID and optional timestamp.
 */
export const parseYouTubeUrl = (urlStr) => {
  if (!urlStr) return { isYouTube: false, videoId: null, timestamp: null, originalUrl: urlStr }

  try {
    let formattedUrl = urlStr.trim()
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`
    }

    const parsed = new URL(formattedUrl)
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "")

    const isYTDomain =
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtu.be" ||
      hostname === "youtube-nocookie.com"

    if (!isYTDomain) {
      return { isYouTube: false, videoId: null, timestamp: null, originalUrl: urlStr }
    }

    let videoId = null

    if (hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1).split("/")[0]
    } else {
      if (parsed.searchParams.has("v")) {
        videoId = parsed.searchParams.get("v")
      } else {
        const pathSegments = parsed.pathname.split("/").filter(Boolean)
        if (
          pathSegments[0] === "embed" ||
          pathSegments[0] === "v" ||
          pathSegments[0] === "shorts" ||
          pathSegments[0] === "live"
        ) {
          videoId = pathSegments[1]
        }
      }
    }

    if (videoId) {
      videoId = videoId.split("?")[0].split("&")[0].split("#")[0]
      videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, "")
    }

    if (!videoId || videoId.length < 5) {
      return { isYouTube: false, videoId: null, timestamp: null, originalUrl: urlStr }
    }

    const timestamp = parsed.searchParams.get("t") || parsed.searchParams.get("start") || null

    return {
      isYouTube: true,
      videoId,
      timestamp,
      originalUrl: urlStr,
    }
  } catch {
    return { isYouTube: false, videoId: null, timestamp: null, originalUrl: urlStr }
  }
}

/**
 * Parses generic URL details for site previews.
 */
export const parseUrlDetails = (urlStr) => {
  if (!urlStr) return null

  const { cleanedUrl } = cleanUrl(urlStr.trim())
  const href = cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")
    ? cleanedUrl
    : `https://${cleanedUrl}`

  const ytData = parseYouTubeUrl(cleanedUrl)
  if (ytData.isYouTube && ytData.videoId) {
    return {
      type: "youtube",
      href,
      originalUrl: cleanedUrl,
      youtube: ytData,
    }
  }

  try {
    const parsed = new URL(href)
    const domain = parsed.hostname.replace(/^www\./, "")
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`
    const pathSnippet = parsed.pathname !== "/" ? parsed.pathname + parsed.search : ""

    return {
      type: "general",
      href,
      originalUrl: cleanedUrl,
      domain,
      faviconUrl,
      pathSnippet,
    }
  } catch {
    return null
  }
}

/**
 * Extract all URLs from text and parse their details.
 */
export const findUrlsInText = (text) => {
  if (!text) return []
  const matches = text.match(URL_REGEX) || []
  const results = []
  const seenHrefs = new Set()

  for (const rawUrl of matches) {
    const details = parseUrlDetails(rawUrl)
    if (details && !seenHrefs.has(details.href)) {
      seenHrefs.add(details.href)
      results.push(details)
    }
  }

  return results
}

/**
 * React Component to render text with clickable URLs.
 */
export const FormattedText = ({ text, isOwn = false, className = "" }) => {
  if (!text) return null

  const parts = []
  let lastIndex = 0
  const regex = new RegExp(URL_REGEX)
  let match

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index
    const fullMatch = match[0]

    if (matchIndex > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, matchIndex),
      })
    }

    const { cleanedUrl, trailing } = cleanUrl(fullMatch)
    const href = cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://")
      ? cleanedUrl
      : `https://${cleanedUrl}`

    parts.push({
      type: "link",
      content: cleanedUrl,
      href,
    })

    if (trailing) {
      parts.push({
        type: "text",
        content: trailing,
      })
    }

    lastIndex = matchIndex + fullMatch.length
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    })
  }

  const linkStyle = isOwn
    ? "underline font-semibold text-white/90 hover:text-white break-all transition-opacity hover:opacity-100"
    : "underline font-semibold text-[#990011] dark:text-red-400 hover:opacity-80 break-all transition-opacity"

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "link") {
          return (
            <a
              key={index}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkStyle}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {part.content}
            </a>
          )
        }
        return <React.Fragment key={index}>{part.content}</React.Fragment>
      })}
    </span>
  )
}
