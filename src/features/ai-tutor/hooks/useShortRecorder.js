import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Thu một đoạn ngắn cho nút "Luyện lại âm này" ở ss12 (FR-SS-017).
 *
 * Bấm lần một bắt đầu, bấm lần hai dừng; quên bấm thì tự dừng sau maxMs. Blob ra
 * là webm/opus (hoặc ogg trên Firefox, mp4 trên Safari); ai-api giải mã bằng PyAV
 * nên không cần chuyển sang WAV ở trình duyệt.
 */
const pickMimeType = () => {
  if (typeof MediaRecorder === "undefined") return ""
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"]
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t)) || ""
}

const useShortRecorder = ({ maxMs = 4000, onDone } = {}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState(null)
  const recorderRef = useRef(null)
  const timerRef = useRef(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const cleanup = () => {
    window.clearTimeout(timerRef.current)
    const rec = recorderRef.current
    rec?.stream?.getTracks?.().forEach((t) => t.stop())
    recorderRef.current = null
  }

  const stop = useCallback(() => {
    const rec = recorderRef.current
    if (rec && rec.state !== "inactive") rec.stop()
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("unsupported")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickMimeType()
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks = []
      rec.ondataavailable = (e) => e.data?.size && chunks.push(e.data)
      rec.onstop = () => {
        setIsRecording(false)
        const blob = new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" })
        cleanup()
        if (blob.size) onDoneRef.current?.(blob)
      }
      recorderRef.current = rec
      rec.start()
      setIsRecording(true)
      timerRef.current = window.setTimeout(stop, maxMs)
    } catch (e) {
      setError(e?.name === "NotAllowedError" ? "permission" : "failed")
      cleanup()
      setIsRecording(false)
    }
  }, [maxMs, stop])

  const toggle = useCallback(() => (recorderRef.current ? stop() : start()), [start, stop])

  useEffect(() => cleanup, [])

  return { isRecording, error, start, stop, toggle }
}

export default useShortRecorder
