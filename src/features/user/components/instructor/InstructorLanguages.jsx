import React, { useState, useRef } from "react"
import { ChevronDown, X } from "lucide-react"
import useClickOutside from "@/shared/hooks/useClickOutside"
import Dropdown from "@/shared/components/ui/Dropdown"
import FluentCard from "@/shared/components/ui/FluentCard"

const LANGUAGE_LEVELS = {
  "English": ["A1", "A2", "B1", "B2", "C1", "C2"],
  "中文": ["HSK 1", "HSK 2", "HSK 3", "HSK 4", "HSK 5", "HSK 6"],
}
const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_LEVELS)

const LanguageMultiSelect = ({ selected, onChange, options, disabled = false, placeholder = "Select languages..." }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setIsOpen(false))
  const selectedLanguages = selected.map((item) => item.language)

  const toggleLanguage = (lang) => {
    if (disabled) return
    const exists = selected.find((item) => item.language === lang)
    if (exists) {
      onChange(selected.filter((item) => item.language !== lang))
    } else {
      onChange([...selected, { language: lang, level: "" }])
    }
  }

  const removeLanguage = (lang) => {
    if (disabled) return
    onChange(selected.filter((item) => item.language !== lang))
  }

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className="flex flex-wrap items-center gap-2 h-11 w-full bg-gray-50/50 border border-gray-100 rounded-xl px-3 cursor-pointer text-sm transition-colors hover:border-gray-300"
      >
        {selected.length === 0 && (
          <span className="text-gray-400">{options.length ? placeholder : ""}</span>
        )}
        {selected.map((item) => (
          <span
            key={item.language}
            className="inline-flex items-center gap-1 bg-cath-red-700/10 text-cath-red-700 px-2 py-1 rounded-full text-[13px] font-medium"
          >
            {item.language}
            {!disabled && (
              <X
                className="w-3.5 h-3.5 cursor-pointer hover:text-red-800 transition"
                onClick={(e) => {
                  e.stopPropagation()
                  removeLanguage(item.language)
                }}
              />
            )}
          </span>
        ))}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {options.map((lang) => {
            const isSelected = selectedLanguages.includes(lang)
            return (
              <label
                key={lang}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer text-sm transition-colors ${isSelected ? "bg-cath-red-700/5 font-medium text-cath-red-700" : "hover:bg-gray-50"}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleLanguage(lang)}
                  className="w-4 h-4 accent-cath-red-700 rounded"
                />
                <span>{lang}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

const InstructorLanguages = ({
  formData,
  onChange,
  onLanguagesChange,
  readOnly = false,
  errors = {},
  t,
}) => {
  const ins = t.profile?.instructor || {}

  return (
    <FluentCard className="gap-6 !justify-start">
      <h2 className="text-xl font-bold text-gray-900">
        {ins.languageTeach || "Ngôn ngữ giảng dạy"}
      </h2>

      <div className="flex flex-col gap-5">
        <div id="field-languagesTeach" className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            {ins.chooseLanguage || "Chọn ngôn ngữ bạn sẽ dạy"}
          </label>
          <LanguageMultiSelect
            selected={formData.languagesTeach || []}
            disabled={readOnly}
            onChange={onLanguagesChange}
            options={LANGUAGE_OPTIONS}
            placeholder={ins.selectLanguages || "Chọn ngôn ngữ"}
          />
          {errors.languagesTeach && <p className="text-xs text-red-500 mt-1">{errors.languagesTeach}</p>}
        </div>

        {formData.languagesTeach && formData.languagesTeach.length > 0 && (
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-800">
              {ins.yourLevel || "Trình độ của bạn"}
            </label>
            {formData.languagesTeach.map((item, index) => (
              <div key={item.language} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 w-16">
                  {item.language}
                </span>
                <Dropdown
                  options={(LANGUAGE_LEVELS[item.language] || []).map((code) => ({
                    value: code,
                    label: code,
                  }))}
                  value={item.level}
                  onChange={(val) => {
                    if (readOnly) return
                    const updated = formData.languagesTeach.map((lang, i) =>
                      i === index ? { ...lang, level: val } : lang
                    )
                    onLanguagesChange(updated)
                  }}
                  disabled={readOnly}
                  placeholder={ins.selectLevel || "Chọn trình độ"}
                  trigger={(isOpen, selectedOption, toggle) => (
                    <button
                      type="button"
                      onClick={toggle}
                      disabled={readOnly}
                      className={`w-full h-11 px-3 rounded-xl flex items-center justify-between gap-2 transition bg-gray-50/50 border text-gray-700 hover:bg-gray-100/50 disabled:opacity-50 ${errors.languagesTeach && !item.level ? "border-red-500" : "border-gray-100"}`}
                    >
                      <span className={`flex-1 text-left text-sm truncate min-w-0 ${!selectedOption ? "text-gray-400" : ""}`}>
                        {selectedOption ? selectedOption.label : (ins.selectLevel || "Chọn trình độ")}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                  )}
                />
              </div>
            ))}
          </div>
        )}

        <div id="field-nativeLanguage" className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            {ins.nativeLanguage || "Ngôn ngữ mẹ đẻ"}
          </label>
          <Dropdown
            options={[
              { value: "English", label: "English" },
              { value: "中文", label: "中文" },
              { value: "Tiếng Việt", label: "Tiếng Việt" },
            ]}
            value={formData.nativeLanguage}
            onChange={(val) => onChange({ target: { name: "nativeLanguage", value: val } })}
            disabled={readOnly}
            placeholder={ins.selectNativeLanguage || "Chọn ngôn ngữ mẹ đẻ"}
            trigger={(isOpen, selectedOption, toggle) => (
              <button
                type="button"
                onClick={toggle}
                disabled={readOnly}
                className={`w-full h-11 px-3 rounded-xl flex items-center justify-between gap-2 transition bg-gray-50/50 border text-gray-700 hover:bg-gray-100/50 disabled:opacity-50 ${errors.nativeLanguage ? "border-red-500" : "border-gray-100"}`}
              >
                <span className={`flex-1 text-left text-sm truncate min-w-0 ${!selectedOption ? "text-gray-400" : ""}`}>
                  {selectedOption ? selectedOption.label : (ins.selectNativeLanguage || "Chọn ngôn ngữ mẹ đẻ")}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
            )}
          />
          {errors.nativeLanguage && <p className="text-xs text-red-500 mt-1">{errors.nativeLanguage}</p>}
        </div>
      </div>
    </FluentCard>
  )
}

export default InstructorLanguages
