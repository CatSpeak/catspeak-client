import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { SILENCE_LEVEL } from "../services/audio/constants"

const BAR_COUNT = 16
const FULL_SCALE = SILENCE_LEVEL * 4

const BAR_TONES = {
  primary: "bg-cath-red-700/70",
  muted: "bg-slate-300",
  danger: "bg-red-300",
}

const MicLevelMeter = ({ level = 0, tone = "muted", active = false }) => {
  const [bars, setBars] = useState(() =>
    Array.from({ length: BAR_COUNT }, () => 0.06),
  )
  const smoothedRef = useRef(0.06)

  useEffect(() => {
    const normalized = Math.min(1, level / FULL_SCALE)
    smoothedRef.current = smoothedRef.current * 0.6 + normalized * 0.4
    setBars((previous) => [
      ...previous.slice(1),
      Math.max(0.06, smoothedRef.current),
    ])
  }, [level])

  return (
    <div
      className={cn(
        "flex h-16 items-center justify-center gap-1 rounded-xl px-5 transition-colors",
        active ? "bg-[#FFF1F2]" : "bg-slate-50",
      )}
      aria-hidden="true"
    >
      {bars.map((value, index) => (
        <span
          key={index}
          className={cn("w-1.5 rounded-full transition-all", BAR_TONES[tone] || BAR_TONES.muted)}
          style={{ height: `${Math.round(value * 44)}px` }}
        />
      ))}
    </div>
  )
}

export default MicLevelMeter
