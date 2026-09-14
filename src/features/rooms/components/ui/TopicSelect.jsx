import React from "react"
import OptionGroupSelect from "@/shared/components/ui/OptionGroupSelect"

const MAX_TOPICS = 3

const TopicSelect = ({ value, onChange, options, disabled, labelClassName, t }) => {
  const handleChange = (newTopics) => {
    onChange({ target: { value: newTopics } })
  }

  const selectedCount = Array.isArray(value) ? value.length : 0
  const selectedText = (
    t.rooms.createRoom.topicSelected || "{{count}}/{{max}}"
  )
    .replace("{{count}}", selectedCount)
    .replace("{{max}}", MAX_TOPICS)

  return (
    <OptionGroupSelect
      label={t.rooms.createRoom.topicsLabel}
      subLabel={`(${selectedText})`}
      options={options}
      value={value}
      onChange={handleChange}
      multiple={true}
      maxSelect={MAX_TOPICS}
      disabled={disabled}
      labelClassName={labelClassName}
      getOptionLabel={(topic) => t.rooms.createRoom.topics[topic.toLowerCase()] || topic}
      getOptionValue={(topic) => topic}
    />
  )
}

export default TopicSelect
