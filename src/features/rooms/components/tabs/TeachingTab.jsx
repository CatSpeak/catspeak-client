import React from "react"
import { FiClock } from "react-icons/fi"
import { useLanguage } from "@/shared/context/LanguageContext"

const TeachingTab = () => {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center rounded-3xl bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] px-4 py-16 shadow-sm">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-[#f5c34a] to-[#c2131a] p-6 shadow-lg">
            <FiClock className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
          {t.rooms.tabs.teaching}
        </h1>

        {/* Message */}
        <p className="mb-6 text-lg text-gray-600 dark:text-neutral-300">{t.comingSoon.title}</p>

        <p className="text-sm italic text-gray-500 dark:text-neutral-400">
          {t.comingSoon.description}
        </p>
      </div>
    </div>
  )
}

export default TeachingTab
