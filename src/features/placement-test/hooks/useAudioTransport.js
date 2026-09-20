import { useCallback, useEffect, useRef, useState } from "react"
import { createAudioTransport } from "../services/audio"

const useAudioTransport = ({ deviceId } = {}) => {
  const transportRef = useRef(null)
  const [level, setLevel] = useState(0)
  const [status, setStatus] = useState("connecting")

  useEffect(() => {
    const transport = createAudioTransport({ deviceId: deviceId || undefined })
    transportRef.current = transport
    const unsubscribeLevel = transport.subscribeLevel(setLevel)
    const unsubscribeStatus = transport.subscribeStatus(setStatus)
    transport.start().catch(() => {})

    return () => {
      unsubscribeLevel()
      unsubscribeStatus()
      transport.destroy()
      if (transportRef.current === transport) transportRef.current = null
    }
  }, [deviceId])

  const startListening = useCallback(
    (args) => transportRef.current?.startListening(args),
    [],
  )
  const stopListening = useCallback(
    () => transportRef.current?.stopListening(),
    [],
  )
  const speak = useCallback((text, options) => transportRef.current?.speak(text, options), [])
  const stopSpeaking = useCallback(
    () => transportRef.current?.stopSpeaking(),
    [],
  )
  const playAudioBase64 = useCallback(
    (base64Data, format) =>
      transportRef.current?.playAudioBase64(base64Data, format),
    [],
  )
  const stopAudio = useCallback(
    () => transportRef.current?.stopAudio(),
    [],
  )
  const startRecording = useCallback(
    () => transportRef.current?.startRecording(),
    [],
  )
  const stopRecording = useCallback(
    () => transportRef.current?.stopRecording(),
    [],
  )
  const getRecordedBlob = useCallback(
    () => transportRef.current?.getRecordedBlob(),
    [],
  )
  const getRecordingUrl = useCallback(
    () => transportRef.current?.getRecordingUrl(),
    [],
  )

  return {
    level,
    status,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    playAudioBase64,
    stopAudio,
    startRecording,
    stopRecording,
    getRecordedBlob,
    getRecordingUrl,
  }
}

export default useAudioTransport
