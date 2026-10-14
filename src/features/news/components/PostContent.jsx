import { useState, useEffect, useMemo } from "react"
import DOMPurify from "dompurify"
import { CmsCarousel } from "./CmsCarousel"
import { parseContentSegments } from "../utils/parseContentSegments"
import { CONTENT_CLASSES } from "../constants/contentClasses"
import { normalizeContent } from "../utils/contentNormalizer"

const PostContent = ({ html, contentUrl, className = "" }) => {
  const [fetchedData, setFetchedData] = useState({ url: null, html: "" })

  useEffect(() => {
    if (html || !contentUrl) return

    let isSubscribed = true
    const controller = new AbortController()

    fetch(contentUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.text()
      })
      .then((text) => {
        if (isSubscribed) {
          setFetchedData({ url: contentUrl, html: text })
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error loading HTML from MinIO:", err)
          if (isSubscribed) {
            setFetchedData({ url: contentUrl, html: "" })
          }
        }
      })

    return () => {
      isSubscribed = false
      controller.abort()
    }
  }, [html, contentUrl])

  const isLoading =
    !html && Boolean(contentUrl) && fetchedData.url !== contentUrl
  const displayHtml =
    html || (fetchedData.url === contentUrl ? fetchedData.html : "")

  const segments = useMemo(() => {
    if (!displayHtml) return []
    const normalizedHtml = normalizeContent(displayHtml)
    const sanitized = DOMPurify.sanitize(normalizedHtml, {
      ADD_TAGS: [
        "mark",
        "sub",
        "sup",
        "small",
        "del",
        "s",
        "u",
        "strike",
        "iframe",
      ],
      ADD_ATTR: [
        "style",
        "width",
        "height",
        "border",
        "cellpadding",
        "cellspacing",
        "class",
        "align",
        "target",
        "rel",
        "colspan",
        "rowspan",
      ],
    })
    return parseContentSegments(sanitized)
  }, [displayHtml])

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-3 p-2 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
    )
  }

  return (
    <div className={`${CONTENT_CLASSES} ${className}`}>
      {segments.map((seg, i) =>
        seg.type === "carousel" && seg.images ? (
          <CmsCarousel key={`carousel-${i}`} images={seg.images} />
        ) : (
          <div
            key={`html-${i}`}
            dangerouslySetInnerHTML={{ __html: seg.content }}
          />
        ),
      )}
    </div>
  )
}

export default PostContent
