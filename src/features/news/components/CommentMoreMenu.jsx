import React from "react"
import { Pencil, Trash, MoreVertical } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Popover from "@/shared/components/ui/Popover"

const CommentMoreMenu = ({ onEdit, onDelete }) => {
  const { t } = useLanguage()

  return (
    <Popover
      placement="bottom-left"
      trigger={
        <button
          className="h-10 w-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-[#F6F6F6] transition-colors focus:outline-none"
          title={t.news?.newsDetail?.moreOptions || "More options"}
        >
          <MoreVertical />
        </button>
      }
      content={(close) => (
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-lg p-1 flex flex-col gap-1 min-w-max">
          <button
            onClick={() => {
              close()
              onEdit()
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6] transition-colors whitespace-nowrap"
          >
            <Pencil size={20} />
            {t.news?.newsDetail?.editComment || "Edit"}
          </button>
          <button
            onClick={() => {
              close()
              onDelete()
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            <Trash size={20} />
            {t.news?.newsDetail?.deleteComment || "Delete"}
          </button>
        </div>
      )}
    />
  )
}

export default CommentMoreMenu
