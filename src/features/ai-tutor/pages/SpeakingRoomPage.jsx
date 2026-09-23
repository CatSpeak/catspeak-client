import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

const SpeakingRoomPage = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <PageTitle>
        {t?.aiTutor?.speakingRoom?.title || t?.common?.speakingRoom || "Phòng luyện nói"}
      </PageTitle>
    </div>
  )
}

export default SpeakingRoomPage
