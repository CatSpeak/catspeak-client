import React from "react"
import TopicSection from "./TopicSection"

const TopicList = ({
  sections = [],
  selectedTopicId,
  onSelectTopic,
  errorMessage = null,
  hasTopics = true,
  onRetry,
}) => {
  if (errorMessage) {
    return (
      <div className="text-center py-14 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-rose-200 dark:border-rose-900/40 p-8 space-y-3 shadow-2xs">
        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ⚠️
        </div>
        <p className="text-base font-semibold text-slate-800 dark:text-white">
          Không thể tải danh sách chủ đề
        </p>
        <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
          {errorMessage || "Đã xảy ra lỗi khi tải danh sách chủ đề từ máy chủ. Vui lòng kiểm tra lại."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#990011] dark:bg-cath-red-700 text-white text-xs font-semibold hover:bg-[#85000f] dark:hover:bg-red-800 transition-all cursor-pointer shadow-xs"
          >
            🔄 Thử lại
          </button>
        )}
      </div>
    )
  }

  if (!hasTopics) {
    return (
      <div className="text-center py-14 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#3F3F3F] p-8 space-y-2">
        <p className="text-base font-semibold text-slate-700 dark:text-white">
          Hiện chưa có chủ đề nào
        </p>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          Hệ thống chưa có dữ liệu chủ đề đàm thoại khả dụng. Vui lòng quay lại sau.
        </p>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-[#3F3F3F] p-8 space-y-2">
        <p className="text-base font-semibold text-slate-700 dark:text-white">
          Không tìm thấy chủ đề phù hợp
        </p>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chọn tất cả bộ lọc.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {sections.map((section, sIndex) => (
        <TopicSection
          key={sIndex}
          section={section}
          selectedTopicId={selectedTopicId}
          onSelectTopic={onSelectTopic}
        />
      ))}
    </div>
  )
}

export default TopicList
