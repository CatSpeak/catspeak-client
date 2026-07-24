import React from "react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import colors from "@/shared/utils/colors"

const OptionGroupSelect = ({
  label,
  subLabel,
  options = [],
  value,
  onChange,
  multiple = false,
  maxSelect = Infinity,
  getOptionLabel = (option) =>
    typeof option === "object" ? option.label : option,
  getOptionValue = (option) =>
    typeof option === "object" ? option.value : option,
  className = "",
}) => {
  const handleSelect = (optValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const isSelected = currentValues.includes(optValue)
      let newValues
      if (isSelected) {
        newValues = currentValues.filter((v) => v !== optValue)
      } else {
        if (currentValues.length >= maxSelect) return
        newValues = [...currentValues, optValue]
      }
      onChange(newValues)
    } else {
      const isSelected = value === optValue
      onChange(isSelected ? "" : optValue)
    }
  }

  return (
    <div className={`text-left flex flex-col gap-2 ${className}`}>
      {(label || subLabel) && (
        <div className="flex items-center gap-2">
          {label && <label className="text-base font-normal">{label}</label>}
          {subLabel && (
            <p
              className="m-0 text-sm transition-opacity"
              style={{ color: colors.subtext }}
            >
              {subLabel}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap justify-start gap-2">
        {options.map((option) => {
          const optValue = getOptionValue(option)
          const optLabel = getOptionLabel(option)
          const isSelected = multiple
            ? Array.isArray(value) && value.includes(optValue)
            : value === optValue
          const isDisabled =
            option?.disabled ||
            (!isSelected && multiple && (value?.length || 0) >= maxSelect)

          return (
            <PillButton
              key={optValue}
              type="button"
              onClick={() => handleSelect(optValue)}
              disabled={isDisabled}
              variant={isSelected ? "primary" : "secondary"}
              className="h-12"
            >
              {optLabel}
            </PillButton>
          )
        })}
      </div>
    </div>
  )
}

export default OptionGroupSelect
