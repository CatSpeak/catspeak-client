import DOMPurify from "dompurify"

const ALLOWED_URI_REGEXP = /^(?:https?:\/\/|mailto:|tel:|\/(?![/\\])|#)/i

const FORBIDDEN_TAGS = [
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "textarea",
  "select",
  "button",
  "script",
  "style",
  "svg",
  "math",
]

const FORBIDDEN_ATTRS = ["srcdoc", "formaction"]

const DEFAULT_ADD_TAGS = [
  "mark",
  "sub",
  "sup",
  "small",
  "del",
  "s",
  "u",
  "strike",
]

const DEFAULT_ADD_ATTRS = ["target", "rel", "style", "class"]

let hookRegistered = false

function ensureSecurityHook() {
  if (hookRegistered || typeof DOMPurify?.addHook !== "function") return
  hookRegistered = true

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href")
      if (href && !ALLOWED_URI_REGEXP.test(href.trim())) {
        node.removeAttribute("href")
      }
      if (node.getAttribute("target") === "_blank") {
        const existingRel = node.getAttribute("rel") || ""
        const relTokens = new Set(
          existingRel.split(/\s+/).filter(Boolean),
        )
        relTokens.add("noopener")
        relTokens.add("noreferrer")
        node.setAttribute("rel", Array.from(relTokens).join(" "))
      }
    }

    if (node.hasAttribute?.("src")) {
      const src = node.getAttribute("src")
      if (src && !ALLOWED_URI_REGEXP.test(src.trim())) {
        node.removeAttribute("src")
      }
    }
  })
}

/**
 * Sanitize rich HTML content cleanly, blocking active content (`<iframe>`, `<svg>`,
 * inline scripts/handlers, `javascript:` / `data:` URIs, `srcdoc`) and enforcing
 * `rel="noopener noreferrer"` on `target="_blank"` anchors.
 *
 * @param {string} html
 * @param {object} [options]
 * @param {string[]} [options.extraTags]
 * @param {string[]} [options.extraAttrs]
 * @returns {string}
 */
function scrubDocumentTree(html) {
  if (typeof DOMParser === "undefined" || !html) return html
  const doc = new DOMParser().parseFromString(html, "text/html")
  const body = doc?.body
  if (!body) return html

  const forbiddenSelector = FORBIDDEN_TAGS.join(",")
  body.querySelectorAll(forbiddenSelector).forEach((el) => el.remove())

  const urlAttrs = ["href", "src", "xlink:href", "action", "formaction"]
  body.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes || [])) {
      const name = attr.name.toLowerCase()
      if (name.startsWith("on") || FORBIDDEN_ATTRS.includes(name)) {
        el.removeAttribute(attr.name)
        continue
      }
      if (urlAttrs.includes(name) && !ALLOWED_URI_REGEXP.test(attr.value.trim())) {
        el.removeAttribute(attr.name)
      }
    }

    if (el.tagName === "A" && el.getAttribute("target") === "_blank") {
      const existingRel = el.getAttribute("rel") || ""
      const relTokens = new Set(existingRel.split(/\s+/).filter(Boolean))
      relTokens.add("noopener")
      relTokens.add("noreferrer")
      el.setAttribute("rel", Array.from(relTokens).join(" "))
    }
  })

  return body.innerHTML
}

export function sanitizeHtml(
  html,
  { extraTags = DEFAULT_ADD_TAGS, extraAttrs = DEFAULT_ADD_ATTRS } = {},
) {
  if (!html || typeof html !== "string") return ""
  ensureSecurityHook()

  const safeExtraTags = extraTags.filter(
    (tag) => !FORBIDDEN_TAGS.includes(String(tag).toLowerCase()),
  )

  const purified = DOMPurify.sanitize(html, {
    ADD_TAGS: safeExtraTags,
    ADD_ATTR: extraAttrs,
    FORBID_TAGS: FORBIDDEN_TAGS,
    FORBID_ATTR: FORBIDDEN_ATTRS,
    ALLOWED_URI_REGEXP,
  })

  return scrubDocumentTree(purified)
}

/**
 * Extract normalized plain text from an HTML snippet using DOMParser
 * without inserting untrusted HTML into the active document DOM.
 *
 * @param {string} html
 * @returns {string}
 */
export function stripHtmlToText(html) {
  if (!html || typeof html !== "string") return ""
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(html, "text/html")
    return doc.body?.textContent?.replace(/\s+/g, " ").trim() || ""
  }
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}
