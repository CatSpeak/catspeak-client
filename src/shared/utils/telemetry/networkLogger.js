/**
 * In-memory ring buffer to capture HTTP network requests (Fetch & XHR).
 * Automatically masks authorization tokens, passwords, and sensitive keys.
 */

const MAX_REQUESTS = 40
const networkBuffer = []
let isInitialized = false

// Endpoints to ignore from recording (noise reduction)
const IGNORE_PATTERNS = [
  /\/api\/presence\//i,
  /\/signalr\//i,
  /\/negotiate\?/i,
  /\/health\b/i,
  /\.(png|jpe?g|svg|gif|webp|woff2?|ttf|css)$/i,
]

const SENSITIVE_KEYS = [
  "password",
  "token",
  "refreshToken",
  "accessToken",
  "authorization",
  "secret",
  "pin",
  "cvv",
  "otp",
]

/**
 * Recursively sanitize objects to mask sensitive data
 */
function sanitizeData(data) {
  if (!data) return data
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data)
      return JSON.stringify(sanitizeData(parsed))
    } catch {
      // Check for Bearer token in string
      return data.replace(/Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, "Bearer [MASKED]")
    }
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }

  if (typeof data === "object") {
    const cleanObj = {}
    for (const [key, val] of Object.entries(data)) {
      if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
        cleanObj[key] = "[MASKED]"
      } else {
        cleanObj[key] = sanitizeData(val)
      }
    }
    return cleanObj
  }

  return data
}

function truncateString(str, maxLen = 1000) {
  if (!str || typeof str !== "string") return str
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + `... [Truncated ${str.length - maxLen} chars]`
}

function addNetworkEntry(entry) {
  if (networkBuffer.length >= MAX_REQUESTS) {
    networkBuffer.shift()
  }
  networkBuffer.push(entry)
}

export function initNetworkLogger() {
  if (isInitialized || typeof window === "undefined") return
  isInitialized = true

  // 1. Intercept window.fetch
  const originalFetch = window.fetch
  window.fetch = async function (...args) {
    const startTime = performance.now()
    let url = typeof args[0] === "string" ? args[0] : args[0]?.url || ""
    const options = args[1] || (typeof args[0] === "object" ? args[0] : {})
    const method = (options.method || "GET").toUpperCase()

    // Check if url should be ignored
    const isIgnored = IGNORE_PATTERNS.some((pattern) => pattern.test(url))
    
    // Don't intercept bug report submission itself to avoid loop
    if (url.includes("/api/bug-reports")) {
      return originalFetch.apply(this, args)
    }

    let requestBody = null
    if (options.body && typeof options.body === "string") {
      requestBody = truncateString(sanitizeData(options.body))
    }

    try {
      const response = await originalFetch.apply(this, args)
      const durationMs = Math.round(performance.now() - startTime)

      if (!isIgnored) {
        // Clone response to read text if status is error >= 400
        let responseBody = null
        if (!response.ok) {
          try {
            const clone = response.clone()
            const text = await clone.text()
            responseBody = truncateString(sanitizeData(text))
          } catch {
            responseBody = "[Unable to read response]"
          }
        }

        addNetworkEntry({
          timestamp: new Date().toISOString(),
          type: "fetch",
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          durationMs,
          requestBody,
          responseBody,
          ok: response.ok,
        })
      }

      return response
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime)
      if (!isIgnored) {
        addNetworkEntry({
          timestamp: new Date().toISOString(),
          type: "fetch",
          method,
          url,
          status: 0,
          statusText: "Network Error / Failed to fetch",
          durationMs,
          requestBody,
          responseBody: error.message || String(error),
          ok: false,
        })
      }
      throw error
    }
  }

  // 2. Intercept XMLHttpRequest
  const originalXhrOpen = XMLHttpRequest.prototype.open
  const originalXhrSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._reqMethod = method ? method.toUpperCase() : "GET"
    this._reqUrl = typeof url === "string" ? url : String(url)
    this._startTime = performance.now()
    return originalXhrOpen.call(this, method, url, ...rest)
  }

  XMLHttpRequest.prototype.send = function (body) {
    const isIgnored = IGNORE_PATTERNS.some((pattern) => pattern.test(this._reqUrl || ""))
    
    if (!isIgnored && !this._reqUrl?.includes("/api/bug-reports")) {
      const startTime = this._startTime || performance.now()
      let requestBody = null
      if (body && typeof body === "string") {
        requestBody = truncateString(sanitizeData(body))
      }

      this.addEventListener("loadend", () => {
        const durationMs = Math.round(performance.now() - startTime)
        let responseBody = null
        if (this.status >= 400 || this.status === 0) {
          try {
            responseBody = truncateString(sanitizeData(this.responseText))
          } catch {
            responseBody = "[Unable to read XHR response]"
          }
        }

        addNetworkEntry({
          timestamp: new Date().toISOString(),
          type: "xhr",
          method: this._reqMethod || "GET",
          url: this._reqUrl,
          status: this.status,
          statusText: this.statusText || (this.status === 0 ? "Network Error" : ""),
          durationMs,
          requestBody,
          responseBody,
          ok: this.status >= 200 && this.status < 400,
        })
      })
    }

    return originalXhrSend.call(this, body)
  }
}

export function getRawNetworkLogs() {
  return [...networkBuffer]
}
