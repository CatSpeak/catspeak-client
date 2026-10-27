import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

const LevelAssessmentPage = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <PageTitle>
        {t?.aiTutor?.levelAssessment?.title ||
          t?.common?.levelAssessment ||
          t?.common?.placementTest ||
          "Đánh giá trình độ"}
      </PageTitle>
    </div>
  )
}

export default LevelAssessmentPage
