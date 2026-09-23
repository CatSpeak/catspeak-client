import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

const VocabularyNotebookPage = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <PageTitle>
        {t?.aiTutor?.vocabularyNotebook?.title || t?.common?.vocabularyNotebook || "Sổ tay từ vựng"}
      </PageTitle>
    </div>
  )
}

export default VocabularyNotebookPage
