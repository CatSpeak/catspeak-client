import React from "react"
import { Trash2, X } from "lucide-react"
import { formatFileSize, getFileIcon } from "../../utils/fileUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

const FileAttachmentItem = ({ file, onRemove, variant = "default" }) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall
  const isModal = variant === "modal"

  return (
    <div
      className={`border flex items-center justify-between ${isModal
        ? "border-border bg-stone-50/60 rounded-2xl p-4"
        : "border-[#E2E2E2] bg-white rounded-xl px-4 py-3"
        }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-red-100/70 text-[#72000d] rounded-xl flex items-center justify-center shrink-0">
          {getFileIcon(file.name)}
        </div>
        <div className="min-w-0">
          <p
            className={`${isModal ? "text-xs sm:text-sm text-gray-800" : "text-sm text-[#191C1D]"
              } font-semibold truncate`}
          >
            {file.name}
          </p>
          <p
            className={`${isModal ? "text-[11px] text-gray-500" : "text-xs text-[#5B403C]"
              }`}
          >
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className={`p-1.5 rounded-full transition-colors shrink-0 ${isModal
          ? "hover:bg-gray-200/60 text-gray-500 hover:text-gray-800"
          : "hover:bg-gray-100 text-[#5B403C] hover:text-[#191C1D]"
          }`}
        title={dict.removeFileTooltip}
        aria-label={dict.removeFileTooltip}
      >
        {isModal ? <X size={16} /> : <Trash2 size={16} />}
      </button>
    </div>
  )
}

export default FileAttachmentItem
