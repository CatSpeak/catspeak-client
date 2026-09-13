import React from "react"
import OptionGroupSelect from "@/shared/components/ui/OptionGroupSelect"
import { LANGUAGES } from "../../config/constants"

const LanguageSelect = ({ value, onChange, disabled, t }) => {
  const ct = t.rooms?.customRooms || {}
  const handleChange = (language) => {
    onChange(language)
  }

  return (
    <OptionGroupSelect
      label={ct.languageLabel || "Language"}
      subLabel={`(${ct.optional || "Optional"})`}
      options={LANGUAGES}
      value={value}
      onChange={handleChange}
      multiple={false}
      disabled={disabled}
      getOptionLabel={(language) =>
        t.rooms?.filters?.languages?.[language] || language
      }
      getOptionValue={(language) => language}
    />
  )
}

export default LanguageSelect
