import { getSmartErrorReportPayload } from "./logFilter"

const PENDING_CRASH_KEY = "pending_auto_bug_report"

/**
 * 1. Save auto-detected crash to localStorage with atomic pending lock
 */
export function savePendingAutoCrashReport({ failedUrl = "", status = 502 } = {}) {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return

    // Do not overwrite existing unsent report (atomic lock)
    if (localStorage.getItem(PENDING_CRASH_KEY)) return

    const telemetry = getSmartErrorReportPayload()
    const path = failedUrl || window.location.pathname || "/"

    const payload = {
      title: `Sự cố kết nối máy chủ (${status || 502}) tại ${path}`,
      description: `Sự cố máy chủ không khả dụng hoặc mất kết nối HTTP ${status || 502} từ Backend.`,
      category: "system_auto",
      severity: "high",
      url: window.location.href,
      userAgent: navigator.userAgent,
      deviceInfo: telemetry.deviceInfo,
      networkLogs: telemetry.networkLogs,
      consoleLogs: telemetry.consoleLogs,
    }

    localStorage.setItem(PENDING_CRASH_KEY, JSON.stringify(payload))
  } catch (err) {
    console.warn("[AutoCrashSync] Không thể lưu pending crash report:", err)
  }
}

/**
 * 2. Flush pending crash report to Backend API once server is alive
 * Only called on App mount (once) or when isServerDown recovers from true -> false
 */
export async function flushPendingAutoCrashReport() {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return

    const pending = localStorage.getItem(PENDING_CRASH_KEY)
    if (!pending) return

    // Immediately remove from localStorage to prevent duplicate submissions
    localStorage.removeItem(PENDING_CRASH_KEY)

    const payload = JSON.parse(pending)
    const res = await fetch("/api/bug-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      console.info("[AutoCrashSync] Đã tự động gửi báo cáo sự cố hệ thống lên Backend thành công.")
    } else {
      // If still failing, restore to localStorage for next recovery trigger
      localStorage.setItem(PENDING_CRASH_KEY, pending)
    }
  } catch {
    // Network failure during submission, retain for next attempt
  }
}
