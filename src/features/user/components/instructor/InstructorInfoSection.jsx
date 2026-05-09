import React, { useState, useRef, useEffect } from "react"
import { ChevronDown, Plus, X, Upload } from "lucide-react"
import CountryDropdown from "../CountryDropdown"

const LANGUAGE_OPTIONS = [
  "English",
  "Tiếng Việt",
  "中文",
  "日本語",
  "한국어",
  "Français",
  "Deutsch",
  "Español",
  "Português",
  "Italiano",
  "Русский",
  "العربية",
  "ภาษาไทย",
  "Bahasa Indonesia",
  "Hindi",
]

const InstructorInfoSection = ({
  formData,
  editingField,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onCountryChange,
  onLanguagesChange,
  readOnly = false,
  t,
}) => {
  const ins = t.profile?.instructor || {}

  return (
    <div className="space-y-6">
      {/* --- Personal Details Card --- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-[#990011] uppercase tracking-wide">
            {ins.yourInfo}
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          <FormRow label={ins.fullName}>
            {readOnly ? (
              <span className="text-sm text-gray-800">{formData.fullName || "—"}</span>
            ) : (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={onChange}
                className="w-full max-w-sm text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition"
              />
            )}
          </FormRow>
          <FormRow label={ins.email}>
            {readOnly ? (
              <span className="text-sm text-gray-800">{formData.email || "—"}</span>
            ) : (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                className="w-full max-w-sm text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition"
              />
            )}
          </FormRow>
          <FormRow label={ins.address}>
            {readOnly ? (
              <span className="text-sm text-gray-800">{formData.address || "—"}</span>
            ) : (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={onChange}
                className="w-full max-w-sm text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition"
              />
            )}
          </FormRow>
          <FormRow label={ins.phoneNumber}>
            {readOnly ? (
              <span className="text-sm text-gray-800">{formData.phoneNumber || "—"}</span>
            ) : (
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={onChange}
                className="w-full max-w-sm text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition"
              />
            )}
          </FormRow>
          <FormRow label={ins.nationality}>
            {readOnly ? (
              <span className="text-sm text-gray-800 capitalize">
                {formData.nationality || "—"}
              </span>
            ) : (
              <CountryDropdown value={formData.nationality} onChange={onCountryChange} />
            )}
          </FormRow>
        </div>
      </div>

      {/* --- Language & Level Card --- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-[#990011] uppercase tracking-wide">
            {ins.yourLanguage}
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {/* Languages Taught */}
          <div className="px-5 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {ins.yourLanguage}
            </label>
            <LanguageMultiSelect
              selected={formData.languagesTeach || []}
              disabled={readOnly}
              onChange={onLanguagesChange}
              options={LANGUAGE_OPTIONS}
            />
          </div>

          {/* Level */}
          <div className="px-5 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {ins.yourLevel}
            </label>
            <div className="flex flex-wrap gap-3">
              <StyledSelect
                name="levelCode"
                value={formData.levelCode}
                onChange={onChange}
                disabled={readOnly}
                options={[
                  { value: "English - B2", label: "English - B2" },
                  { value: "English - C1", label: "English - C1" },
                  { value: "English - C2", label: "English - C2" },
                ]}
              />
              <StyledSelect
                name="levelLanguage"
                value={formData.levelLanguage}
                onChange={onChange}
                disabled={readOnly}
                options={[
                  { value: "Tiếng Việt", label: "Tiếng Việt" },
                  { value: "English", label: "English" },
                  { value: "中文", label: "中文" },
                ]}
              />
            </div>
          </div>

          {/* Native Language */}
          <div className="px-5 py-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              {ins.nativeLanguage}
            </label>
            <StyledSelect
              name="nativeLanguage"
              value={formData.nativeLanguage}
              onChange={onChange}
              disabled={readOnly}
              options={[
                { value: "English", label: "English" },
                { value: "Tiếng Việt", label: "Tiếng Việt" },
                { value: "中文", label: "中文" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* --- ID Card Upload Card --- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-[#990011] uppercase tracking-wide">
            {ins.idCard}
          </h2>
        </div>
        <div className="px-5 py-4">
          <div className="flex flex-wrap gap-4">
            <IdUploadBox
              label={ins.idFront}
              file={formData.idFrontFile}
              onSelect={() => !readOnly && onEdit("idFront")}
              readOnly={readOnly}
            />
            <IdUploadBox
              label={ins.idBack}
              file={formData.idBackFile}
              onSelect={() => !readOnly && onEdit("idBack")}
              readOnly={readOnly}
            />
          </div>
          <p className="text-xs text-gray-400 mt-3 italic">{ins.idWarning}</p>
        </div>
      </div>
    </div>
  )
}

/** Consistent form row layout */
const FormRow = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-5 py-4">
    <span className="text-sm font-medium text-gray-600 sm:w-36 flex-shrink-0">
      {label}
    </span>
    <div className="flex-1">{children}</div>
  </div>
)

/** Styled native select */
const StyledSelect = ({ name, value, onChange, disabled, options }) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
)

/** Multi-select dropdown for languages */
const LanguageMultiSelect = ({ selected, onChange, options, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleLanguage = (lang) => {
    if (disabled) return
    const updated = selected.includes(lang)
      ? selected.filter((l) => l !== lang)
      : [...selected, lang]
    onChange(updated)
  }

  const removeLanguage = (lang) => {
    if (disabled) return
    onChange(selected.filter((l) => l !== lang))
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="flex flex-wrap items-center gap-1.5 min-h-[40px] w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] text-left disabled:bg-gray-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 transition"
      >
        {selected.length === 0 && (
          <span className="text-gray-400">Select languages...</span>
        )}
        {selected.map((lang) => (
          <span
            key={lang}
            className="inline-flex items-center gap-1 bg-[#990011]/10 text-[#990011] pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium"
          >
            {lang}
            {!disabled && (
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-800 transition"
                onClick={(e) => {
                  e.stopPropagation()
                  removeLanguage(lang)
                }}
              />
            )}
          </span>
        ))}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {options.map((lang) => {
            const isSelected = selected.includes(lang)
            return (
              <label
                key={lang}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer text-sm transition-colors ${
                  isSelected ? "bg-[#990011]/5 font-medium" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleLanguage(lang)}
                  className="w-4 h-4 accent-[#990011] rounded"
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

/** ID card upload box */
const IdUploadBox = ({ label, file, onSelect, readOnly }) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={readOnly && !file}
    className="group flex flex-col items-center justify-center w-40 h-28 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#990011]/30 hover:bg-[#990011]/5 transition-all bg-gray-50/50 overflow-hidden disabled:hover:border-gray-200 disabled:hover:bg-gray-50/50"
  >
    {file ? (
      <img
        src={typeof file === "string" ? file : URL.createObjectURL(file)}
        alt={label}
        className="w-full h-full object-cover"
      />
    ) : (
      <>
        <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#990011]/60 transition" />
        <span className="text-xs text-gray-400 mt-1.5 group-hover:text-[#990011]/60 transition">
          {label}
        </span>
      </>
    )}
  </button>
)

export default InstructorInfoSection
