import { useCallback, useEffect, useRef, useState } from "react"
import { useLazyGetSpeakingAudioUrlQuery } from "../api/speakingPedagogyApi"

/**
 * Phát giọng mẫu của một thẻ (`audio_url` do server trả, /v1/speaking/sample-audio).
 *
 * Endpoint cần JWT nên không gán thẳng vào <audio src>: tải qua RTK Query thành
 * blob URL (cache 5 phút, dùng chung với ss12).
 *
 * status: idle | loading | playing | error. "error" là tải lỗi hoặc file hỏng
 * (E-FC-003). Trình duyệt chặn tự phát (NotAllowedError) không tính là lỗi.
 */
const useSampleAudio = (audioPath) => {
  const [loadAudio] = useLazyGetSpeakingAudioUrlQuery()
  const [status, setStatus] = useState("idle")
  const audioRef = useRef(null)

  const play = useCallback(async () => {
    if (!audioPath) {
      setStatus("error")
      return
    }
    setStatus("loading")
    try {
      const url = await loadAudio(audioPath, true).unwrap()
      audioRef.current?.pause()
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => setStatus("idle")
      audio.onerror = () => setStatus("error")
      await audio.play()
      setStatus("playing")
    } catch (err) {
      setStatus(err?.name === "NotAllowedError" ? "idle" : "error")
    }
  }, [audioPath, loadAudio])

  useEffect(() => () => audioRef.current?.pause(), [])

  return { status, play }
}

export default useSampleAudio
