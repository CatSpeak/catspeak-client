import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalPresence } from "@/shared/context/GlobalPresenceContext"

const CommunityPresence = () => {
  const { t } = useLanguage()
  const { onlineCounts, activeLanguageCode } = useGlobalPresence()

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

  const currentLanguageString = getLanguageString(activeLanguageCode)
  const currentCount = onlineCounts[currentLanguageString] || 0

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
