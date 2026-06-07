import React from "react"
import { colors } from "@/shared/utils/colors"

const TopicSelect = ({ value, onChange, options, t }) => {
  const handleSelect = (topic) => {
    let newTopics
    if (value.includes(topic)) {
      newTopics = value.filter((tItem) => tItem !== topic)
    } else {
      if (value.length >= 3) return
      newTopics = [...value, topic]
    }
    // Pass the new array directly to match parent's generic handler or custom event
    onChange({ target: { value: newTopics } })
  }

  return (
    <div className="text-left flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="text-base">{t.rooms.createRoom.topicsLabel}</label>
        <p
          className={`m-0 text-sm transition-opacity `}
          style={{ color: colors.subtext }}
        >
          ({t.rooms.createRoom.topicLimit})
        </p>
      </div>

      <div className="flex flex-wrap justify-start gap-2">
        {options.map((topic) => {
          const isSelected = value.includes(topic)
          const isDisabled = !isSelected && value.length >= 3

          return (
            <button
              key={topic}
              type="button"
              onClick={() => !isDisabled && handleSelect(topic)}
              disabled={isDisabled}
              className={`inline-flex min-h-[48px] h-12 items-center rounded-full px-4 text-base border transition-colors ${
                isSelected
                  ? "bg-cath-red-700 border-cath-red-700 text-white hover:bg-cath-red-800 hover:border-cath-red-800"
                  : "border-[#C6C6C6] hover:bg-[#F2F2F2]"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {t.rooms.createRoom.topics[topic.toLowerCase()] || topic}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TopicSelect
