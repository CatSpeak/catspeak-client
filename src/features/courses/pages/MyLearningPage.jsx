import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import MyLearningOverview from "./MyLearningOverview"

const MyLearningPage = () => {
  const { language, t } = useLanguage()

  return (
    <div className="w-full text-slate-900 dark:text-gray-100">
      <MyLearningOverview t={t} language={language} />
    </div>
  )
}

export default MyLearningPage
