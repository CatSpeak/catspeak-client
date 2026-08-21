import React from "react"
import { FiClock } from "react-icons/fi"
import { useLanguage } from "@/shared/context/LanguageContext"

const ClassSidebar = () => {
  const { t } = useLanguage()

  return (
    <aside className="min-h-[300px] w-full max-w-[360px] rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
      <div className="flex flex-col items-center justify-center h-full">
        {/* Icon */}
        <div className="mb-4">
          <div className="rounded-full bg-gray-100 p-4">
            <FiClock className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-bold text-gray-800">
          {t.comingSoon.title}
        </h3>

        {/* Message */}
        <p className="text-sm text-gray-500">{t.comingSoon.description}</p>
      </div>
    </aside>
  )
}

export default ClassSidebar
