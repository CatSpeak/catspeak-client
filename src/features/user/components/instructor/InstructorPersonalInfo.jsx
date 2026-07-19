import React from "react"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Dropdown from "@/shared/components/ui/Dropdown"
import { ChevronDown } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { countryOptions, phonePrefixes } from "@/shared/constants/countriesOptions"

const InstructorPersonalInfo = ({ formData, onChange, readOnly = false, errors = {}, t }) => {
  const ins = t.profile?.instructor || {}

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
    <FluentCard className="gap-6 !justify-start h-full min-h-[365px]">
      <h2 className="text-xl font-bold text-gray-900">
        {ins.yourInfo || "Thông tin của bạn"}
      </h2>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div id="field-fullName" className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {ins.fullName || "Họ và tên"}
            </label>
            <TextInput
              name="fullName"
              value={formData.fullName}
              onChange={onChange}
              placeholder={ins.inputFieldPlaceholder || "Input field"}
              disabled={readOnly}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors.fullName ? "border-red-500" : "border-gray-100"}`}
              containerClassName="!gap-0"
            />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
          </div>

          <div id="field-email" className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {ins.email || "Email"}
            </label>
            <TextInput
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder={ins.inputFieldPlaceholder || "Input field"}
              disabled={readOnly}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors.email ? "border-red-500" : "border-gray-100"}`}
              containerClassName="!gap-0"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div id="field-phoneNumber" className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {ins.phoneNumber || "Số điện thoại"}
            </label>
            <Dropdown
              options={phonePrefixes}
              value={formData.phonePrefix}
              onChange={(val) => onChange({ target: { name: "phonePrefix", value: val } })}
              disabled={readOnly}
              enableSearch={true}
              searchPlaceholder={ins.searchPhoneCode || "Tìm kiếm mã vùng..."}
              dropdownClassName="w-full min-w-[260px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
              trigger={(isOpen, selectedOption, toggleDropdown) => (
                <TextInput
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={onChange}
                  placeholder={ins.inputFieldPlaceholder || "Input field"}
                  disabled={readOnly}
                  className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors.phoneNumber ? "border-red-500" : "border-gray-100"}`}
                  containerClassName="!gap-0"
                  leftContentWidthClass={plClass}
                  leftContent={
                    <div className="flex items-center h-full">
                      <button
                        type="button"
                        disabled={readOnly}
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
            {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
          </div>

          <div id="field-nationality" className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {ins.nationality || "Quốc tịch"}
            </label>
            <Dropdown
              options={countryOptions}
              value={formData.nationality}
              onChange={(val) => onChange({ target: { name: "nationality", value: val } })}
              disabled={readOnly}
              enableSearch={true}
              searchPlaceholder={ins.searchCountry || "Tìm kiếm quốc gia..."}
              placeholder={ins.selectNationality || "Chọn quốc tịch"}
              trigger={(isOpen, selectedOption, toggle) => (
                <button
                  type="button"
                  onClick={toggle}
                  disabled={readOnly}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between gap-2 transition bg-gray-50/50 border text-gray-700 hover:bg-gray-100/50 disabled:opacity-50 ${errors.nationality ? "border-red-500" : "border-gray-100"}`}
                >
                  <div className={`flex items-center gap-2 text-sm truncate min-w-0 flex-1 ${!selectedOption ? "text-gray-400" : ""}`}>
                    {selectedOption?.icon}
                    <span className="truncate">
                      {selectedOption ? selectedOption.label : (ins.selectNationality || "Chọn quốc tịch")}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
              )}
            />
            {errors.nationality && <p className="text-xs text-red-500">{errors.nationality}</p>}
          </div>
        </div>

        <div id="field-address" className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-800">
            {ins.address || "Địa chỉ của bạn"}
          </label>
          <TextInput
            name="address"
            value={formData.address}
            onChange={onChange}
            placeholder={ins.inputFieldPlaceholder || "Input field"}
            disabled={readOnly}
            className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors.address ? "border-red-500" : "border-gray-100"}`}
            containerClassName="!gap-0"
          />
          {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
        </div>
      </div>
    </FluentCard>
  )
}

export default InstructorPersonalInfo
