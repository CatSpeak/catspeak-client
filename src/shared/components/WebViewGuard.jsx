import React, { useMemo } from "react"
import { detectWebView } from "@/shared/utils/isWebView"
import WebViewBlockScreen from "@/shared/components/WebViewBlockScreen"

/**
 * Global guard component that intercepts rendering when the app is accessed
 * via an in-app WebView browser (Zalo, Facebook, Messenger, Instagram, TikTok, etc.).
 */
const WebViewGuard = ({ children }) => {
  const webviewState = useMemo(() => detectWebView(), [])

  if (webviewState.isWebView) {
    return <WebViewBlockScreen appName={webviewState.appName} />
  }

  return children
}

export default WebViewGuard
