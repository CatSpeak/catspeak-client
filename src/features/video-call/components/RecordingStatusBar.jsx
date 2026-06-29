import React, { useState, useEffect, useRef } from "react"
import { useGetStorageQuery } from "@/store/api/recordingsApi"
import { AlertTriangle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

const RecordingStatusBar = ({ isRecording, onStopRecording }) => {
  const { data: storage, refetch } = useGetStorageQuery(undefined, {
    skip: !isRecording,
  })

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const timerRef = useRef(null)

  // Timer logic
  useEffect(() => {
    if (isRecording) {
      setElapsedSeconds(0)
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setElapsedSeconds(0)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  // format time MM:SS
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  // Live Egress bitrate is ~564 kbps (500 kbps video + 64 kbps audio)
  // 564 kbps = 70.5 KB/sec = 0.0688 MB/sec
  const MB_PER_SECOND = 70.5 / 1024

  const baseUsedMb = storage?.usedMb ?? 0
  const limitMb = storage?.limitMb ?? 200

  // Calculate dynamic growth
  const sessionMb = elapsedSeconds * MB_PER_SECOND
  const totalUsedMb = Math.min(baseUsedMb + sessionMb, limitMb)
  const usagePercent = Math.min((totalUsedMb / limitMb) * 100, 100)

  const isDanger = usagePercent >= 90
  const isWarning = usagePercent >= 80 && usagePercent < 90

  // Quota auto-stop safety guard
  useEffect(() => {
    if (isRecording && totalUsedMb >= limitMb) {
      toast.error("Recording stopped automatically. CatSpeak storage limit (200MB) reached.", {
        icon: "⚠️",
        duration: 5000,
      })
      onStopRecording()
    }
  }, [isRecording, totalUsedMb, limitMb, onStopRecording])

  if (!isRecording) return null

  // Color mappings
  const progressColor = isDanger
    ? "bg-red-500 animate-pulse"
    : isWarning
      ? "bg-amber-500"
      : "bg-emerald-500"

  const textColor = isDanger
    ? "text-red-400"
    : isWarning
      ? "text-amber-400"
      : "text-gray-300"

  return (
    <div className="absolute top-4 left-4 z-[30] flex flex-col gap-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white shadow-xl max-w-[280px] w-full transition-all duration-300">
      {/* Timer and Pulse dot */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase">REC</span>
          <span className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-200">
            {formatTime(elapsedSeconds)}
          </span>
        </div>
        <div className="text-[10px] font-semibold text-gray-400">
          {totalUsedMb.toFixed(1)}MB / {limitMb.toFixed(0)}MB
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
          style={{ width: `${usagePercent}%` }}
        />
      </div>

      {/* Warnings / Status Text */}
      {isDanger && (
        <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold animate-pulse">
          <AlertTriangle size={10} />
          <span>Critical Space! Auto-stopping soon.</span>
        </div>
      )}
      {isWarning && !isDanger && (
        <div className="flex items-center gap-1 text-[9px] text-amber-400 font-semibold">
          <AlertTriangle size={10} />
          <span>Approaching CatSpeak 200MB limit.</span>
        </div>
      )}
      {!isWarning && !isDanger && (
        <div className="text-[9px] text-gray-400">
          Recording session is saved in Workspace.
        </div>
      )}
    </div>
  )
}

export default RecordingStatusBar
