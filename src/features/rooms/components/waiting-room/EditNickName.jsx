import React from "react"
import { Edit2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const EditNickname = ({ user, onEditName, className = "" }) => {
  const { t } = useLanguage()

  return (
    <div
      className={`h-12 items-center gap-2 text-sm text-secondary dark:text-[#AAAAAA] ${className}`}
    >
      <p>
        {t?.rooms?.waitingScreen?.joinedAsNickname || "Joined as nickname"}:{" "}
        <span className="font-bold text-black dark:text-white">
          {user?.nickname || user?.username}
        </span>
      </p>
      <span className="text-secondary dark:text-neutral-500">|</span>
      <button
        type="button"
        onClick={onEditName}
        className="flex items-center gap-1 text-cath-red-600 hover:text-cath-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
      >
        <Edit2 size={14} />
        {t?.rooms?.waitingScreen?.editName || "Edit Name"}
      </button>
    </div>
  )
}

export default EditNickname
