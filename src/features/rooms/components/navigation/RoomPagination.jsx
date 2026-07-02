import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const RoomPagination = ({ page, totalPages, setPage }) => {
  const { t } = useLanguage()
  
  return (
    <div className="mt-6 flex justify-center items-center gap-4 text-sm font-medium">
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 border rounded-full disabled:opacity-50 hover:bg-gray-50 text-gray-700"
      >
        {t.rooms?.pagination?.prev || "Previous"}
      </button>
      
      <span className="text-gray-600">
        {t.rooms?.pagination?.pageOf
          ? t.rooms.pagination.pageOf
              .replace("{page}", page)
              .replace("{totalPages}", totalPages || 1)
          : `Page ${page} of ${totalPages || 1}`}
      </span>
      
      <button
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 border rounded-full disabled:opacity-50 hover:bg-gray-50 text-gray-700"
      >
        {t.rooms?.pagination?.next || "Next"}
      </button>
    </div>
  )
}

export default RoomPagination
