import React, { useEffect, useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const PANEL =
  "flex min-h-[420px] flex-1 flex-col items-center justify-center gap-3 border-t border-border dark:border-darkBorder bg-[#090c18] px-6 text-center text-white"

/**
 * Standardized loading state for Vocabulary Galaxy adhering to CatSpeak Loading Guidelines:
 * - Instant (< 200ms): Suppress indicator (keeps steady panel background to avoid jarring flash).
 * - Short (200ms - 5s): Circular indeterminate spinner with status message.
 * - Long (> 5s): Transitions status text to reassurance message.
 */
export default function GalaxyLoading({ className = "" }) {
  const { t } = useLanguage()
  const g = t?.vocabularyGalaxy || {}
  const [showIndicator, setShowIndicator] = useState(false)
  const [isLongWait, setIsLongWait] = useState(false)

  useEffect(() => {
    // Instant (< 200ms): suppress indicator to prevent flicker on rapid completion
    const instantTimer = setTimeout(() => setShowIndicator(true), 200)
    // Long (> 5s): escalate to reassurance message
    const longTimer = setTimeout(() => setIsLongWait(true), 5000)
    return () => {
      clearTimeout(instantTimer)
      clearTimeout(longTimer)
    }
  }, [])

  return (
    <div className={`${PANEL} ${className}`.trim()}>
      {showIndicator && (
        <LoadingSpinner
          text={
            isLongWait
              ? g.loadingLong ||
                "Đang kết nối và đồng bộ ngân hà từ vựng... Vui lòng đợi trong giây lát."
              : g.loading || "Đang tải từ vựng của bạn..."
          }
          textClassName="mt-2 text-sm text-neutral-400"
        />
      )}
    </div>
  )
}
