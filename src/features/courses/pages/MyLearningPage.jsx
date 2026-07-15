import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import StudentDashboard from "../student/components/StudentDashboard"

const MyLearningPage = () => {
  const { language, t } = useLanguage()
  return <StudentDashboard t={t} language={language} />
}

export default MyLearningPage
