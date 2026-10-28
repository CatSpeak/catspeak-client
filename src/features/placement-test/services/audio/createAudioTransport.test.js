import { describe, expect, it, vi } from "vitest"
import { createAudioTransport } from "./createAudioTransport"

const createFakeCapture = () => {
  const levelSubscribers = new Set()
  return {
    start: vi.fn(async () => ({ ok: true })),
    stop: vi.fn(),
    destroy: vi.fn(),
    getDevices: vi.fn(async () => []),
    getLevel: vi.fn(() => 0),
    subscribeLevel: vi.fn((subscriber) => {
      levelSubscribers.add(subscriber)
      return () => levelSubscribers.delete(subscriber)
    }),
    startRecording: vi.fn(() => true),
    stopRecording: vi.fn(async () => "blob:recording"),
    getRecordingUrl: vi.fn(() => null),
    isRecording: vi.fn(() => false),
    emitLevel: (value) => levelSubscribers.forEach((subscriber) => subscriber(value)),
  }
}

describe("createAudioTransport", () => {
  it("starts the mic and mirrors level/status through subscriptions", async () => {
    const capture = createFakeCapture()
    const transport = createAudioTransport({
      capture,
      timers: { setTimeout: () => 1, clearTimeout: () => {} },
    })
    const statuses = []
    transport.subscribeStatus((status) => statuses.push(status))

    await transport.start()

    expect(capture.start).toHaveBeenCalledTimes(1)
    expect(transport.getStatus()).toBe("listening")

    capture.emitLevel(0.02)
    expect(transport.getStatus()).toBe("ready")
    expect(statuses).toContain("listening")
    expect(statuses).toContain("ready")
  })

  it("marks nosignal when the watchdog elapses without a level", async () => {
    const capture = createFakeCapture()
    let fire = null
    const transport = createAudioTransport({
      capture,
      timers: {
        setTimeout: (handler) => {
          fire = handler
          return 1
        },
        clearTimeout: () => {},
      },
    })

    await transport.start()
    fire()

    expect(transport.getStatus()).toBe("nosignal")
  })

  it("reports error when the microphone cannot start", async () => {
    const capture = createFakeCapture()
    capture.start = vi.fn(async () => ({ ok: false, error: "denied" }))
    const transport = createAudioTransport({ capture })

    const result = await transport.start()

    expect(result.ok).toBe(false)
    expect(transport.getStatus()).toBe("error")
  })

  it("drives a recognizer over the injected speech seam", () => {
    const capture = createFakeCapture()
    const recognizer = {
      start: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
      isSupported: () => true,
    }
    const createRecognizer = vi.fn(() => recognizer)
    const transport = createAudioTransport({ capture, createRecognizer })
    const onResult = vi.fn()

    transport.startListening({ level: 3, onResult })

    expect(createRecognizer).toHaveBeenCalledWith(
      expect.objectContaining({ level: 3, onResult }),
    )
    expect(recognizer.start).toHaveBeenCalledTimes(1)

    transport.startListening({ level: 4 })
    expect(recognizer.destroy).toHaveBeenCalledTimes(1)

    transport.stopListening()
    expect(recognizer.destroy).toHaveBeenCalledTimes(2)
  })

  it("delegates speech synthesis to the injected speak functions", () => {
    const capture = createFakeCapture()
    const speakText = vi.fn(() => true)
    const stopSpeak = vi.fn()
    const transport = createAudioTransport({
      capture,
      speakText,
      stopSpeak,
      lang: "zh-CN",
    })

    transport.speak("你好")
    expect(speakText).toHaveBeenCalledWith("你好", { lang: "zh-CN" })

    transport.stopSpeaking()
    expect(stopSpeak).toHaveBeenCalledTimes(1)
  })
})
