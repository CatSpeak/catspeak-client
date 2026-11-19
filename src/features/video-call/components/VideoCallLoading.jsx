import React, { useState, useEffect } from "react"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Full-screen loading overlay shown while the video call session is being prepared.
 *
 * Adheres to CatSpeak Wait Time Guidelines:
 * - Instant (< 200ms): No indicator (debounced to avoid jarring visual flashes on quick transitions)
 * - Short (200ms - 5s): Loading indicator (smooth 40x40 circular loader)
 * - Long (> 5s): Progress indicator (determinate progress track with reassuring status)
 */
const VideoCallLoading = ({ message = "Loading room..." }) => {
  const { t } = useLanguage()
  const [showIndicator, setShowIndicator] = useState(false)
  const [isLongWait, setIsLongWait] = useState(false)
  const [progress, setProgress] = useState(25)

  useEffect(() => {
    // Instant threshold (< 200ms): suppress indicator
    const instantTimer = setTimeout(() => {
      setShowIndicator(true)
    }, 200)

    // Long threshold (> 5s): escalate to progress indicator
    const longTimer = setTimeout(() => {
      setIsLongWait(true)
    }, 5000)

    return () => {
      clearTimeout(instantTimer)
      clearTimeout(longTimer)
    }
  }, [])

  // In long wait (> 5s), simulate visual progress feedback
  useEffect(() => {
    if (!isLongWait) return
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + (90 - prev) * 0.12 : prev))
    }, 600)
    return () => clearInterval(interval)
  }, [isLongWait])

  if (!showIndicator) {
    // Under 200ms: render empty background to prevent flicker on rapid completion
    return (
      <div className="fixed inset-0 z-[100] bg-primaryBg dark:bg-[#0F0F0F]" />
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primaryBg dark:bg-[#0F0F0F] text-foreground dark:text-white select-none transition-colors duration-200 px-6">
      {!isLongWait ? (
        // Short wait (200ms - 5s): Loading indicator
        <LoadingSpinner
          size="md"
          thickness={4}
          text={message}
          textClassName="mt-4 text-sm md:text-base font-medium tracking-wide text-neutral-600 dark:text-neutral-300 animate-pulse text-center px-4"
          iconClassName="text-cath-red-700 dark:text-red-500 drop-shadow-sm"
        />
      ) : (
        // Long wait (> 5s): Progress indicator
        <div className="flex flex-col items-center justify-center w-full max-w-xs animate-fadeIn">
          <LoadingSpinner
            size="md"
            thickness={4}
            className="mb-4"
            iconClassName="text-cath-red-700 dark:text-red-500 drop-shadow-sm"
          />
          <p className="text-sm md:text-base font-semibold text-neutral-800 dark:text-neutral-100 text-center">
            {message}
          </p>
          <div className="w-full mt-4">
            <ProgressBar
              progress={progress}
              heightClass="h-1.5"
              colorClass="bg-cath-red-700 dark:bg-red-500"
              trackColorClass="bg-neutral-200 dark:bg-neutral-800"
            />
          </div>
          <p className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400 text-center animate-pulse">
            {t?.rooms?.videoCall?.provider?.connectingLongWait ??
              "Đang thiết lập kết nối, vui lòng chờ trong giây lát..."}
          </p>
        </div>
      )}
    </div>
  )
}

export default VideoCallLoading
