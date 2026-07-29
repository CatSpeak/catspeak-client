import { useState, useEffect, useMemo } from "react"
import DOMPurify from "dompurify"
import { CmsCarousel } from "./CmsCarousel"
import { parseContentSegments } from "../utils/parseContentSegments"
import { CONTENT_CLASSES } from "../constants/contentClasses"

const PostContent = ({ html, contentUrl, className = "" }) => {
  const [fetchedHtml, setFetchedHtml] = useState("")
  const [isLoading, setIsLoading] = useState(!html && Boolean(contentUrl))

  useEffect(() => {
    if (html) {
      setIsLoading(false)
      return
    }

    if (!contentUrl) {
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)

    fetch(contentUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.text()
      })
      .then((text) => {
        setFetchedHtml(text)
        setIsLoading(false)
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error loading HTML from MinIO:", err)
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [html, contentUrl])

  const displayHtml = html || fetchedHtml || ""

  const segments = useMemo(() => {
    if (!displayHtml) return []
    const sanitized = DOMPurify.sanitize(displayHtml, {
      ADD_ATTR: [
        "style",
        "width",
        "height",
        "border",
        "cellpadding",
        "cellspacing",
        "class",
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
