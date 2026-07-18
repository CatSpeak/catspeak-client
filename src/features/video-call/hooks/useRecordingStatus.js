import { useState, useEffect, useRef } from "react"
import { useGetStorageQuery } from "@/store/api/recordingsApi"
import toast from "react-hot-toast"

export const useRecordingStatus = (isRecording, onStopRecording) => {
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
