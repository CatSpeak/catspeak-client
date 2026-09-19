import { useCallback, useEffect, useRef, useState } from "react"
import { createMicCapture } from "../services/audio"
import { NO_AUDIO_TIMEOUT_MS, SILENCE_LEVEL } from "../services/audio/constants"

const useMicCapture = () => {
  const captureRef = useRef(null)
  const watchdogRef = useRef(null)
  const peakLevelRef = useRef(0)
  const recordStartedAtRef = useRef(0)

  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState("")
  const [level, setLevel] = useState(0)
  const [status, setStatus] = useState("connecting")
  const [recording, setRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState(null)
  const [recordingMs, setRecordingMs] = useState(0)
  const [sessionKey, setSessionKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    createMicCapture()
      .getDevices()
      .then((list) => {
        if (cancelled) return
        setDevices(list)
        setDeviceId((previous) => previous || list[0]?.deviceId || "")
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let unsubscribe = () => {}
    const capture = createMicCapture({ deviceId: deviceId || undefined })
    captureRef.current = capture
    peakLevelRef.current = 0

    const armWatchdog = () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current)
      watchdogRef.current = setTimeout(() => {
        if (peakLevelRef.current < SILENCE_LEVEL) setStatus("nosignal")
      }, NO_AUDIO_TIMEOUT_MS)
    }

    const boot = async () => {
      const result = await capture.start()
      if (cancelled) return
      if (!result.ok) {
        setStatus("error")
        return
      }
      setStatus("listening")
      unsubscribe = capture.subscribeLevel((value) => {
        setLevel(value)
        if (value > peakLevelRef.current) peakLevelRef.current = value
        if (value >= SILENCE_LEVEL) {
          if (watchdogRef.current) {
            clearTimeout(watchdogRef.current)
            watchdogRef.current = null
          }
          setStatus("ready")
        }
      })
      armWatchdog()
    }

    boot()

    return () => {
      cancelled = true
      unsubscribe()
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      capture.destroy()
      if (captureRef.current === capture) captureRef.current = null
    }
  }, [deviceId, sessionKey])

  const resetLocalState = useCallback(() => {
    setLevel(0)
    setStatus("connecting")
    setRecording(false)
    setRecordingUrl(null)
    setRecordingMs(0)
  }, [])

  const selectDevice = useCallback(
    (nextId) => {
      resetLocalState()
      setDeviceId(nextId)
    },
    [resetLocalState],
  )

  const startRecording = useCallback(() => {
    const capture = captureRef.current
    if (!capture || !capture.startRecording()) return
    recordStartedAtRef.current = Date.now()
    setRecording(true)
  }, [])

  const stopRecording = useCallback(async () => {
    const capture = captureRef.current
    if (!capture) return null
    const url = await capture.stopRecording()
    setRecordingMs(Date.now() - recordStartedAtRef.current)
    setRecordingUrl(url)
    setRecording(false)
    return url
  }, [])

  const retry = useCallback(() => {
    resetLocalState()
    setSessionKey((key) => key + 1)
  }, [resetLocalState])

  return {
    devices,
    deviceId,
    selectDevice,
    level,
    status,
    recording,
    recordingUrl,
    recordingMs,
    startRecording,
    stopRecording,
    retry,
  }
}

export default useMicCapture
