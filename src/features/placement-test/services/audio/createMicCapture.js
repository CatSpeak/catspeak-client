import { ANALYSER_FFT_SIZE, LEVEL_NOTIFY_INTERVAL_MS } from "./constants"
import { bytesToUnitSamples, computeLevel } from "./rms"

export const createMicCapture = ({ deviceId } = {}) => {
  let stream = null
  let audioContext = null
  let analyser = null
  let sourceNode = null
  let recorder = null
  let chunks = []
  let recordingUrl = null
  let recordedBlob = null
  let frameId = null
  let sampleBuffer = null
  let level = 0
  let lastNotifyAt = 0
  let destroyed = false
  let muted = false

  const levelSubscribers = new Set()

  const isSupported = () =>
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)

  const notifyLevel = (value) => {
    level = value
    const now = Date.now()
    if (now - lastNotifyAt < LEVEL_NOTIFY_INTERVAL_MS) return
    lastNotifyAt = now
    levelSubscribers.forEach((subscriber) => subscriber(value))
  }

  // Báo ngay khi tắt tiếng, không chờ nhịp notifyLevel 60ms: meter phải về 0
  // cùng lúc với track bị khoá.
  const emitLevel = (value) => {
    level = value
    lastNotifyAt = Date.now()
    levelSubscribers.forEach((subscriber) => subscriber(value))
  }

  const measure = () => {
    if (!analyser || destroyed) return
    if (muted) {
      notifyLevel(0)
    } else if (typeof analyser.getFloatTimeDomainData === "function") {
      if (!sampleBuffer) sampleBuffer = new Float32Array(analyser.fftSize)
      analyser.getFloatTimeDomainData(sampleBuffer)
      notifyLevel(computeLevel(sampleBuffer))
    } else {
      const bytes = new Uint8Array(analyser.fftSize)
      analyser.getByteTimeDomainData(bytes)
      notifyLevel(computeLevel(bytesToUnitSamples(bytes)))
    }
    frameId = window.requestAnimationFrame(measure)
  }

  const getDevices = async () => {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.mediaDevices?.enumerateDevices !== "function"
    ) {
      return []
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter((device) => device.kind === "audioinput")
    } catch {
      return []
    }
  }

  // Không xét track.enabled: track bị tắt tiếng vẫn là stream đang sống.
  const isStreamActive = () =>
    Boolean(
      stream &&
        stream.getAudioTracks().length > 0 &&
        stream.getAudioTracks().some((t) => t.readyState === "live"),
    )

  const applyMuted = () => {
    if (!stream) return
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !muted
    })
  }

  const setMuted = (value) => {
    muted = Boolean(value)
    applyMuted()
    if (muted) emitLevel(0)
    return muted
  }

  const isMuted = () => muted

  const start = async () => {
    if (destroyed) return { ok: false, error: "destroyed" }
    if (isStreamActive()) return { ok: true }
    if (!isSupported()) return { ok: false, error: "unsupported" }

    try {
      const audioConstraint =
        !deviceId || deviceId === "default"
          ? true
          : { deviceId: { ideal: deviceId } }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraint,
      })
    } catch (error) {
      return { ok: false, error: error?.name || "getUserMedia" }
    }

    if (destroyed) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
      return { ok: false, error: "destroyed" }
    }

    applyMuted()

    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext
      if (AudioContextCtor) {
        audioContext = new AudioContextCtor()
        sourceNode = audioContext.createMediaStreamSource(stream)
        analyser = audioContext.createAnalyser()
        analyser.fftSize = ANALYSER_FFT_SIZE
        sourceNode.connect(analyser)
        frameId = window.requestAnimationFrame(measure)
      }
    } catch {
      analyser = null
    }

    return { ok: true }
  }

  const stop = () => {
    if (frameId && typeof window !== "undefined") {
      window.cancelAnimationFrame(frameId)
      frameId = null
    }
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop()
      } catch {
        recorder = null
      }
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
  }

  const getLevel = () => level

  const subscribeLevel = (subscriber) => {
    if (typeof subscriber !== "function") return () => {}
    levelSubscribers.add(subscriber)
    return () => levelSubscribers.delete(subscriber)
  }

  const startRecording = async () => {
    if (destroyed) return false
    if (!isStreamActive()) {
      const startResult = await start()
      if (!startResult.ok || !stream) {
        return false
      }
    }
    if (typeof MediaRecorder === "undefined") return false

    try {
      chunks = []
      recordedBlob = null

      let options = {}
      if (typeof MediaRecorder.isTypeSupported === "function") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" }
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/webm" }
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" }
        }
      }

      recorder = new MediaRecorder(stream, options)
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data)
      }
      recorder.start(100)
      return true
    } catch {
      recorder = null
      return false
    }
  }

  const stopRecording = () =>
    new Promise((resolve) => {
      if (!recorder || recorder.state === "inactive") {
        resolve(recordingUrl)
        return
      }
      recorder.onstop = () => {
        const type = recorder?.mimeType || "audio/webm"
        recordedBlob = new Blob(chunks, { type })
        if (recordingUrl) URL.revokeObjectURL(recordingUrl)
        recordingUrl = URL.createObjectURL(recordedBlob)
        resolve(recordingUrl)
      }
      try {
        recorder.stop()
      } catch {
        resolve(recordingUrl)
      }
    })

  const getRecordingUrl = () => recordingUrl
  const getRecordedBlob = () => recordedBlob

  const destroy = () => {
    destroyed = true
    stop()
    if (audioContext) {
      audioContext.close().catch(() => {})
      audioContext = null
    }
    analyser = null
    sourceNode = null
    recorder = null
    chunks = []
    recordedBlob = null
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl)
      recordingUrl = null
    }
    levelSubscribers.clear()
  }

  return {
    start,
    stop,
    getLevel,
    getDevices,
    startRecording,
    stopRecording,
    getRecordingUrl,
    getRecordedBlob,
    subscribeLevel,
    isRecording: () => Boolean(recorder && recorder.state === "recording"),
    setMuted,
    isMuted,
    destroy,
  }
}
