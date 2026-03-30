import React from "react"
import { FiSearch, FiArrowLeft } from "react-icons/fi"
import { useLanguage } from "@/shared/context/LanguageContext"
import TextInput from "@/shared/components/ui/inputs/TextInput"

const ConversationListHeader = ({ onClose, isLoading }) => {
  const { t } = useLanguage()

  return (
    <div className="border-b border-[#C6C6C6]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex min-[426px]:hidden h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
            aria-label={t.messages.close}
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-black text-sm font-bold m-0">
            {t.messages.title}
          </h3>
          {isLoading && (
            <span className="text-xs text-gray-400">{t.messages.loading}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="hidden min-[426px]:flex h-9 w-9 items-center justify-center rounded-full bg-[#990011] text-white shadow hover:scale-105"
          aria-label={t.messages.close}
        >
          ✕
        </button>
      </div>
      {/* <div className="px-4 pb-3">
        <TextInput icon={FiSearch} placeholder={t.messages.search} />
      </div> */}
    </div>
  )
}

export default ConversationListHeader
