import React from "react"
import { Gamepad } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

export const VocabularyNotebookHeader = ({
  totalWords,
  onReviewClick,
  disableReview = false,
}) => {
  const { t } = useLanguage()
  const v = t.vocabularyNotebook

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageTitle>{v?.title}</PageTitle>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {v?.subtitle}
        </p>

        <PillButton
          type="button"
          variant="primary"
          startIcon={<Gamepad />}
          onClick={onReviewClick}
          disabled={disableReview}
        >
          {v?.reviewNow}{" "}
          <span className="rounded-full shadow-faq-card px-3 py-1 bg-cath-red-400">
            {v?.wordCount?.replace("{{count}}", totalWords) ||
              `${totalWords} từ`}
          </span>
        </PillButton>
      </div>
    </div>
  )
}
