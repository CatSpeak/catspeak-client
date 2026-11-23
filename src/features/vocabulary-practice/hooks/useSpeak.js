import { useCallback, useEffect } from "react"
import useSampleAudio from "@/features/ai-tutor/hooks/useSampleAudio"

const canSynthesize = () => typeof window !== "undefined" && "speechSynthesis" in window

/**
 * Phát âm cho Practice. Câu ví dụ chưa có file âm thanh (BE-06 sẽ trả URL) thì dùng
 * giọng đọc của trình duyệt; từ đơn thì ưu tiên giọng mẫu `audio_url` của server.
 *
 * @param {{ audioUrl?: string, text?: string, lang?: string }} p
 *   audioUrl  file mẫu từ server (cần JWT, tải qua useSampleAudio)
 *   text      đọc bằng speechSynthesis khi không có audioUrl
 */
const useSpeak = ({ audioUrl, text, lang = "zh-CN" }) => {
  const sample = useSampleAudio(audioUrl)

  const speak = useCallback(() => {
    if (audioUrl) return sample.play()
    if (!text || !canSynthesize()) return undefined
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.9
    window.speechSynthesis.speak(u)
    return undefined
  }, [audioUrl, text, lang, sample])

  useEffect(() => () => canSynthesize() && window.speechSynthesis.cancel(), [])

  return { speak, status: audioUrl ? sample.status : "idle", available: Boolean(audioUrl || (text && canSynthesize())) }
}

export default useSpeak
