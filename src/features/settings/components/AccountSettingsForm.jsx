import React from "react"
import { Pencil } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import { DatePicker } from "@/shared/components/ui/inputs"
import Dropdown from "@/shared/components/ui/Dropdown"
import { ChevronDown } from "lucide-react"
import ChangePasswordSection from "./ChangePasswordSection"
import { countryOptions, phonePrefixes } from "@/shared/constants/countriesOptions"

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
      <FluentCard className="flex flex-col w-full p-6 sm:p-8 gap-8 border-[#e5e5e5] rounded-xl shadow-sm">
      {/* 1. THÔNG TIN CÁ NHÂN */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t.profile?.personalInfo?.title || "Thông tin cá nhân"}
          </h2>
          {!isEditingPersonal ? (
            <button
              onClick={() => onEdit("personalInfo")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-cath-red-700 text-cath-red-700 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <Pencil size={16} />
              <span>{t.profile?.personalInfo?.edit || "Sửa"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                disabled={isUpdating}
              >
                {t.profile?.personalInfo?.cancel || "Hủy"}
              </button>
              <button
                onClick={() => onSave("personalInfo")}
                className="px-4 py-1.5 rounded-full bg-cath-red-700 text-white hover:bg-cath-red-800 transition-colors text-sm font-medium disabled:opacity-50"
                disabled={isUpdating}
              >
                {t.profile?.personalInfo?.save || "Lưu"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {t.profile?.personalInfo?.username || "Tên đăng nhập"}
            </label>
            <TextInput
              name="username"
              value={formData.username}
              onChange={onChange}
              disabled={!isEditingPersonal || isUpdating}
              placeholder={t.profile?.personalInfo?.enterUsername || "Nhập tên đăng nhập..."}
              error={errors?.username}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors?.username ? "border-red-500" : "border-gray-100"}`}
              containerClassName="!gap-0"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {t.profile?.personalInfo?.nickname || "Biệt danh"}
            </label>
            <TextInput
              name="nickname"
              value={formData.nickname}
              onChange={onChange}
              disabled={!isEditingPersonal || isUpdating}
              placeholder={t.profile?.personalInfo?.enterNickname || "Nhập biệt danh..."}
              error={errors?.nickname}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors?.nickname ? "border-red-500" : "border-gray-100"}`}
              containerClassName="!gap-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {t.profile?.personalInfo?.country || "Quốc gia"}
            </label>
          <Dropdown
            options={countryOptions}
            value={formData.country}
            onChange={(val) => onCountryChange(val)}
            disabled={!isEditingPersonal || isUpdating}
            enableSearch={true}
            searchPlaceholder={t.profile?.personalInfo?.searchCountry || "Tìm kiếm quốc gia..."}
            placeholder={t.profile?.personalInfo?.selectCountry || "Chọn quốc gia"}
            trigger={(isOpen, selectedOption, toggle) => (
              <button
                type="button"
                onClick={toggle}
                disabled={!isEditingPersonal || isUpdating}
                className={`w-full h-11 px-3 rounded-xl flex items-center justify-between gap-2 transition bg-gray-50/50 border text-gray-700 hover:bg-gray-100/50 disabled:opacity-50 ${
                  errors?.country ? "border-red-500" : "border-gray-100"
                }`}
              >
                <div className={`flex items-center gap-2 text-sm truncate min-w-0 flex-1 ${!selectedOption ? "text-gray-400" : ""}`}>
                  {selectedOption?.icon}
                  <span className="truncate">
                    {selectedOption ? selectedOption.label : (t.profile?.personalInfo?.selectCountry || "Chọn quốc gia")}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            {t.profile?.personalInfo?.dateOfBirth || t.auth?.dateOfBirthLabel || "Ngày sinh"}
          </label>
          <DatePicker
            value={formData.dateOfBirth}
            onChange={() => {
              // Date of birth updating is locked
            }}
            disabled={true}
            className={`w-full flex ${errors?.dateOfBirth ? "[&>button]:!border-red-500" : "[&>button]:!border-gray-100"} [&>button]:!h-11 [&>button]:!rounded-xl [&>button]:!bg-gray-50/50 [&>button]:w-full [&>button]:justify-between`}
          />
        </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            {t.profile?.personalInfo?.address || "Địa chỉ"}
          </label>
          <TextInput
            name="address"
            value={formData.address || ""}
            onChange={onChange}
            disabled={!isEditingPersonal || isUpdating}
            placeholder={t.profile?.personalInfo?.enterAddress || "Nhập địa chỉ của bạn..."}
            error={errors?.address}
            className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors?.address ? "border-red-500" : "border-gray-100"}`}
            containerClassName="!gap-0"
          />
        </div>

      </div>
    </FluentCard>

      {/* 2. TÀI KHOẢN VÀ BẢO MẬT */}
      <FluentCard className="flex flex-col w-full p-6 sm:p-8 gap-8 border-[#e5e5e5] rounded-xl shadow-sm">
        <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {t.profile?.personalInfo?.accountAndPrivacy || "Tài khoản và bảo mật"}
          </h2>
          {!isEditingSecurity ? (
            <button
              onClick={() => onEdit("securityInfo")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-cath-red-700 text-cath-red-700 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <Pencil size={16} />
              <span>{t.profile?.personalInfo?.edit || "Sửa"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                disabled={isUpdating}
              >
                {t.profile?.personalInfo?.cancel || "Hủy"}
              </button>
              <button
                onClick={() => onSave("securityInfo")}
                className="px-4 py-1.5 rounded-full bg-cath-red-700 text-white hover:bg-cath-red-800 transition-colors text-sm font-medium disabled:opacity-50"
                disabled={isUpdating}
              >
                {t.profile?.personalInfo?.save || "Lưu"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {t.profile?.personalInfo?.accountType || "Loại tài khoản"}
            </label>
            <TextInput
              name="accountType"
              value={formData.accountType || "User"}
              disabled={true}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 border-gray-100 text-gray-500 cursor-not-allowed`}
              containerClassName="!gap-0"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {t.profile?.personalInfo?.email || "Email"}
            </label>
            <TextInput
              type="email"
              name="email"
              value={formData.email}
              onChange={() => {
                // Email updating is locked
              }}
              disabled={true}
              placeholder={t.profile?.personalInfo?.enterEmail || "Nhập địa chỉ email..."}
              error={errors?.email}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 border-gray-100 text-gray-500 cursor-not-allowed`}
              containerClassName="!gap-0"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {t.profile?.personalInfo?.phoneNumber || "Số điện thoại"}
            </label>
            <Dropdown
              options={phonePrefixes}
              value={formData.phonePrefix}
              onChange={(val) => onChange({ target: { name: "phonePrefix", value: val } })}
              disabled={!isEditingSecurity || isUpdating}
              enableSearch={true}
              searchPlaceholder={t.profile?.personalInfo?.searchPhoneCode || "Tìm kiếm mã vùng..."}
              dropdownClassName="w-full min-w-[260px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
              trigger={(isOpen, selectedOption, toggleDropdown) => (
                <TextInput
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={onChange}
                  disabled={!isEditingSecurity || isUpdating}
                  placeholder={t.profile?.personalInfo?.enterPhoneNumber || "Nhập số điện thoại..."}
                  error={errors?.phoneNumber}
                  className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors?.phoneNumber ? "border-red-500" : "border-gray-100"}`}
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
                        className="flex items-center gap-1 pl-0 pr-1 h-full focus:outline-none cursor-pointer disabled:opacity-50"
                      >
                        <span className="text-base leading-none">
                          {phonePrefixes.find((p) => p.value === formData.phonePrefix)?.icon}
                        </span>
                        <ChevronDown size={14} className="text-gray-500" />
                      </button>
                      <span className="text-[#606060] text-sm ml-1">
                        {formData.phonePrefix}
                      </span>
                    </div>
                  }
                />
              )}
              renderOption={(option, isSelected) => (
                <div className={`w-full h-10 px-3 text-left text-sm flex items-center gap-3 ${isSelected ? "bg-[#F6F6F6] font-semibold" : "hover:bg-[#F6F6F6]"}`}>
                  <span className="text-base shrink-0">{option.icon}</span>
                  <span className="truncate flex-1">{option.label}</span>
                  <span className="text-[#606060] shrink-0">{option.value}</span>
                </div>
              )}
            />
          </div>
        </div>

        <div className="w-full p-6 border border-gray-200 rounded-xl mt-2">
          <ChangePasswordSection t={t} />
        </div>
        </div>
      </FluentCard>
    </div>
  )
}

export default AccountSettingsForm
