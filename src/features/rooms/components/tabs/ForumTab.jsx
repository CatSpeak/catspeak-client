import React from "react"
import { FiMessageSquare } from "react-icons/fi"
import { useLanguage } from "@/shared/context/LanguageContext"

const ForumTab = () => {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center rounded-3xl bg-white px-4 py-16 shadow-sm">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-[#f5c34a] to-[#c2131a] p-6 shadow-lg">
            <FiMessageSquare className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          {t.rooms.tabs.forum}
        </h1>

        {/* Message */}
        <p className="mb-6 text-lg text-gray-600">{t.comingSoon.title}</p>

        <p className="text-sm italic text-gray-500">
          {t.comingSoon.description}
        </p>
      </div>
    </div>
  )
}

export default ForumTab
