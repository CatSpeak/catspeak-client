import React from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { PhoneOff } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getCommunityPath } from "@/shared/utils/navigation"

const CallEndedScreen = () => {
  const { lang } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, language } = useLanguage()

  const isExpired = location.state?.reason === "expired"

  return (
    <div className="flex items-center justify-center h-screen bg-[#F3F3F3] animate-fadeIn">
      <div className="flex flex-col items-center gap-4 max-w-[420px] px-8 py-12 text-center bg-white rounded-3xl border border-[#E5E5E5] shadow-xl">
        <div className="text-gray-600 mb-2 bg-gray-100 p-5 rounded-full">
          <PhoneOff size={40} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-black leading-tight">
          {isExpired ? t.rooms.callEnded.titleExpired : t.rooms.callEnded.titleLeft}
        </h1>
        <p className="text-[15px] text-gray-500 leading-relaxed mb-6">
          {isExpired
            ? t.rooms.callEnded.descExpired
            : t.rooms.callEnded.descLeft}
        </p>
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          {!isExpired && (
            <PillButton
              onClick={() =>
                navigate(location.pathname, { replace: true, state: {} })
              }
              variant="secondary"
              className="h-11 px-6 min-w-[140px]"
            >
              {t.rooms.callEnded.rejoin}
            </PillButton>
          )}
          <PillButton
            onClick={() => navigate(getCommunityPath(lang || language))}
            variant="primary"
            className="h-11 px-6 min-w-[140px]"
          >
            {t.rooms.callEnded.returnHome}
          </PillButton>
        </div>
      </div>
    </div>
  )
}

export default CallEndedScreen
