import { useCallback, useState } from "react"
import { requestMicrophoneAccess } from "../utils/microphone"

const useMicrophonePermission = () => {
  const [requesting, setRequesting] = useState(false)

  const request = useCallback(async () => {
    setRequesting(true)
    try {
      return await requestMicrophoneAccess()
    } finally {
      setRequesting(false)
    }
  }, [])

  return { requesting, request }
}

export default useMicrophonePermission
