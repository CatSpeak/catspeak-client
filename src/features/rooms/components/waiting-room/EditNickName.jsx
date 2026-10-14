import React from "react"
import { Edit2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const EditNickname = ({ user, onEditName, className = "" }) => {
  const { t } = useLanguage()

  return (
    <div
      className={`h-12 items-center gap-2 text-sm text-secondary ${className}`}
    >
      <p>
        {t?.rooms?.waitingScreen?.joinedAsNickname || "Joined as nickname"}:{" "}
        <span className="font-bold text-black">
          {user?.nickname || user?.username}
        </span>
      </p>
      <span className="text-secondary">|</span>
      <button
        onClick={onEditName}
        className="flex items-center gap-1 text-cath-red-600 hover:text-cath-red-700 font-medium transition-colors"
      >
        <Edit2 size={14} />
        {t?.rooms?.waitingScreen?.editName || "Edit Name"}
      </button>
    </div>
  )
}

export default EditNickname
