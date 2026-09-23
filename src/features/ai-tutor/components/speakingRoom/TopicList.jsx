import React from "react"
import TopicSection from "./TopicSection"

const TopicList = ({
  sections = [],
  selectedTopicId,
  onSelectTopic,
}) => {
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
