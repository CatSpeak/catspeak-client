import React from "react"
import { Search, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import TextInput from "@/shared/components/ui/inputs/TextInput"

const ConversationListHeader = ({ onClose, isLoading }) => {
  const { t } = useLanguage()

  return (
    <div className="border-b border-[#e5e5e5]">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex min-[426px]:hidden h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100"
            aria-label={t.messages.close}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-sm font-bold">{t.messages.title}</h3>
          {isLoading && (
            <span className="text-xs text-gray-400">{t.messages.loading}</span>
          )}
        </div>
      </div>
      {/* <div className="px-4 pb-3">
        <TextInput icon={Search} placeholder={t.messages.search} />
      </div> */}
    </div>
  )
}

export default ConversationListHeader
