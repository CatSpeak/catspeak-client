import React from "react"
import { Link } from "react-router-dom"
import { Pencil, ChevronDown, Info } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { DatePicker } from "@/shared/components/ui/inputs"
import Dropdown from "@/shared/components/ui/Dropdown"
import {
  countryOptions,
  phonePrefixes,
} from "@/shared/constants/countriesOptions"
import Label from "@/shared/components/ui/Label"

const AccountSettingsForm = ({
  formData,
  editingField,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onChange,
  onCountryChange,
  errors,
  t,
  isTeacherAccount = false,
}) => {
  const isEditingPersonal = editingField === "personalInfo"
  const isEditingSecurity = editingField === "securityInfo"

  const prefixLength = formData.phonePrefix?.length || 3
  const plClass =
    prefixLength <= 2
      ? "pl-[80px]"
      : prefixLength === 3
        ? "pl-[90px]"
        : prefixLength === 4
          ? "pl-[100px]"
          : prefixLength === 5
            ? "pl-[110px]"
            : "pl-[120px]"

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      <div>
        {/* 1. THÔNG TIN CÁ NHÂN */}
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          {t.profile?.personalInfo?.title || "Thông tin cá nhân"}
        </h2>

        <FluentCard className="flex flex-col w-full p-4 gap-4 border-border rounded-xl !justify-start">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-end">
              {!isEditingPersonal ? (
                <PillButton
                  onClick={() => onEdit("personalInfo")}
                  variant="outline"
                  startIcon={<Pencil />}
                >
                  {t.profile?.personalInfo?.edit || "Sửa"}
                </PillButton>
              ) : (
                <div className="flex items-center gap-2">
                  <PillButton
                    onClick={onCancel}
                    variant="secondary"
                    disabled={isUpdating}
                  >
                    {t.profile?.personalInfo?.cancel || "Hủy"}
                  </PillButton>

                  <PillButton
                    onClick={() => onSave("personalInfo")}
                    variant="primary"
                    disabled={isUpdating}
                  >
                    {t.profile?.personalInfo?.save || "Lưu"}
                  </PillButton>
                </div>
              )}
            </div>

            {isTeacherAccount && (
              <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 p-3.5 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                <div>
                  <span>
                    {t.profile?.personalInfo?.teacherManagedNotice ||
                      "Họ tên, ngày sinh, quốc tịch và địa chỉ của giảng viên được quản lý tại "}
                  </span>
                  <Link
                    to="/setting/instructor"
                    className="font-semibold text-cath-red-700 dark:text-red-400 hover:underline"
                  >
                    {t.nav?.instructor || "Hồ sơ giáo viên"}
                  </Link>
                  .
                </div>
              </div>
            )}

            {!isTeacherAccount && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label>
                      {t.profile?.personalInfo?.country || "Quốc tịch"}
                    </Label>

                    <Dropdown
                      options={countryOptions}
                      value={formData.country}
                      onChange={(val) => onCountryChange(val)}
                      disabled={!isEditingPersonal || isUpdating}
                      enableSearch={true}
                      searchPlaceholder={
                        t.profile?.personalInfo?.searchCountry ||
                        "Tìm kiếm quốc gia..."
                      }
                      placeholder={
                        t.profile?.personalInfo?.selectCountry ||
                        "Chọn quốc gia"
                      }
                      trigger={(isOpen, selectedOption, toggle) => (
                        <button
                          type="button"
                          onClick={toggle}
                          disabled={!isEditingPersonal || isUpdating}
                          className={`w-full h-14 pl-4 pr-1 rounded flex items-center justify-between gap-2 transition bg-gray-50/50 dark:bg-[#242424] border text-gray-700 dark:text-neutral-200 hover:bg-gray-100/50 dark:hover:bg-[#2c2c2c] disabled:opacity-50 ${
                            errors?.country
                              ? "border-red-500"
                              : "border-border dark:border-[#3F3F3F]"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2 text-base truncate min-w-0 flex-1 ${!selectedOption ? "text-gray-400 dark:text-neutral-500" : ""}`}
                          >
                            {selectedOption?.icon}
                            <span className="truncate">
                              {selectedOption
                                ? selectedOption.label
                                : t.profile?.personalInfo?.selectCountry ||
                                  "Chọn quốc gia"}
                            </span>
                          </div>

                          <div className="w-12 h-12 flex items-center justify-center shrink-0">
                            <ChevronDown
                              className={`w-6 h-6 text-gray-400 shrink-0 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label>
                      {t.profile?.personalInfo?.dateOfBirth ||
                        t.auth?.dateOfBirthLabel ||
                        "Ngày sinh"}
                    </Label>
                    <DatePicker
                      value={formData.dateOfBirth}
                      onChange={(d) => {
                        if (!d) return
                        const formattedDate =
                          d.getFullYear() +
                          "-" +
                          String(d.getMonth() + 1).padStart(2, "0") +
                          "-" +
                          String(d.getDate()).padStart(2, "0")
                        onChange({
                          target: { name: "dateOfBirth", value: formattedDate },
                        })
                      }}
                      disabled={!isEditingPersonal || isUpdating}
                      className={`w-full flex ${errors?.dateOfBirth ? "[&>button]:!border-red-500" : "[&>button]:!border-border dark:[&>button]:!border-[#3F3F3F]"} [&>button]:!rounded [&>button]:!bg-gray-50/50 dark:[&>button]:!bg-[#242424] dark:[&>button]:!text-white [&>button]:w-full [&>button]:justify-between`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Label>{t.profile?.personalInfo?.address || "Địa chỉ"}</Label>
                  <TextInput
                    name="address"
                    value={formData.address || ""}
                    onChange={onChange}
                    disabled={!isEditingPersonal || isUpdating}
                    placeholder={
                      t.profile?.personalInfo?.enterAddress ||
                      "Nhập địa chỉ của bạn..."
                    }
                    error={errors?.address}
                    className={`!rounded bg-gray-50/50 dark:bg-[#242424] border px-3 ${errors?.address ? "border-red-500" : "border-border dark:border-[#3F3F3F]"}`}
                    containerClassName="!gap-0"
                  />
                </div>
              </>
            )}
          </div>
        </FluentCard>
      </div>

      {/* 2. TÀI KHOẢN VÀ BẢO MẬT — email/phone/CCCD moved to /setting/instructor
          for teacher accounts, so this card only renders for non-teachers. */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          {t.profile?.personalInfo?.accountAndPrivacy || "Tài khoản và bảo mật"}
        </h2>

        {!isTeacherAccount && (
          <FluentCard className="flex flex-col w-full p-4 gap-4 border-border rounded-xl shadow-sm !justify-start">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-end">
                {!isEditingSecurity ? (
                  <PillButton
                    onClick={() => onEdit("securityInfo")}
                    variant="outline"
                    startIcon={<Pencil size={18} />}
                  >
                    {t.profile?.personalInfo?.edit || "Sửa"}
                  </PillButton>
                ) : (
                  <div className="flex items-center gap-2">
                    <PillButton
                      onClick={onCancel}
                      variant="secondary"
                      disabled={isUpdating}
                    >
                      {t.profile?.personalInfo?.cancel || "Hủy"}
                    </PillButton>

                    <PillButton
                      onClick={() => onSave("securityInfo")}
                      variant="primary"
                      disabled={isUpdating}
                    >
                      {t.profile?.personalInfo?.save || "Lưu"}
                    </PillButton>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label> {t.profile?.personalInfo?.email || "Email"}</Label>

                  <TextInput
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={onChange}
                    disabled={!isEditingSecurity || isUpdating}
                    placeholder={
                      t.profile?.personalInfo?.enterEmail ||
                      "Nhập địa chỉ email..."
                    }
                    error={errors?.email}
                    className={`!rounded ${errors?.email ? "border-red-500" : "border-border dark:border-[#3F3F3F]"}`}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>
                    {t.profile?.personalInfo?.phoneNumber || "Số điện thoại"}
                  </Label>

                  <Dropdown
                    options={phonePrefixes}
                    value={formData.phonePrefix}
                    onChange={(val) =>
                      onChange({ target: { name: "phonePrefix", value: val } })
                    }
                    disabled={!isEditingSecurity || isUpdating}
                    enableSearch={true}
                    searchPlaceholder={
                      t.profile?.personalInfo?.searchPhoneCode ||
                      "Tìm kiếm mã vùng..."
                    }
                    dropdownClassName="w-full min-w-[260px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
                    trigger={(isOpen, selectedOption, toggleDropdown) => (
                      <TextInput
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={onChange}
                        disabled={!isEditingSecurity || isUpdating}
                        placeholder={
                          t.profile?.personalInfo?.enterPhoneNumber ||
                          "Nhập số điện thoại..."
                        }
                        error={errors?.phoneNumber}
                        className={`!rounded ${errors?.phoneNumber ? "border-red-500" : "border-border dark:border-[#3F3F3F]"}`}
                        containerClassName="!gap-0"
                        leftContentWidthClass={plClass}
                        leftContent={
                          <div className="flex items-center h-full">
                            <button
                              type="button"
                              disabled={!isEditingSecurity || isUpdating}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleDropdown()
                              }}
                              className="flex items-center gap-1 pl-4 h-full focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                              <span className="text-base leading-none">
                                {
                                  phonePrefixes.find(
                                    (p) => p.value === formData.phonePrefix,
                                  )?.icon
                                }
                              </span>

                              <ChevronDown
                                size={20}
                                className="text-gray-500"
                              />
                            </button>
                            <span className="text-[#606060] dark:text-[#AAAAAA] text-base ml-2">
                              {formData.phonePrefix}
                            </span>
                          </div>
                        }
                      />
                    )}
                    renderOption={(option, isSelected) => (
                      <div
                        className={`w-full h-10 px-3 text-left text-sm flex items-center gap-3 ${isSelected ? "bg-[#F6F6F6] dark:bg-[#272727] dark:text-white font-semibold" : "hover:bg-[#F6F6F6] dark:hover:bg-[#272727] dark:text-neutral-200"}`}
                      >
                        <span className="text-base shrink-0">
                          {option.icon}
                        </span>
                        <span className="truncate flex-1">{option.label}</span>
                        <span className="text-[#606060] dark:text-[#AAAAAA] shrink-0">
                          {option.value}
                        </span>
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>
          </FluentCard>
        )}
      </div>
    </div>
  )
}

export default AccountSettingsForm
