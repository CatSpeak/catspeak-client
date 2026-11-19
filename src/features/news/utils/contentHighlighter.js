/**
 * Content Highlighter & Hashtag Parser Utility
 * 
 * 1. Highlights hashtags: #[^\s<>"'.,!?:;]+ as clickable elements with data-hashtag
 * 2. Highlights active searchKeyword using <mark>
 * Operates safely on DOM text nodes without breaking existing HTML tags or attributes.
 */

// Escape special regex characters in searchKeyword
export function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Replaces hashtags and search keywords in an HTML string safely using DOMParser.
 * @param {string} html - HTML string to transform
 * @param {string} [searchKeyword] - Optional search keyword to highlight
 * @returns {string} - Modified HTML string
 */
export function processContentHtml(html, searchKeyword = "") {
  if (!html || typeof html !== "string") return ""

  const cleanKeyword = (searchKeyword || "").trim()
  const hasKeyword = cleanKeyword.length > 0
  const hashtagPattern = /#[^\s<>"'`.,!?:;()[\]{}]+/gu

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    // Find all text nodes that are not inside <script>, <style>, <a>, etc.
    const textNodes = []
    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          const tag = parent.tagName.toLowerCase()
          if (["script", "style", "noscript", "mark"].includes(tag)) {
            return NodeFilter.FILTER_REJECT
          }
          if (parent.classList.contains("hashtag-token")) {
            return NodeFilter.FILTER_REJECT
          }
          return NodeFilter.FILTER_ACCEPT
        },
      },
    )

    let currentNode = walker.nextNode()
    while (currentNode) {
      textNodes.push(currentNode)
      currentNode = walker.nextNode()
    }

    // Process each text node
    textNodes.forEach((node) => {
      const text = node.textContent
      if (!text || text.trim().length === 0) return

      // Build replacement HTML for this text node
      const replacedHtml = highlightTextString(text, cleanKeyword)
      if (replacedHtml !== text) {
        const span = doc.createElement("span")
        span.innerHTML = replacedHtml
        node.replaceWith(...Array.from(span.childNodes))
      }
    })

    return doc.body.innerHTML
  } catch (err) {
    console.error("Error processing content HTML for hashtags and keywords:", err)
    return html
  }
}

/**
 * Replaces hashtags and search keywords in a plain text string, returning safe HTML string.
 * @param {string} text - Plain text
 * @param {string} [searchKeyword] - Search keyword
 * @returns {string} - Resulting HTML string
 */
export function highlightTextString(text, searchKeyword = "") {
  if (!text) return ""

  const cleanKeyword = (searchKeyword || "").trim()
  const hashtagRegex = /#[^\s<>"'`.,!?:;()[\]{}]+/g

  // Tokenize the string into segments: hashtags vs regular text
  const tokens = []
  let lastIndex = 0
  let match

  while ((match = hashtagRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: text.substring(lastIndex, match.index),
      })
    }
    tokens.push({
      type: "hashtag",
      value: match[0],
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      value: text.substring(lastIndex),
    })
  }

  // Helper to escape HTML characters
  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")

  // Highlight keyword inside regular text
  const highlightKeyword = (plainText) => {
    if (!cleanKeyword) return escapeHtml(plainText)

    // Remove leading # if user searches for hashtag keyword (e.g. "#news" or "news")
    const searchRegex = new RegExp(
      `(${escapeRegex(cleanKeyword)})`,
      "gi",
    )

    const parts = plainText.split(searchRegex)
    return parts
      .map((part) => {
        if (cleanKeyword && part.toLowerCase() === cleanKeyword.toLowerCase()) {
          return `<mark class="bg-amber-200/90 dark:bg-amber-500/30 text-inherit rounded-xs px-0.5">${escapeHtml(part)}</mark>`
        }
        return escapeHtml(part)
      })
      .join("")
  }

  return tokens
    .map((token) => {
      if (token.type === "hashtag") {
        const tag = token.value
        const isMatchedKeyword =
          cleanKeyword &&
          (tag.toLowerCase() === cleanKeyword.toLowerCase() ||
            tag.toLowerCase() === `#${cleanKeyword.toLowerCase()}`)

        const markStart = isMatchedKeyword
          ? '<mark class="bg-amber-200/90 dark:bg-amber-500/30 text-inherit rounded-xs px-0.5">'
          : ""
        const markEnd = isMatchedKeyword ? "</mark>" : ""

        return `${markStart}<span role="button" tabindex="0" class="hashtag-token cursor-pointer text-cath-red-700 dark:text-red-400 font-semibold hover:underline" data-hashtag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>${markEnd}`
      }
      return highlightKeyword(token.value)
    })
    .join("")
}
