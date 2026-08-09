import { useState, useEffect, useCallback } from "react"

export const useDeviceSelection = () => {
  const [devices, setDevices] = useState({
    audioinput: [],
    audiooutput: [],
    videoinput: [],
  })

  const [selectedMic, setSelectedMic] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState("")
  const [selectedCamera, setSelectedCamera] = useState("")

  const fetchDevices = useCallback(async () => {
    if (!navigator.mediaDevices) {
      console.warn("navigator.mediaDevices is undefined. This usually happens in non-secure contexts (HTTP).")
      return
    }
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      
      const grouped = {
        audioinput: [],
        audiooutput: [],
        videoinput: [],
      }

      allDevices.forEach((device) => {
        // Filter out virtual/default devices to keep clean hardware options list
        if (device.deviceId === "default" || device.deviceId === "communications") {
          return
        }

        if (grouped[device.kind]) {
          grouped[device.kind].push(device)
        }
      })

      setDevices(grouped)

      setSelectedMic((prev) => {
        if (prev && prev !== "default" && grouped.audioinput.some((d) => d.deviceId === prev)) return prev
        return ""
      })

      setSelectedSpeaker((prev) => {
        if (prev && prev !== "default" && grouped.audiooutput.some((d) => d.deviceId === prev)) return prev
        return ""
      })

      setSelectedCamera((prev) => {
        if (prev && prev !== "default" && grouped.videoinput.some((d) => d.deviceId === prev)) return prev
        return grouped.videoinput[0]?.deviceId || ""
      })
    } catch (err) {
      console.error("Failed to enumerate devices:", err)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      fetchDevices()
    })
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", fetchDevices)
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", fetchDevices)
      }
    }
  }, [fetchDevices])

  const refreshDevices = fetchDevices

  return {
    devices,
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker,
    selectedCamera,
    setSelectedCamera,
    refreshDevices
  }
}

export default useDeviceSelection
