import React from "react"
import { sanitizeHtml } from "@/shared/utils/sanitizeHtml"
import { cn } from "@/lib/utils"

/**
 * RenderHTML safely sanitizes and renders rich HTML string content (e.g. from TinyMCE).
 */
export const RenderHTML = ({ html, className = "", fallback = null }) => {
  if (!html || typeof html !== "string" || !html.trim()) {
    return fallback
  }

  const cleanHtml = sanitizeHtml(html, {
    extraAttrs: ["target", "rel", "style", "class"],
  })

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-gray-800 dark:text-neutral-200 leading-relaxed",
        "[&_strong]:font-bold [&_b]:font-bold [&_strong]:text-slate-900 [&_b]:text-slate-900 dark:[&_strong]:text-white dark:[&_b]:text-white",
        "[&_strong]:[-webkit-text-stroke:0.2px_currentColor] [&_b]:[-webkit-text-stroke:0.2px_currentColor]",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1.5 [&_li]:my-0.5 [&_p]:mb-2 [&_p:last-child]:mb-0",
        "[&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold",
        "[&_h1]:text-slate-900 [&_h2]:text-slate-900 [&_h3]:text-slate-900 dark:[&_h1]:text-white dark:[&_h2]:text-white dark:[&_h3]:text-white",
        "[&_a]:text-[#990011] dark:[&_a]:text-[#FF6B6B] [&_a]:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  )
}

export default RenderHTML
