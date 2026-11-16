import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const RoomPagination = ({ page, totalPages, setPage }) => {
  const { t } = useLanguage()
  
  return (
    <div className="mt-6 flex justify-center items-center gap-4 text-sm font-medium">
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 border border-border dark:border-[#3F3F3F] rounded-full disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#272727] text-gray-700 dark:text-[#AAAAAA] dark:hover:text-white bg-white dark:bg-[#1A1A1A]"
      >
        {t.rooms?.pagination?.prev || "Previous"}
      </button>
      
      <span className="text-gray-600 dark:text-[#AAAAAA]">
        {t.rooms?.pagination?.pageOf
          ? t.rooms.pagination.pageOf
              .replace("{page}", page)
              .replace("{totalPages}", totalPages || 1)
          : `Page ${page} of ${totalPages || 1}`}
      </span>
      
      <button
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 border border-border dark:border-[#3F3F3F] rounded-full disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-[#272727] text-gray-700 dark:text-[#AAAAAA] dark:hover:text-white bg-white dark:bg-[#1A1A1A]"
      >
        {t.rooms?.pagination?.next || "Next"}
      </button>
    </div>
  )
}

export default RoomPagination
