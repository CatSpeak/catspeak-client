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

  const calculateTimeLeft = useCallback(() => {
    const diff = countdownTarget.getTime() - new Date().getTime()
    return diff > 0 ? Math.floor(diff / 1000) : 0
  }, [countdownTarget])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)
  const [prevTarget, setPrevTarget] = useState(countdownTarget)

  if (countdownTarget !== prevTarget) {
    setPrevTarget(countdownTarget)
    setTimeLeft(calculateTimeLeft())
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  const countdownTime = useMemo(() => {
    if (timeLeft <= 0) {
      return { days: "00", hours: "00", mins: "00" }
    }
    const days = Math.floor(timeLeft / (24 * 3600))
    const hours = Math.floor((timeLeft % (24 * 3600)) / 3600)
    const mins = Math.floor((timeLeft % 3600) / 60)
    return {
      days: days.toString().padStart(2, "0"),
      hours: hours.toString().padStart(2, "0"),
      mins: mins.toString().padStart(2, "0")
    }
  }, [timeLeft])

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
