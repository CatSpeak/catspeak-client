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
      <div className="text-center py-14 bg-white rounded-2xl border border-rose-200 p-8 space-y-3 shadow-2xs">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ⚠️
        </div>
        <p className="text-base font-semibold text-slate-800">
          Không thể tải danh sách chủ đề
        </p>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {errorMessage || "Đã xảy ra lỗi khi tải danh sách chủ đề từ máy chủ. Vui lòng kiểm tra lại."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#990011] text-white text-xs font-semibold hover:bg-[#85000f] transition-all cursor-pointer shadow-xs"
          >
            🔄 Thử lại
          </button>
        )}
      </div>
    )
  }

  if (!hasTopics) {
    return (
      <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
        <p className="text-base font-semibold text-slate-700">
          Hiện chưa có chủ đề nào
        </p>
        <p className="text-xs text-slate-500">
          Hệ thống chưa có dữ liệu chủ đề đàm thoại khả dụng. Vui lòng quay lại sau.
        </p>
      </div>
    )
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
        <p className="text-base font-semibold text-slate-700">
          Không tìm thấy chủ đề phù hợp
        </p>
        <p className="text-xs text-slate-500">
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
