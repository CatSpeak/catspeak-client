import React, { useState } from "react"
import { Copy, Check, ExternalLink, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { isAndroid } from "@/shared/utils/isWebView"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import "./WebViewBlockScreen.css"

/**
 * Full-screen block shown when a WebView browser tries to access a video call.
 *
 * @param {{ appName: string | null }} props
 *   `appName` — friendly name of the detected in-app browser (e.g. "Zalo")
 */
const WebViewBlockScreen = ({ appName }) => {
  const { t } = useLanguage()
  const wb = t.rooms.videoCall.webviewBlock ?? {}

  const [copied, setCopied] = useState(false)
  const currentUrl = window.location.href

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for WebViews that block clipboard API
      const textarea = document.createElement("textarea")
      textarea.value = currentUrl
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleOpenInChrome = () => {
    // Android intent:// scheme to open in Chrome
    const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`
    window.location.href = intentUrl
  }

  const displayApp = appName || wb.genericApp || "this app"

  return (
    <div className="webview-block-screen">
      <div className="webview-block-lang-switcher">
        <LanguageSwitcher />
      </div>
      <div className="webview-block-card">
        {/* Icon */}
        <div className="webview-block-icon">
          <AlertTriangle size={32} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="webview-block-title">
          {wb.title || "Open in Browser"}
        </h1>

        {/* Description */}
        <p className="webview-block-description">
          {(wb.description || "You're using {app}'s built-in browser, which doesn't support video calls properly.").replace("{app}", displayApp)}
        </p>

        {/* URL display */}
        <div className="webview-block-url-box">
          <span className="webview-block-url-text">{currentUrl}</span>
        </div>

        {/* Copy button */}
        <button
          type="button"
          className={`webview-block-copy-btn ${copied ? "copied" : ""}`}
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <Check size={18} />
              <span>{wb.copied || "Copied!"}</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span>{wb.copyLink || "Copy Link"}</span>
            </>
          )}
        </button>

        {/* Android: Open in Chrome shortcut */}
        {isAndroid() && (
          <button
            type="button"
            className="webview-block-chrome-btn"
            onClick={handleOpenInChrome}
          >
            <ExternalLink size={18} />
            <span>{wb.openInChrome || "Open in Chrome"}</span>
          </button>
        )}

        {/* Steps */}
        <div className="webview-block-steps">
          <p className="webview-block-steps-heading">
            {wb.instruction || "How to join:"}
          </p>
          <ol className="webview-block-steps-list">
            <li>{wb.step1 || "Copy the link above"}</li>
            <li>{wb.step2 || "Open Chrome or Safari"}</li>
            <li>{wb.step3 || "Paste the link and join the call"}</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default WebViewBlockScreen
