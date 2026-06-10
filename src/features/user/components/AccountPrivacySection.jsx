import React from "react"
import EditableField from "./EditableField"
import ChangePasswordSection from "./ChangePasswordSection"
import Dropdown from "@/shared/components/ui/Dropdown"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { ChevronDown } from "lucide-react"
import { VietNam, China, USA } from "@/shared/assets/icons/flags"

const AccountPrivacySection = ({
  formData,
  editingField,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onChange,
  t,
  errors = {},
}) => {
  const phonePrefixes = [
    { value: "+1", label: "United States", icon: <img src={USA} className="w-[20px] h-[20px] rounded-full object-cover" alt="US" /> },
    { value: "+86", label: "China", icon: <img src={China} className="w-[20px] h-[20px] rounded-full object-cover" alt="CN" /> },
    { value: "+84", label: "Vietnam", icon: <img src={VietNam} className="w-[20px] h-[20px] rounded-full object-cover" alt="VN" /> },
  ]

  const displayPhoneValue = () => {
    if (!formData.phoneNumber) return ""
    return `${formData.phonePrefix || "+84"} ${formData.phoneNumber}`
  }

  return (
    <div className="flex flex-col gap-6">
        {/* Password */}
        <ChangePasswordSection t={t} />

        {/* Address */}
        <EditableField
          label={t.profile?.personalInfo?.address || "Address"}
          value={formData.address}
          name="address"
          isEditing={editingField === "address"}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onChange={onChange}
          editLabel={t.profile?.personalInfo?.edit || "Edit"}
          error={errors.address}
        />

        {/* Phone Number */}
        <EditableField
          label={t.profile?.personalInfo?.phoneNumber || "Your phone number"}
          value={displayPhoneValue()}
          name="phoneNumber"
          isEditing={editingField === "phoneNumber"}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onChange={onChange}
          editLabel={t.profile?.personalInfo?.edit || "Edit"}
          error={errors.phoneNumber}
          helperText={t.profile?.personalInfo?.phoneRateLimitHint || "Bạn chỉ có thể thay đổi số điện thoại 1 lần trong 30 ngày."}
          customInput={
            <div className="w-full md:flex-1">
              <Dropdown
                options={phonePrefixes}
                value={formData.phonePrefix || "+84"}
                onChange={(val) => onChange({ target: { name: "phonePrefix", value: val } })}
                dropdownClassName="w-[240px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
                trigger={(isOpen, selectedOption, toggleDropdown) => (
                  <TextInput
                    type="tel"
                    name="phoneNumber"
                    placeholder={t.auth?.phonePlaceholder || "Nhập sđt"}
                    value={formData.phoneNumber}
                    onChange={onChange}
                    leftContentWidthClass="pl-[95px]"
                    leftContent={
                      <div className="flex items-center h-full">
                        <button
                          type="button"
                          onClick={toggleDropdown}
                          className="flex items-center gap-1 pl-0 pr-1 h-full focus:outline-none cursor-pointer"
                        >
                          <span className="text-base leading-none">
                            {phonePrefixes.find((p) => p.value === (formData.phonePrefix || "+84"))?.icon}
                          </span>
                          <ChevronDown size={14} className="text-gray-500" />
                        </button>
                        <span className="text-[#606060] text-sm ml-1">{formData.phonePrefix || "+84"}</span>
                      </div>
                    }
                  />
                )}
                renderOption={(option, isSelected) => (
                  <div
                    className={`w-full h-10 px-3 text-left text-sm flex items-center gap-3 ${
                      isSelected ? "bg-[#F6F6F6] font-semibold" : "hover:bg-[#F6F6F6]"
                    }`}
                  >
                    <span className="text-base shrink-0">{option.icon}</span>
                    <span className="truncate flex-1">{option.label}</span>
                    <span className="text-[#606060] shrink-0">{option.value}</span>
                  </div>
                )}
              />
            </div>
          }
        />

        {/* Email */}
        <EditableField
          label={t.profile?.personalInfo?.email || "Email"}
          value={formData.email}
          name="email"
          isEditing={editingField === "email"}
          isUpdating={isUpdating}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onChange={onChange}
          editLabel={t.profile?.personalInfo?.edit || "Edit"}
          error={errors.email}
        />
    </div>
  )
}

export default AccountPrivacySection
