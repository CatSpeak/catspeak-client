import { getRawConsoleLogs } from "./consoleLogger"
import { getRawNetworkLogs } from "./networkLogger"

export function getDeviceInfo() {
  if (typeof window === "undefined") return {}

  const ua = navigator.userAgent
  let browser = "Unknown Browser"
  let os = "Unknown OS"

  // Detect OS
  if (ua.includes("Win")) os = "Windows"
  else if (ua.includes("Mac")) os = "macOS"
  else if (ua.includes("Linux")) os = "Linux"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("like Mac")) os = "iOS"

  // Detect Browser
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome"
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari"
  else if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("Edg")) browser = "Edge"

  return {
    os,
    browser,
    userAgent: ua,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language || "en",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currentUrl: window.location.href,
    pathname: window.location.pathname,
  }
}

/**
 * Filter and extract smart error report summary:
 * - Real server errors (5xx, status 0, network timeout/refused) -> System Bugs
 * - Business/Validation responses (4xx) -> Business Responses (expected BE messages, not system crashes)
 * - Console runtime errors & uncaught exceptions
 * - Last 5 breadcrumb requests/logs
 */
export function extractRelevantLogs() {
  const allConsole = getRawConsoleLogs()
  const allNetwork = getRawNetworkLogs()

  // 1. Filter critical console errors
  const consoleErrors = allConsole.filter((l) => l.level === "error")

  // 2. Intelligently separate Real Server Errors vs Expected 4xx Business Validation Responses
  const serverErrors = []
  const businessResponses = []

  for (const req of allNetwork) {
    if (req.status >= 500 || req.status === 0 || (req.ok === false && (req.status === undefined || req.status === null))) {
      serverErrors.push(req)
    } else if (req.status >= 400 && req.status < 500) {
      businessResponses.push(req)
    }
  }

  // 3. Get last 5 network calls & last 5 logs as context breadcrumbs
  const recentNetworkBreadcrumbs = allNetwork.slice(-5)
  const recentConsoleBreadcrumbs = allConsole.slice(-5)

  // 4. Combine into structured objects
  const networkReport = {
    serverErrors,
    businessResponses,
    failedRequests: [...serverErrors, ...businessResponses],
    recentBreadcrumbs: recentNetworkBreadcrumbs,
    totalCaptured: allNetwork.length,
    serverErrorCount: serverErrors.length,
    businessResponseCount: businessResponses.length,
  }

  const consoleReport = {
    errors: consoleErrors,
    recentBreadcrumbs: recentConsoleBreadcrumbs,
    totalCaptured: allConsole.length,
    errorCount: consoleErrors.length,
  }

  // 5. Determine smart severity
  let suggestedSeverity = "low"
  if (serverErrors.length > 0 || consoleErrors.length > 0) {
    suggestedSeverity = "high"
  } else if (businessResponses.length > 0) {
    suggestedSeverity = "medium"
  }

  return {
    device: getDeviceInfo(),
    network: networkReport,
    console: consoleReport,
    suggestedSeverity,
    deviceInfo: JSON.stringify(getDeviceInfo()),
    consoleLogs: JSON.stringify(consoleReport),
    networkLogs: JSON.stringify(networkReport),
    rawConsoleErrors: consoleErrors,
    rawServerErrors: serverErrors,
    rawBusinessResponses: businessResponses,
  }
}

export const getSmartErrorReportPayload = extractRelevantLogs
