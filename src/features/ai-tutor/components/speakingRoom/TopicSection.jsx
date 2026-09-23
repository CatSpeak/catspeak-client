import React from "react"
import TopicCard from "./TopicCard"

const TopicSection = ({
  section,
  selectedTopicId,
  onSelectTopic,
}) => {
  if (!section || !section.topics || section.topics.length === 0) return null

  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-tight">
          {section.typeTitle}
        </h2>
        {section.badge && (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
            {section.badge}
          </span>
        )}
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isSelected={selectedTopicId === topic.id}
            onSelect={onSelectTopic}
          />
        ))}
      </div>
    </div>
  )
}

export default TopicSection
