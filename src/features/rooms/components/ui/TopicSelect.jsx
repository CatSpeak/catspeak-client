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
        <label className="text-base font-semibold text-gray-800">{t.rooms.createRoom.topicsLabel}</label>
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
              className={`inline-flex min-h-[48px] h-12 items-center rounded-full px-5 text-sm sm:text-base font-medium transition-all duration-200 ease-out border ${
                isSelected
                  ? "bg-gradient-to-r from-cath-red-500 to-cath-red-700 border-transparent text-white shadow-md shadow-cath-red-500/20 transform scale-[1.02]"
                  : "bg-white border-gray-200 text-gray-700 hover:border-cath-red-300 hover:bg-red-50 hover:text-cath-red-700 hover:shadow-sm"
              } ${isDisabled ? "cursor-not-allowed opacity-40 hover:bg-white hover:border-gray-200 hover:text-gray-700 hover:shadow-none transform-none" : "hover:-translate-y-0.5 active:translate-y-0 active:scale-95"}`}
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
