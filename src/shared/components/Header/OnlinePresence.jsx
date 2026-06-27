import React from "react"
import { useParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalPresence } from "@/shared/context/GlobalPresenceContext"

const OnlinePresence = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const { onlineCounts, activeLanguageCode } = useGlobalPresence()

  const getLanguageString = (code) => {
    switch (code) {
      case "en": return "english"
      case "vi": return "vietnamese"
      case "zh": return "chinese"
      default: return "english"
    }
  }

  const currentLang = lang || activeLanguageCode || "zh"
  const currentOnlineCount = onlineCounts[getLanguageString(currentLang)] || 0

  return (
    <div className="hidden sm:flex items-center gap-2 ml-2">
      <div className="relative flex h-3 w-3 items-center justify-center shrink-0">
        {/* <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span> */}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
      </div>
      <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">
        {currentOnlineCount} {t.welcomeSection?.presence?.onlineIn || "đang trực tuyến"}
      </span>
    </div>
  )
}

export default OnlinePresence
