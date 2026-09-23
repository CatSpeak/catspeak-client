import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

const HistoryProgressPage = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <PageTitle>
        {t?.aiTutor?.historyProgress?.title || t?.common?.historyProgress || "Lịch sử & Tiến độ"}
      </PageTitle>
    </div>
  )
}

export default HistoryProgressPage
