import React, { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetProfileQuery } from "@/features/auth"
import {
  useGetPresenceConfigQuery,
  useSendHeartbeatMutation,
} from "@/store/api/presenceApi"
import { Users, Activity } from "lucide-react"

const CommunityPresence = () => {
  const { lang: urlLang } = useParams()
  const { language: contextLanguage, t } = useLanguage()
  const { data: userData } = useGetProfileQuery()
  const user = userData?.data

  const { data: config, isSuccess: isConfigSuccess } =
    useGetPresenceConfigQuery()
  const [sendHeartbeat] = useSendHeartbeatMutation()

  const [onlineCounts, setOnlineCounts] = useState({})

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

  const activeLanguageCode = urlLang || contextLanguage
  let currentLanguageString = getLanguageString(activeLanguageCode)

  // Guard: If the backend config tells us our language isn't supported for presence (e.g. vietnamese),
  // fallback to 'english' so the heartbeat doesn't 400 Bad Request.
  if (
    config?.allowedLanguages &&
    !config.allowedLanguages.includes(currentLanguageString)
  ) {
    currentLanguageString = config.allowedLanguages.includes("english")
      ? "english"
      : config.allowedLanguages[0] || "english"
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api"

  // Step 3: Displaying Live Counts (SSE)
  useEffect(() => {
    console.log(
      "[Presence] Connecting to SSE Stream...",
      `${baseUrl}/v1/Presence/stream`,
    )
    const source = new EventSource(`${baseUrl}/v1/Presence/stream`)

    source.onopen = () => {
      console.log("[Presence] SSE Connection Opened successfully")
    }

    source.onmessage = (event) => {
      try {
        console.log("[Presence] SSE Message received raw data:", event.data)
        const counts = JSON.parse(event.data)
        console.log("[Presence] SSE Message parsed counts:", counts)
        setOnlineCounts(counts)
      } catch (e) {
        console.error("[Presence] Error parsing SSE data", e)
      }
    }

    source.onerror = (error) => {
      console.error("[Presence] SSE Connection Error:", error)
    }

    return () => {
      console.log("[Presence] Closing SSE Stream...")
      source.close()
    }
  }, [baseUrl])

  // Step 2 & 4: Heartbeat & Leave logic
  useEffect(() => {
    if (!config || !user) {
      console.log(
        "[Presence] Heartbeat paused: Missing config or user. Config:",
        config,
        "User:",
        user,
      )
      return
    }

    console.log("[Presence] Config loaded:", config)
    const heartbeatInterval = config.heartbeatIntervalSeconds * 1000

    const performHeartbeat = async () => {
      console.log(
        `[Presence] Sending heartbeat for language: ${currentLanguageString}`,
      )
      try {
        const response = await sendHeartbeat({
          language: currentLanguageString,
        }).unwrap()
        console.log("[Presence] Heartbeat success. Response:", response)
      } catch (error) {
        console.error("[Presence] Heartbeat failed:", error)
      }
    }

    // Immediately fire heartbeat when joining
    performHeartbeat()

    // Setup interval
    console.log(
      `[Presence] Setting up heartbeat interval every ${heartbeatInterval}ms`,
    )
    const intervalId = setInterval(performHeartbeat, heartbeatInterval)

    // Handle tab close or visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("[Presence] Tab hidden, sending leave beacon...")
        const token = localStorage.getItem("token")
        if (token) {
          fetch(`${baseUrl}/v1/Presence/leave`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            keepalive: true,
          }).catch((e) => console.error("[Presence] Leave request failed", e))
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      console.log(
        "[Presence] Cleanup: clearing interval and sending leave beacon...",
      )
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)

      const token = localStorage.getItem("token")
      if (token) {
        fetch(`${baseUrl}/v1/Presence/leave`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          keepalive: true,
        }).catch((e) => console.error("[Presence] Leave request failed", e))
      }
    }
  }, [config, user, currentLanguageString, sendHeartbeat, baseUrl])

  const currentCount = onlineCounts[currentLanguageString] || 0
  console.log(
    `[Presence] Current UI Count for ${currentLanguageString}:`,
    currentCount,
    " | Full counts object:",
    onlineCounts,
  )

  return (
    <div className="flex-col mt-8">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-3 w-3 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </div>

        <span className="text-xs leading-4 text-[#606060] uppercase">
          {t.welcomeSection?.presence?.onlineIn || "online"}
        </span>
      </div>

      <span className="font-semibold text-[24px] leading-[32px]">
        {currentCount}
      </span>
    </div>
  )
}

export default CommunityPresence
