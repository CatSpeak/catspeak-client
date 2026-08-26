import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import MyLearningOverview from "./MyLearningOverview"

const MyLearningPage = () => {
  const { language, t } = useLanguage()

  return <MyLearningOverview t={t} language={language} />
}

export default MyLearningPage
