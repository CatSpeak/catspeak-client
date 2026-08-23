import React, { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import StudentDashboard from "../student/components/StudentDashboard"
import MyLearningOverview from "./MyLearningOverview"

const MyLearningPage = () => {
  const { language, t } = useLanguage()
  const [view, setView] = useState("overview") // "overview" | "all"

  if (view === "all") {
    return <StudentDashboard t={t} language={language} />
  }

  return <MyLearningOverview t={t} language={language} onShowAll={() => setView("all")} />
}

export default MyLearningPage
