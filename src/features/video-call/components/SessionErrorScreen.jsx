import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getCommunityPath } from "@/shared/utils/navigation"

const SessionErrorScreen = ({ error }) => {
  const { lang } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-950 animate-fadeIn">
      <div className="flex flex-col items-center gap-4 max-w-[400px] px-8 py-12 text-center">
        <div className="text-red-500 mb-2">
          <AlertCircle size={64} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          {t.rooms.videoCall.provider.failedToLoad}
        </h1>
        <p className="text-[15px] text-gray-400 leading-relaxed mb-2">
          {error?.data?.message || t.rooms.videoCall.provider.unknownError}
        </p>
        <div className="flex flex-col gap-3 w-full mt-2 min-w-[200px]">
          <PillButton
            onClick={() => window.location.reload()}
            variant="primary"
            className="h-10 w-full"
          >
            {t.rooms.videoCall.provider.retry}
          </PillButton>
          <PillButton
            onClick={() => navigate(getCommunityPath(lang || language))}
            variant="secondary"
            className="h-10 w-full"
          >
            {t.rooms.waitingScreen.backToCommunity}
          </PillButton>
        </div>
      </div>
    </div>
  )
}

export default SessionErrorScreen
