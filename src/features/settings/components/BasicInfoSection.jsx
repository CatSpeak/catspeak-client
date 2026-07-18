import React from "react"
import { ChevronDown } from "lucide-react"
import EditableField from "./EditableField"
import Dropdown from "@/shared/components/ui/Dropdown"
import { countries } from "@/shared/constants/countriesData"

const countryOptions = countries.map((c) => ({
  key: c.code,
  value: c.value,
  label: c.label,
  searchTerms: `${c.code} ${c.value} ${c.label}`,
  icon: (
    <img
      src={`https://flagcdn.com/w40/${c.value}.png`}
      className="w-[20px] h-[20px] rounded-full object-cover"
      alt={c.code}
    />
  ),
}))

const BasicInfoSection = ({
  formData,
  editingField,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onCountryChange,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name / Username */}
        <EditableField
          label={t.profile?.personalInfo?.username || "Họ và tên"}
          value={formData.username}
          name="username"
          isEditing={editingField === "username"}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onChange={onChange}
          editLabel={t.profile?.personalInfo?.edit || "Edit"}
        />

        {/* Nickname */}
        <EditableField
          label={t.profile?.personalInfo?.nickname || "Nickname"}
          value={formData.nickname}
          name="nickname"
          isEditing={editingField === "nickname"}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onChange={onChange}
          editLabel={t.profile?.personalInfo?.edit || "Edit"}
        />

        {/* Country */}
        <div className="flex flex-col gap-3">
          <span>{t.profile?.personalInfo?.country || "Quốc gia"}</span>
          <div className="w-full">
            <Dropdown
              options={countryOptions}
              value={formData.country}
              onChange={onCountryChange}
              enableSearch={true}
              searchPlaceholder={t.profile?.personalInfo?.searchCountry || "Search country..."}
              placeholder={
                t.profile?.personalInfo?.selectCountry || "Chọn quốc gia"
              }
              trigger={(isOpen, selectedOption, toggleDropdown) => (
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="flex items-center justify-between border border-[#e5e5e5] rounded-2xl px-4 h-12 w-full bg-white text-base hover:bg-[#f0f0f0]"
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    {selectedOption?.icon}
                    <span className="truncate">
                      {selectedOption?.label ||
                        t.profile?.personalInfo?.selectCountry ||
                        "Chọn quốc gia"}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            />
          </div>
        </div>

        {/* Account Type */}
        <div className="flex flex-col gap-3">
          <span>{t.profile?.personalInfo?.accountType || "Account type"}</span>
          <div className="w-full h-12 rounded-2xl border border-[#e2e2e2] bg-gray-50 text-gray-500 cursor-not-allowed px-4 flex items-center text-base">
            {formData.accountType}
          </div>
        </div>
      </div>
  )
}

export default BasicInfoSection
