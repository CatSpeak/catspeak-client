import React, { useState, useEffect, useMemo, useCallback } from "react"

const CountdownTicker = ({ targetDate }) => {
  const countdownTarget = useMemo(() => {
    if (targetDate) {
      const parsed = new Date(targetDate)
      if (!isNaN(parsed.getTime())) return parsed
    }
    const target = new Date()
    target.setDate(target.getDate() + 12)
    target.setHours(target.getHours() + 9)
    target.setMinutes(target.getMinutes() + 9)
    target.setSeconds(target.getSeconds() + 9)
    return target
  }, [targetDate])

  const calculateMinutesLeft = useCallback(() => {
    const diff = countdownTarget.getTime() - Date.now()
    return diff > 0 ? Math.floor(diff / 60000) : 0
  }, [countdownTarget])

  const [minutesLeft, setMinutesLeft] = useState(calculateMinutesLeft)

  useEffect(() => {
    let timer

    const updateCountdown = () => {
      const remainingMs = countdownTarget.getTime() - Date.now()
      const nextMinutesLeft = remainingMs > 0 ? Math.floor(remainingMs / 60000) : 0
      setMinutesLeft(nextMinutesLeft)

      if (nextMinutesLeft <= 0) return

      const millisecondsUntilMinuteChanges = remainingMs % 60000
      timer = setTimeout(
        updateCountdown,
        millisecondsUntilMinuteChanges > 0 ? millisecondsUntilMinuteChanges + 10 : 10
      )
    }

    updateCountdown()
    return () => clearTimeout(timer)
  }, [countdownTarget])

  const countdownTime = useMemo(() => {
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

  return (
    <div className="flex justify-around items-center text-center py-3 border-b border-gray-100 select-none">
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.days}</span>
        <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">Days</span>
      </div>
      <span className="text-2xl font-bold text-gray-300 -mt-5">:</span>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.hours}</span>
        <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">Hours</span>
      </div>
      <span className="text-2xl font-bold text-gray-300 -mt-5">:</span>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-gray-950 leading-none">{countdownTime.mins}</span>
        <span className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wider">Mins</span>
      </div>
    </div>
  )
}

export default CountdownTicker
