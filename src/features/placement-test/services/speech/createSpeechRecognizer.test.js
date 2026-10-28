import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { HSK_BANK } from "../../constants/hskBank"
import { createSpeechRecognizer } from "./createSpeechRecognizer"

const immediateTimers = {
  setTimeout: (handler) => {
    handler()
    return 0
  },
  clearTimeout: () => {},
}

class FakeRecognition {
  static instances = []

  constructor() {
    FakeRecognition.instances.push(this)
  }

  start() {
    this.started = true
  }

  stop() {
    this.stopped = true
    this.onend?.()
  }

  abort() {
    this.aborted = true
    this.onend?.()
  }

  emitResult(results) {
    this.onresult?.({ results })
  }

  emitError(error) {
    this.onerror?.({ error })
  }
}

beforeEach(() => {
  FakeRecognition.instances = []
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("createSpeechRecognizer", () => {
  it("uses the scripted fallback when the browser has no recognition API", () => {
    const onResult = vi.fn()
    const onEnd = vi.fn()
    const recognizer = createSpeechRecognizer({
      RecognitionCtor: null,
      onResult,
      onEnd,
      level: 3,
      random: () => 0,
      timers: immediateTimers,
    })

    expect(recognizer.isSupported()).toBe(false)
    expect(recognizer.start()).toBe(false)
    expect(onResult).toHaveBeenCalledWith(HSK_BANK[3].fallbackAnswers[0].hanzi, true)
    expect(onEnd).toHaveBeenCalledWith(HSK_BANK[3].fallbackAnswers[0].hanzi)
  })

  it("emits the real transcript when the recognition API is available", () => {
    const onResult = vi.fn()
    const onEnd = vi.fn()
    const recognizer = createSpeechRecognizer({
      RecognitionCtor: FakeRecognition,
      onResult,
      onEnd,
    })

    expect(recognizer.isSupported()).toBe(true)
    expect(recognizer.start()).toBe(true)

    const instance = FakeRecognition.instances.at(-1)
    const results = [[{ transcript: "我喜欢看书" }]]
    results[0].isFinal = true
    instance.emitResult(results)
    instance.onend()

    expect(onResult).toHaveBeenCalledWith("我喜欢看书", true)
    expect(onEnd).toHaveBeenCalledWith("我喜欢看书")
  })

  it("falls back to a scripted transcript on a non speech error", () => {
    const onResult = vi.fn()
    const onEnd = vi.fn()
    const onError = vi.fn()
    const recognizer = createSpeechRecognizer({
      RecognitionCtor: FakeRecognition,
      onResult,
      onEnd,
      onError,
      level: 2,
      random: () => 0.99,
      timers: immediateTimers,
    })

    recognizer.start()
    FakeRecognition.instances.at(-1).emitError("network")

    expect(onError).toHaveBeenCalledWith("network")
    expect(onResult).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it("surfaces no-speech so the loop can retry instead of faking an answer", () => {
    const onResult = vi.fn()
    const onEnd = vi.fn()
    const onError = vi.fn()
    const recognizer = createSpeechRecognizer({
      RecognitionCtor: FakeRecognition,
      onResult,
      onEnd,
      onError,
      timers: immediateTimers,
    })

    recognizer.start()
    const instance = FakeRecognition.instances.at(-1)
    instance.emitError("no-speech")
    instance.onend()

    expect(onError).toHaveBeenCalledWith("no-speech")
    expect(onEnd).toHaveBeenCalledWith("")
    expect(onResult).not.toHaveBeenCalled()
  })

  it("finalizes a pending mock transcript on stop", () => {
    let pending = null
    const onResult = vi.fn()
    const recognizer = createSpeechRecognizer({
      RecognitionCtor: null,
      onResult,
      level: 1,
      random: () => 0,
      timers: {
        setTimeout: (handler) => {
          pending = handler
          return 1
        },
        clearTimeout: () => {
          pending = null
        },
      },
    })

    recognizer.start()
    expect(pending).toBeTypeOf("function")
    recognizer.stop()
    expect(onResult).toHaveBeenCalledTimes(1)
  })

  it("stops emitting once destroyed", () => {
    const onResult = vi.fn()
    const onEnd = vi.fn()
    const recognizer = createSpeechRecognizer({
      RecognitionCtor: FakeRecognition,
      onResult,
      onEnd,
    })

    recognizer.start()
    const instance = FakeRecognition.instances.at(-1)
    recognizer.destroy()

    const results = [["你好"]]
    results[0].isFinal = true
    instance.emitResult(results)
    instance.onend()

    expect(onResult).not.toHaveBeenCalled()
    expect(onEnd).not.toHaveBeenCalled()
  })
})
