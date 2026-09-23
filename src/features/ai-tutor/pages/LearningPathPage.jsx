import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

const LearningPathPage = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <PageTitle>
        {t?.aiTutor?.learningPath?.title || t?.common?.learningPath || "Lộ trình 5 ngày"}
      </PageTitle>
    </div>
  )
}

export default LearningPathPage
