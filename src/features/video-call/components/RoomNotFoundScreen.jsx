import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { SearchX } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getCommunityPath } from "@/shared/utils/navigation"

const RoomNotFoundScreen = () => {
  const { lang } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-950 animate-fadeIn">
      <div className="flex flex-col items-center gap-4 max-w-[400px] px-8 py-12 text-center">
        <div className="text-red-500 mb-2">
          <SearchX size={64} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          {t.rooms.waitingScreen.roomNotFound}
        </h1>
        <p className="text-[15px] text-gray-400 leading-relaxed mb-2">
          {t.rooms.waitingScreen.roomNotFoundSubtext}
        </p>
        <PillButton
          onClick={() => navigate(getCommunityPath(lang || language))}
          variant="primary"
          className="h-10 min-w-[140px] mt-2"
        >
          {t.rooms.waitingScreen.backToCommunity}
        </PillButton>
      </div>
    </div>
  )
}

export default RoomNotFoundScreen
