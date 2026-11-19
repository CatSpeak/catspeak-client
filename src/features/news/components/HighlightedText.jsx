import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { highlightTextString } from "../utils/contentHighlighter"

/**
 * HighlightedText
 * Renders plain text with hashtags highlighted as clickable spans and search keywords wrapped in <mark>.
 */
const HighlightedText = ({
  text = "",
  searchKeyword = "",
  className = "",
  onHashtagClick,
}) => {
  const navigate = useNavigate()
  const { lang } = useParams()

  if (!text) return null

  const html = highlightTextString(text, searchKeyword)

  const handleClick = (e) => {
    const hashtagEl = e.target.closest("[data-hashtag]")
    if (hashtagEl) {
      e.preventDefault()
      e.stopPropagation()
      const tag = hashtagEl.getAttribute("data-hashtag")
      if (onHashtagClick) {
        onHashtagClick(tag)
      } else {
        const targetLang = lang || "en"
        navigate(`/${targetLang}/cat-speak/global-news?search=${encodeURIComponent(tag)}`)
      }
    }
  }

  return (
    <span
      className={className}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default HighlightedText
