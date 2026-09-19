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
  const speak = useCallback((text) => transportRef.current?.speak(text), [])
  const stopSpeaking = useCallback(
    () => transportRef.current?.stopSpeaking(),
    [],
  )

  return { level, status, startListening, stopListening, speak, stopSpeaking }
}

export default useAudioTransport
