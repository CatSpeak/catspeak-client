import React from "react"
import DOMPurify from "dompurify"

/**
 * RenderHTML safely sanitizes and renders rich HTML string content (e.g. from TinyMCE).
 */
export const RenderHTML = ({ html, className = "", fallback = null }) => {
  if (!html || typeof html !== "string" || !html.trim()) {
    return fallback
  }

  const cleanHtml = DOMPurify.sanitize(html, {
    ADD_ATTR: ["target", "rel", "style", "class"],
  })

  return (
    <div
      className={`prose prose-sm max-w-none text-gray-800 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_li]:my-0.5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_a]:text-[#990011] [&_a]:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}

export default RenderHTML
