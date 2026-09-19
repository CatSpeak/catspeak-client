import { createSpeechRecognizer, speak, stopSpeaking } from "../speech"
import { DEFAULT_SPEECH_LANG } from "../speech/constants"
import { NO_AUDIO_TIMEOUT_MS, SILENCE_LEVEL } from "./constants"
import { createMicCapture } from "./createMicCapture"

const defaultTimers = {
  setTimeout: (handler, delay) => setTimeout(handler, delay),
  clearTimeout: (id) => clearTimeout(id),
}

export const createAudioTransport = ({
  deviceId,
  lang = DEFAULT_SPEECH_LANG,
  silenceLevel = SILENCE_LEVEL,
  noAudioTimeoutMs = NO_AUDIO_TIMEOUT_MS,
  capture = createMicCapture({ deviceId }),
  createRecognizer = createSpeechRecognizer,
  speakText = speak,
  stopSpeak = stopSpeaking,
  random,
  timers = defaultTimers,
} = {}) => {
  let recognizer = null
  let status = "connecting"
  let watchdogId = null
  let peakLevel = 0
  const statusSubscribers = new Set()

  const setStatus = (next) => {
    if (next === status) return
    status = next
    statusSubscribers.forEach((subscriber) => subscriber(status))
  }

  const clearWatchdog = () => {
    if (watchdogId != null) {
      timers.clearTimeout(watchdogId)
      watchdogId = null
    }
  }

  const handleLevel = (value) => {
    if (value > peakLevel) peakLevel = value
    if (value >= silenceLevel) {
      clearWatchdog()
      setStatus("ready")
    }
  }

  const armWatchdog = () => {
    clearWatchdog()
    watchdogId = timers.setTimeout(() => {
      if (peakLevel < silenceLevel) setStatus("nosignal")
    }, noAudioTimeoutMs)
  }

  const stopListening = () => {
    if (recognizer) {
      recognizer.destroy()
      recognizer = null
    }
  }

  const start = async () => {
    const result = await capture.start()
    if (!result.ok) {
      setStatus("error")
      return result
    }
    capture.subscribeLevel(handleLevel)
    armWatchdog()
    setStatus("listening")
    return result
  }

  const startListening = ({ level, onResult, onEnd, onError } = {}) => {
    stopListening()
    recognizer = createRecognizer({ lang, level, onResult, onEnd, onError, random })
    recognizer.start()
  }

  const destroy = () => {
    clearWatchdog()
    stopListening()
    capture.destroy()
    statusSubscribers.clear()
  }

  return {
    start,
    stop: () => {
      clearWatchdog()
      capture.stop()
    },
    destroy,
    getDevices: capture.getDevices,
    getLevel: capture.getLevel,
    subscribeLevel: capture.subscribeLevel,
    getStatus: () => status,
    subscribeStatus: (subscriber) => {
      if (typeof subscriber !== "function") return () => {}
      statusSubscribers.add(subscriber)
      return () => statusSubscribers.delete(subscriber)
    },
    startRecording: capture.startRecording,
    stopRecording: capture.stopRecording,
    getRecordingUrl: capture.getRecordingUrl,
    isRecording: capture.isRecording,
    startListening,
    stopListening,
    speak: (text, options) => speakText(text, { lang, ...options }),
    stopSpeaking: () => stopSpeak(),
  }
}
