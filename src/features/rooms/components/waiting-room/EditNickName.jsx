import React from "react"
import { Edit2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const EditNickname = ({
  user,
  onEditName,
  className = "",
}) => {
  const { t } = useLanguage()

  return (
    <div className={`items-center gap-2 text-sm text-gray-500 ${className}`}>
      <p>
        {t?.rooms?.waitingScreen?.joinedAsNickname || "Joined as nickname"}:{" "}
        <span className="font-medium text-gray-900">
          {user?.nickname || user?.username}
        </span>
      </p>
      <span className="text-gray-300">|</span>
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
