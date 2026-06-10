import React from "react"
import EditableField from "./EditableField"
import Dropdown from "@/shared/components/ui/Dropdown"

const COUNTRIES = [
  { value: "vietnam", label: "Vietnam" },
  { value: "usa", label: "United States" },
  { value: "china", label: "China" },
]

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
    <div className="flex flex-col gap-6">
        {/* Full Name / Username */}
        <div className="flex flex-col gap-3">
          <span>{t.profile?.personalInfo?.username || "Họ và tên"}</span>
          <div className="w-full h-12 rounded-2xl border border-[#e2e2e2] bg-gray-50 text-gray-500 cursor-not-allowed px-4 flex items-center text-base">
            {formData.username}
          </div>
        </div>

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
              options={COUNTRIES}
              value={formData.country}
              onChange={onCountryChange}
              placeholder={
                t.profile?.personalInfo?.selectCountry || "Chọn quốc gia"
              }
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
