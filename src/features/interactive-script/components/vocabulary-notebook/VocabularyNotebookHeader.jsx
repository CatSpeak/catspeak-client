import React from "react"
import { Gamepad } from "lucide-react"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

export const VocabularyNotebookHeader = ({ totalWords }) => {
  const { t } = useLanguage()
  const v = t.vocabularyNotebook

  const breadcrumbItems = [
    { label: t.nav?.home || "Trang chủ", href: "/" },
    { label: v?.title || "Sổ từ vựng", href: "/workspace/vocabulary" },
  ]

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageTitle>{v?.title}</PageTitle>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {v?.subtitle}
        </p>

        <PillButton variant="primary" startIcon={<Gamepad />}>
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
