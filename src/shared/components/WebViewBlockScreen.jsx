import React, { useState } from "react"
import { Copy, Check, ExternalLink, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { isAndroid } from "@/shared/utils/isWebView"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils"

/**
 * Full-screen block shown when an in-app WebView browser attempts to access the application.
 *
 * @param {{ appName: string | null }} props
 *   `appName` — friendly name of the detected in-app browser (e.g. "Zalo", "Facebook")
 */
const WebViewBlockScreen = ({ appName }) => {
  const { t } = useLanguage()
  const wb = t?.rooms?.videoCall?.webviewBlock ?? {}

  const [copied, setCopied] = useState(false)
  const currentUrl = getShareUrlWithVersion(window.location.href)

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
    <div className="h-screen w-full flex flex-col items-center justify-start overflow-y-auto">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-xl p-4 sm:p-6 flex flex-col items-center text-center my-auto">
        {/* Icon */}
        <AlertTriangle className="w-14 h-14 mb-4 text-amber-500 stroke-[1.5]" />

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">
          {wb.title || "Open in Browser"}
        </h1>

        {/* Description */}
        <p className="text-sm text-[#606060] mb-6 max-w-md">
          {(
            wb.description ||
            "You're using {app}'s built-in browser, which isn't fully supported."
          ).replace("{app}", displayApp)}
        </p>

        {/* URL display box */}
        <div className="w-full max-w-md h-[56px] px-4 mb-6 bg-[#F8F9FA] border border-border rounded-xl flex items-center overflow-hidden text-left">
          <span className="whitespace-nowrap block overflow-hidden text-ellipsis select-all w-full">
            {currentUrl}
          </span>
        </div>

        {/* Action Buttons using PillButton */}
        <div className="w-full max-w-md flex flex-col gap-2 mb-6">
          <PillButton
            variant="primary"
            className="w-full"
            startIcon={copied ? <Check /> : <Copy />}
            onClick={handleCopyLink}
          >
            {copied ? wb.copied || "Copied!" : wb.copyLink || "Copy Link"}
          </PillButton>

          {isAndroid() && (
            <PillButton
              variant="secondary"
              className="w-full"
              startIcon={<ExternalLink />}
              onClick={handleOpenInChrome}
            >
              {wb.openInChrome || "Open in Chrome"}
            </PillButton>
          )}
        </div>

        {/* Steps */}
        <div className="w-full max-w-md pt-4 sm:pt-6 border-t border-border text-left">
          <p className="font-semibold mb-2">
            {wb.instruction || "How to open:"}
          </p>
          <ol className="list-decimal list-inside text-sm text-[#606060] space-y-1">
            <li>{wb.step1 || "Copy the link above"}</li>
            <li>{wb.step2 || "Open Chrome or Safari"}</li>
            <li>{wb.step3 || "Paste the link in your browser"}</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default WebViewBlockScreen
