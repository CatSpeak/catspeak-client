import { useEffect } from "react"
import { flushPendingAutoCrashReport } from "@/shared/utils/telemetry/autoCrashSync"

/**
 * Headless component mounted at App root to flush any pending auto crash reports
 * that were saved in localStorage before user refreshed (F5) or reopened the browser.
 * Executes exactly ONCE on mount.
 */
export default function AutoCrashReporterSync() {
  useEffect(() => {
    flushPendingAutoCrashReport()
  }, [])

  return null
}
