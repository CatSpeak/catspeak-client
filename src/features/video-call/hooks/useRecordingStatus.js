import { useState, useEffect, useRef } from "react"
import { useGetStorageQuery } from "@/store/api/recordingsApi"
import toast from "react-hot-toast"

export const useRecordingStatus = (isRecording, onStopRecording, sessionId) => {
  const { data: storage } = useGetStorageQuery(sessionId ?? undefined, {
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

  // limitMb = 0 means "no limit configured" — treat as unlimited.
  // limitMb = null means "API not loaded yet" — also skip enforcement.
  const rawLimitMb = storage?.limitMb
  const limitMb = rawLimitMb != null ? rawLimitMb : null

  // Calculate dynamic estimated usage
  const sessionMb = elapsedSeconds * MB_PER_SECOND
  const totalUsedMb =
    limitMb != null && limitMb > 0
      ? Math.min(baseUsedMb + sessionMb, limitMb)
      : baseUsedMb + sessionMb

  const usagePercent =
    limitMb != null && limitMb > 0
      ? Math.min((totalUsedMb / limitMb) * 100, 100)
      : 0

  const isDanger = usagePercent >= 90
  const isWarning = usagePercent >= 80 && usagePercent < 90

  // Quota auto-stop safety guard — only fire when there is a real limit > 0
  useEffect(() => {
    if (isRecording && limitMb != null && limitMb > 0 && totalUsedMb >= limitMb) {
      toast.error(
        `Recording stopped automatically. CatSpeak storage limit (${limitMb}MB) reached.`,
        { icon: "⚠️", duration: 5000 },
      )
      onStopRecording?.()
    }
  }, [isRecording, totalUsedMb, limitMb, onStopRecording])

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    totalUsedMb,
    limitMb,
    usagePercent,
    isDanger,
    isWarning,
  }
}
