import React from "react"
import OptionGroupSelect from "@/shared/components/ui/OptionGroupSelect"

const TopicSelect = ({ value, onChange, options, disabled, t }) => {
  const handleChange = (newTopics) => {
    onChange({ target: { value: newTopics } })
  }

  return (
    <OptionGroupSelect
      label={t.rooms.createRoom.topicsLabel}
      subLabel={`(${t.rooms.createRoom.topicLimit})`}
      options={options}
      value={value}
      onChange={handleChange}
      multiple={true}
      maxSelect={3}
      disabled={disabled}
      getOptionLabel={(topic) => t.rooms.createRoom.topics[topic.toLowerCase()] || topic}
      getOptionValue={(topic) => topic}
    />
  )
}

export default TopicSelect

