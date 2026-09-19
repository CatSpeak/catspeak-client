import { HSK_MIN } from "../../engine/constants"
import {
  DEFAULT_SPEECH_LANG,
  MOCK_RESULT_DELAY_MS,
  SPEECH_ERRORS,
} from "./constants"
import { pickFallbackTranscript } from "./fallback"

const resolveWindow = (win) =>
  win ?? (typeof window !== "undefined" ? window : undefined)

const resolveRecognitionCtor = (win) =>
  win?.SpeechRecognition || win?.webkitSpeechRecognition || null

const defaultTimers = {
  setTimeout: (handler, delay) => setTimeout(handler, delay),
  clearTimeout: (id) => clearTimeout(id),
}

const readResults = (event) => {
  const results = event?.results
  if (!results || results.length === 0) {
    return { transcript: "", isFinal: false }
  }
  let transcript = ""
  for (let index = 0; index < results.length; index += 1) {
    transcript += results[index]?.[0]?.transcript || ""
  }
  return {
    transcript: transcript.trim(),
    isFinal: Boolean(results[results.length - 1]?.isFinal),
  }
}

export const createSpeechRecognizer = ({
  lang = DEFAULT_SPEECH_LANG,
  onResult,
  onError,
  onEnd,
  level = HSK_MIN,
  random = Math.random,
  RecognitionCtor,
  win,
  timers = defaultTimers,
  mockDelayMs = MOCK_RESULT_DELAY_MS,
  fallbackOnError = true,
} = {}) => {
  const targetWindow = resolveWindow(win)
  const Ctor =
    RecognitionCtor === undefined
      ? resolveRecognitionCtor(targetWindow)
      : RecognitionCtor
  const supported = Boolean(Ctor)

  let recognition = null
  let active = false
  let destroyed = false
  let usingMock = false
  let mockTimerId = null
  let finalTranscript = ""

  const safeCall = (handler, ...args) => {
    if (typeof handler !== "function") return
    try {
      handler(...args)
    } catch {
      return
    }
  }

  const clearMock = () => {
    if (mockTimerId != null) {
      timers.clearTimeout(mockTimerId)
      mockTimerId = null
    }
  }

  const emitMock = () => {
    mockTimerId = null
    if (destroyed) return
    const transcript = pickFallbackTranscript({ level, random })
    finalTranscript = transcript
    active = false
    safeCall(onResult, transcript, true)
    safeCall(onEnd, transcript)
  }

  const startMock = () => {
    usingMock = true
    active = true
    finalTranscript = ""
    clearMock()
    mockTimerId = timers.setTimeout(emitMock, mockDelayMs)
  }

  const handleEnd = () => {
    if (destroyed || usingMock) return
    active = false
    safeCall(onEnd, finalTranscript)
  }

  const handleError = (event) => {
    const code = event?.error || SPEECH_ERRORS.UNSUPPORTED
    safeCall(onError, code)
    if (destroyed) return
    if (code === SPEECH_ERRORS.NO_SPEECH) return
    if (!fallbackOnError) return
    startMock()
  }

  const handleResult = (event) => {
    if (destroyed || usingMock) return
    const { transcript, isFinal } = readResults(event)
    if (isFinal) finalTranscript = transcript
    safeCall(onResult, transcript, isFinal)
  }

  const start = () => {
    if (destroyed) return false
    if (active) return !usingMock
    if (!Ctor) {
      startMock()
      return false
    }
    try {
      recognition = new Ctor()
      recognition.lang = lang
      recognition.continuous = false
      recognition.interimResults = true
      recognition.onresult = handleResult
      recognition.onerror = handleError
      recognition.onend = handleEnd
      recognition.start()
      active = true
      usingMock = false
      finalTranscript = ""
      return true
    } catch {
      recognition = null
      startMock()
      return false
    }
  }

  const stop = () => {
    clearMock()
    if (usingMock) {
      if (active) emitMock()
      return
    }
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        return
      }
    }
  }

  const destroy = () => {
    destroyed = true
    active = false
    clearMock()
    if (recognition) {
      const target = recognition
      recognition = null
      try {
        target.abort()
      } catch {
        return
      }
    }
  }

  return { start, stop, destroy, isSupported: () => supported }
}
