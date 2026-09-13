import { useState, useEffect, useCallback, useRef } from "react"
import { pickDeviceId } from "@/features/rooms/utils/deviceSelectionUtils"

// Device ids are machine-specific, so this preference is stored per browser
// (not per account) and reused across rooms.
const DEVICE_STORAGE_KEY = "catspeak_device_selection"

const readStoredDevices = () => {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(DEVICE_STORAGE_KEY) || "{}") || {}
  } catch {
    return {}
  }
}

export const useDeviceSelection = () => {
  const [devices, setDevices] = useState({
    audioinput: [],
    audiooutput: [],
    videoinput: [],
  })
  const hydratedRef = useRef(false)

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

      // Restore the last used devices (per browser) when they still exist.
      const stored = readStoredDevices()

      setSelectedMic((prev) =>
        pickDeviceId({
          current: prev,
          stored: stored.mic,
          available: grouped.audioinput,
          fallback: "",
        })
      )

      setSelectedSpeaker((prev) =>
        pickDeviceId({
          current: prev,
          stored: stored.speaker,
          available: grouped.audiooutput,
          fallback: "",
        })
      )

      setSelectedCamera((prev) =>
        pickDeviceId({
          current: prev,
          stored: stored.camera,
          available: grouped.videoinput,
          fallback: grouped.videoinput[0]?.deviceId || "",
        })
      )

      hydratedRef.current = true
    } catch (err) {
      console.error("Failed to enumerate devices:", err)
    }
  }, [])

  // Persist selection for the next room / reload (skip the pre-hydration render
  // so the empty initial state does not overwrite what we are about to restore).
  useEffect(() => {
    if (!hydratedRef.current || typeof window === "undefined") return
    try {
      localStorage.setItem(
        DEVICE_STORAGE_KEY,
        JSON.stringify({
          mic: selectedMic,
          speaker: selectedSpeaker,
          camera: selectedCamera,
        })
      )
    } catch {
      /* ignore storage errors */
    }
  }, [selectedMic, selectedSpeaker, selectedCamera])

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
