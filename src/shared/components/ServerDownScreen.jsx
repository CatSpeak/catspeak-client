import React, { useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  selectIsServerDown,
  setServerUp,
} from "@/store/slices/serverStatusSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ServerCrash } from "lucide-react"
import toast from "react-hot-toast"
import { checkIsServerHealthy } from "@/shared/utils/healthCheck"

const POLLING_INTERVAL_MS = 5000 // 5 seconds

/**
 * Full-page overlay that blocks the app when the API server is unreachable.
 * Polls the /api/health endpoint every 5 seconds and reloads on recovery.
 * Respects active video calls by not blocking the screen and avoiding forced reloads.
 */
const ServerDownScreen = () => {
  const dispatch = useDispatch()
  const isServerDown = useSelector(selectIsServerDown)
  const isInCall = useSelector((state) => state.videoCall?.isInCall)
  const { t } = useLanguage()

  const checkHealth = useCallback(async () => {
    // When polling in the background while the screen is shown,
    // we don't need retries because setInterval handles it.
    // We pass 0 retries here so it checks quickly.
    const isHealthy = await checkIsServerHealthy(0)
    if (isHealthy) {
      dispatch(setServerUp())
      toast.success(t?.auth?.serverConnectionRestored || "Server connection restored!", { duration: 4000 })
    }
  }, [dispatch, t])

  // Start polling when server is down
  useEffect(() => {
    if (!isServerDown || isInCall) return

    // Immediately trigger a health check, then start polling
    const interval = setInterval(checkHealth, POLLING_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isServerDown, checkHealth])

  // Do not block the UI if the user is actively in a video call,
  // since LiveKit runs on a separate server and the call can continue.
  if (!isServerDown || isInCall) return null

  const strings = t?.errors?.serverDown ?? {}

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="flex flex-col items-center gap-4 max-w-[400px] px-8 py-12 text-center">
        {/* Icon */}
        <div className="text-blue-500 animate-pulse mb-2">
          <ServerCrash size={64} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white leading-tight">
          {strings.title || "System Update"}
        </h1>

        {/* Message */}
        <p className="text-[15px] text-gray-400 leading-relaxed mb-2">
          {strings.message ||
            "The system is currently being updated to a new version. Please wait a moment..."}
        </p>

        {/* Spinner */}
        <div className="mt-4 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}

export default ServerDownScreen
