import { useCallback, useEffect, useRef, useState } from "react"
import { createAudioTransport } from "../services/audio"

const useMicCapture = () => {
  const transportRef = useRef(null)
  const recordStartedAtRef = useRef(0)

  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState("")
  const [level, setLevel] = useState(0)
  const [status, setStatus] = useState("connecting")
  const [recording, setRecording] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState(null)
  const [recordingMs, setRecordingMs] = useState(0)
  const [sessionKey, setSessionKey] = useState(0)

  const refreshDevices = useCallback(async () => {
    try {
      const list = await createAudioTransport().getDevices()
      if (Array.isArray(list) && list.length > 0) {
        setDevices(list)
      }
    } catch {}
  }, [])

  useEffect(() => {
    refreshDevices()
    const handleDeviceChange = () => {
      refreshDevices()
    }
    navigator?.mediaDevices?.addEventListener?.("devicechange", handleDeviceChange)
    return () => {
      navigator?.mediaDevices?.removeEventListener?.("devicechange", handleDeviceChange)
    }
  }, [refreshDevices])

  useEffect(() => {
    const transport = createAudioTransport({ deviceId: deviceId || undefined })
    transportRef.current = transport
    const unsubscribeLevel = transport.subscribeLevel(setLevel)
    const unsubscribeStatus = transport.subscribeStatus((nextStatus) => {
      setStatus(nextStatus)
      if (nextStatus === "listening" || nextStatus === "ready") {
        refreshDevices()
      }
    })
    transport.start().then(() => {
      refreshDevices()
    }).catch(() => {})

    return () => {
      unsubscribeLevel()
      unsubscribeStatus()
      transport.destroy()
      if (transportRef.current === transport) transportRef.current = null
    }
  }, [deviceId, sessionKey, refreshDevices])

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
    const transport = transportRef.current
    if (!transport || !transport.startRecording()) return
    recordStartedAtRef.current = Date.now()
    setRecording(true)
  }, [])

  const stopRecording = useCallback(async () => {
    const transport = transportRef.current
    if (!transport) return null
    const url = await transport.stopRecording()
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
