import React from "react"
import { Search, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const ConversationListHeader = ({ onClose, isLoading }) => {
  const { t } = useLanguage()

  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-4">
          <IconButton
            onClick={onClose}
            className="min-[426px]:hidden"
            aria-label={t.messages.close}
            variant="ghost"
          >
            <ArrowLeft />
          </IconButton>

          <h3>{t.messages.title}</h3>

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
