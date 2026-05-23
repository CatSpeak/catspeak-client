import React, { createContext, useContext, useEffect, useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetProfileQuery } from "@/features/auth"
import {
  useGetPresenceConfigQuery,
  useSendHeartbeatMutation,
} from "@/store/api/presenceApi"

const GlobalPresenceContext = createContext(undefined)

export const GlobalPresenceProvider = ({ children }) => {
  const { language: contextLanguage } = useLanguage()
  const { data: userData } = useGetProfileQuery()
  const user = userData?.data

  const { data: config } = useGetPresenceConfigQuery()
  const [sendHeartbeat] = useSendHeartbeatMutation()

  const [onlineCounts, setOnlineCounts] = useState({})
  
  // Initialize from localStorage or fallback to context language
  const [activeLanguageCode, setActiveLanguageCode] = useState(() => {
    return localStorage.getItem("activeCommunityLanguage") || contextLanguage
  })

  // map language code to string for the API
  const getLanguageString = (code) => {
    switch (code) {
      case "en":
        return "english"
      case "vi":
        return "vietnamese"
      case "zh":
        return "chinese"
      default:
        return "english"
    }
  }

  // Allow setting the active language and syncing it to localStorage
  const setPresenceLanguage = (code) => {
    setActiveLanguageCode(code)
    localStorage.setItem("activeCommunityLanguage", code)
  }

  let currentLanguageString = getLanguageString(activeLanguageCode)

  // Guard: If the backend config tells us our language isn't supported for presence, fallback
  if (
    config?.allowedLanguages &&
    !config.allowedLanguages.includes(currentLanguageString)
  ) {
    currentLanguageString = config.allowedLanguages.includes("english")
      ? "english"
      : config.allowedLanguages[0] || "english"
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api"

  // 1. Displaying Live Counts (SSE)
  useEffect(() => {
    const source = new EventSource(`${baseUrl}/v1/Presence/stream`)

    source.onopen = () => {
      console.log("[GlobalPresence] SSE Connection Opened successfully")
    }

    source.onmessage = (event) => {
      try {
        const counts = JSON.parse(event.data)
        setOnlineCounts(counts)
      } catch (e) {
        console.error("[GlobalPresence] Error parsing SSE data", e)
      }
    }

    source.onerror = (error) => {
      console.error("[GlobalPresence] SSE Connection Error:", error)
    }

    return () => {
      console.log("[GlobalPresence] Closing SSE Stream...")
      source.close()
    }
  }, [baseUrl])

  // 2. Heartbeat & Leave logic
  useEffect(() => {
    if (!config || !user) {
      return
    }

    const heartbeatInterval = config.heartbeatIntervalSeconds * 1000

    const performHeartbeat = async () => {
      try {
        await sendHeartbeat({
          language: currentLanguageString,
        }).unwrap()
      } catch (error) {
        console.error("[GlobalPresence] Heartbeat failed:", error)
      }
    }

    // Immediately fire heartbeat when language/config changes
    performHeartbeat()

    // Setup interval
    const intervalId = setInterval(performHeartbeat, heartbeatInterval)

    // Handle full unmount (unload/close tab)
    const handleUnload = () => {
      const token = localStorage.getItem("token")
      if (token) {
        // Send a synchronous beacon or fetch with keepalive on unload
        navigator.sendBeacon(`${baseUrl}/v1/Presence/leave`, JSON.stringify({}))
        // fetch is also a fallback
        fetch(`${baseUrl}/v1/Presence/leave`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          keepalive: true,
        }).catch(() => {})
      }
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("beforeunload", handleUnload)

      const token = localStorage.getItem("token")
      if (token) {
        fetch(`${baseUrl}/v1/Presence/leave`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          keepalive: true,
        }).catch((e) => console.error("[GlobalPresence] Leave request failed", e))
      }
    }
  }, [config, user, currentLanguageString, sendHeartbeat, baseUrl])

  return (
    <GlobalPresenceContext.Provider
      value={{ onlineCounts, setPresenceLanguage, activeLanguageCode }}
    >
      {children}
    </GlobalPresenceContext.Provider>
  )
}

export const useGlobalPresence = () => {
  const context = useContext(GlobalPresenceContext)
  if (context === undefined) {
    throw new Error(
      "useGlobalPresence must be used within a GlobalPresenceProvider"
    )
  }
  return context
}
