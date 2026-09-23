import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

const PlacementTestPage = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <PageTitle>
        {t?.aiTutor?.placementTest?.title || t?.common?.placementTest || "Đánh giá trình độ"}
      </PageTitle>
    </div>
  )
}

export default PlacementTestPage
