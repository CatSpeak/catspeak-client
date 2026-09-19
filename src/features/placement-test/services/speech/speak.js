import { DEFAULT_SPEECH_LANG } from "./constants"

const resolveWindow = (win) =>
  win ?? (typeof window !== "undefined" ? window : undefined)

export const speak = (text, { lang = DEFAULT_SPEECH_LANG, win, rate = 1 } = {}) => {
  const target = resolveWindow(win)
  const synth = target?.speechSynthesis
  const Utterance = target?.SpeechSynthesisUtterance
  if (!synth || !Utterance || !text) return false
  try {
    synth.cancel()
    const utterance = new Utterance(text)
    utterance.lang = lang
    utterance.rate = rate
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
    // speech synthesis can be unavailable in some browsers
  }
}
