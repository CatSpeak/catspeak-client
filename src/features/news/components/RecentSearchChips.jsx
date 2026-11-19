import React, { useState, useRef } from "react"
import { History, X } from "lucide-react"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetRecentSearchesQuery,
  useDeleteRecentSearchMutation,
} from "@/store/api/social/searchApi"

const RecentSearchChips = ({ onSelectKeyword, activeKeyword = "" }) => {
  const { t } = useLanguage()
  const { data: recentSearches = [], isLoading } = useGetRecentSearchesQuery()
  const [deleteRecentSearch, { isLoading: isDeleting }] =
    useDeleteRecentSearchMutation()

  const [targetToDelete, setTargetToDelete] = useState(null)
  const timerRef = useRef(null)
  const isLongPressRef = useRef(false)

  if (isLoading || !recentSearches || recentSearches.length === 0) {
    return null
  }

  const handleTouchStart = (keyword) => {
    isLongPressRef.current = false
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true
      setTargetToDelete(keyword)
    }, 5000) // 5 seconds long press per BA specification
  }

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const handleClick = (keyword) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false
      return
    }
    if (onSelectKeyword) {
      onSelectKeyword(keyword)
    }
  }

  const handleConfirmDelete = async () => {
    if (!targetToDelete) return
    try {
      await deleteRecentSearch(targetToDelete).unwrap()
    } catch (err) {
      console.error("Failed to delete recent search:", err)
    } finally {
      setTargetToDelete(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none w-full">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-neutral-400 shrink-0">
          <History className="w-3.5 h-3.5" />
          <span>{t.news?.recentSearchesLabel || t.news?.recent || "Gần đây:"}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-nowrap">
          {recentSearches.slice(0, 8).map((item) => {
            const keyword = typeof item === "string" ? item : item.keyword
            const isSelected =
              activeKeyword &&
              activeKeyword.toLowerCase() === keyword.toLowerCase()

            return (
              <div
                key={keyword}
                onMouseDown={() => handleTouchStart(keyword)}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={() => handleTouchStart(keyword)}
                onTouchEnd={handleTouchEnd}
                onClick={() => handleClick(keyword)}
                title={t.news?.recentSearchHint || "Nhấp để tìm kiếm, nhấn giữ 5s để xóa"}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-pointer border transition-all shrink-0 select-none ${
                  isSelected
                    ? "bg-rose-50 dark:bg-rose-950/40 border-cath-red-700 text-cath-red-700 font-semibold"
                    : "border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:border-slate-300 dark:hover:border-neutral-600"
                }`}
              >
                <span>{keyword}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTargetToDelete(keyword)
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5 rounded-full"
                  title={t.news?.deleteFromHistory || "Xóa khỏi lịch sử"}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5-second Long Press Confirmation Modal */}
      <ConfirmationModal
        open={Boolean(targetToDelete)}
        onClose={() => setTargetToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t.news?.deleteSearchHistoryTitle || "Xóa lịch sử tìm kiếm"}
        message={
          (t.news?.deleteSearchHistoryMessage || 'Bạn có chắc chắn muốn xóa từ khóa "{{keyword}}" khỏi lịch sử tìm kiếm không?').replace(
            "{{keyword}}",
            targetToDelete || "",
          )
        }
        confirmText={t.news?.delete || "Xóa"}
        cancelText={t.news?.cancel || "Hủy"}
        confirmVariant="destructive"
        isPending={isDeleting}
      />
    </>
  )
}

export default RecentSearchChips
