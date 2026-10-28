import { DEFAULT_SPEECH_LANG } from "./constants"

const resolveWindow = (win) =>
  win ?? (typeof window !== "undefined" ? window : undefined)

// onEnd chạy khi đọc xong hoặc lỗi thật; bị stopSpeaking() cắt ngang thì không gọi.
export const speak = (
  text,
  { lang = DEFAULT_SPEECH_LANG, win, rate = 1, onEnd } = {},
) => {
  const target = resolveWindow(win)
  const synth = target?.speechSynthesis
  const Utterance = target?.SpeechSynthesisUtterance
  if (!synth || !Utterance || !text) return false
  try {
    synth.cancel()
    const utterance = new Utterance(text)
    utterance.lang = lang
    utterance.rate = rate
    let done = false
    const finish = (event) => {
      if (done) return
      const reason = event?.error
      if (reason === "canceled" || reason === "interrupted") return
      done = true
      if (typeof onEnd === "function") onEnd()
    }
    utterance.onend = finish
    utterance.onerror = finish
    synth.speak(utterance)
    return true
  } catch {
    return false
  }
}

export const stopSpeaking = ({ win } = {}) => {
  const target = resolveWindow(win)
  try {
    target?.speechSynthesis?.cancel()
  } catch {
    return
  }
}
