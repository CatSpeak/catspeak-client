import React, { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  selectIsServerDown,
  setServerUp,
} from "@/store/slices/serverStatusSlice"
import { useLanguage } from "@/shared/context/LanguageContext"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { ServerCrash } from "lucide-react"

const RETRY_INTERVAL_SECONDS = 60

/**
 * Full-page overlay that blocks the app when the API server is unreachable.
 * Auto-pings the health endpoint every 60 seconds and clears the flag on recovery.
 */
const ServerDownScreen = () => {
  const isServerDown = useSelector(selectIsServerDown)
  const isInCall = useSelector((s) => s.videoCall.isInCall)
  const dispatch = useDispatch()
  const { t } = useLanguage()

  const [countdown, setCountdown] = useState(RETRY_INTERVAL_SECONDS)
  const [isRetrying, setIsRetrying] = useState(false)

  const healthCheck = useCallback(() => {
    setIsRetrying(true)
    window.location.reload()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!isServerDown || isInCall) return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          healthCheck()
          return RETRY_INTERVAL_SECONDS
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isServerDown, isInCall, healthCheck])

  // Reset countdown when the overlay mounts
  useEffect(() => {
    if (isServerDown) {
      setCountdown(RETRY_INTERVAL_SECONDS)
    }
  }, [isServerDown])

  if (!isServerDown || isInCall) return null

  const strings = t?.errors?.serverDown ?? {}

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="flex flex-col items-center gap-4 max-w-[400px] px-8 py-12 text-center">
        {/* Icon */}
        <div className="text-red-600 animate-pulse mb-2">
          <ServerCrash size={64} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white leading-tight">
          {strings.title || "Server Unavailable"}
        </h1>

        {/* Message */}
        <p className="text-[15px] text-gray-400 leading-relaxed mb-2">
          {strings.message ||
            "The server is temporarily down. Our technical team is working on a fix. Please wait while we restore the service."}
        </p>

        {/* Retry button */}
        <PillButton
          className="h-10 min-w-[140px] mt-2"
          onClick={healthCheck}
          loading={isRetrying}
        >
          {strings.retry || "Retry Now"}
        </PillButton>

        {/* Countdown text */}
        <p className="text-[13px] text-gray-500 mt-1">
          {(strings.autoRetry || "Auto-retrying in {{seconds}}s...").replace(
            "{{seconds}}",
            countdown,
          )}
        </p>
      </div>
    </div>
  )
}

export default ServerDownScreen
