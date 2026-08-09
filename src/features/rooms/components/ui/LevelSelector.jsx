import React from "react"
import OptionGroupSelect from "@/shared/components/ui/OptionGroupSelect"

const LevelSelector = ({ selectedLevel, onSelect, levels, disabled, t }) => {
  return (
    <OptionGroupSelect
      label={t.rooms.createRoom.requiredLevel}
      options={levels}
      value={selectedLevel}
      onChange={onSelect}
      multiple={false}
      disabled={disabled}
      getOptionLabel={(level) =>
        level.labelKey
          ? t.rooms?.filters?.levels?.[level.labelKey] || level.label
          : level.label
      }
      getOptionValue={(level) => level.value}
    />
  )
}

export default LevelSelector

