import React, { useEffect, useMemo, useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const CountdownTicker = ({ targetDate }) => {
  const { t } = useLanguage()
  const ui = t.courses?.workspaceUi || {}
  const countdownTargetMs = useMemo(() => {
    if (!targetDate) return null
    const parsed = new Date(targetDate)
    const timestamp = parsed.getTime()
    return Number.isFinite(timestamp) ? timestamp : null
  }, [targetDate])
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (countdownTargetMs === null) return undefined

    let timer

    const updateCountdown = () => {
      const currentTime = Date.now()
      setNowMs(currentTime)
      const remainingMs = countdownTargetMs - currentTime
      if (remainingMs <= 0) return

      const millisecondsUntilMinuteChanges = (remainingMs % 60000) || 60000
      timer = setTimeout(
        updateCountdown,
        millisecondsUntilMinuteChanges + 50
      )
    }

    timer = setTimeout(updateCountdown, 0)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setNowMs(Date.now())
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [countdownTargetMs])

  const minutesLeft = countdownTargetMs === null
    ? null
    : Math.max(0, Math.ceil((countdownTargetMs - nowMs) / 60000))

  const countdownTime = useMemo(() => {
    if (minutesLeft === null) return null
    if (minutesLeft <= 0) {
      return { days: "00", hours: "00", mins: "00" }
    }
    const days = Math.floor(minutesLeft / (24 * 60))
    const hours = Math.floor((minutesLeft % (24 * 60)) / 60)
    const mins = minutesLeft % 60
    return {
      days: days.toString().padStart(2, "0"),
      hours: hours.toString().padStart(2, "0"),
      mins: mins.toString().padStart(2, "0")
    }
  }, [minutesLeft])

  if (countdownTargetMs === null || !countdownTime) {
    return (
      <div role="status" className="py-6 text-center text-xs font-semibold text-gray-500">
        {ui.tba || "TBA"}
      </div>
    )
  }

  return (
    <div className="flex justify-around items-center text-center py-3 border-b border-border select-none">
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.days}</span>
        <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">
          {ui.days || "Days"}
        </span>
      </div>
      <span className="text-2xl font-bold text-gray-300 -mt-5">:</span>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.hours}</span>
        <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">
          {ui.hours || "Hours"}
        </span>
      </div>
      <span className="text-2xl font-bold text-gray-300 -mt-5">:</span>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.mins}</span>
        <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">
          {ui.minutesShort || "Mins"}
        </span>
      </div>
    </div>
  )
}

export default CountdownTicker
