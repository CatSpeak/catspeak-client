import React from "react"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Dropdown from "@/shared/components/ui/Dropdown"
import { ChevronDown } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"

const NATIONALITIES = [
  "Viet Nam",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
]

const InstructorPersonalInfo = ({ formData, onChange, readOnly = false, errors = {}, t }) => {
  const ins = t.profile?.instructor || {}

  return (
    <FluentCard className="gap-6 !justify-start">
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
            <TextInput
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={onChange}
              placeholder={ins.inputFieldPlaceholder || "Input field"}
              disabled={readOnly}
              className={`!h-11 !rounded-xl bg-gray-50/50 border px-3 ${errors.phoneNumber ? "border-red-500" : "border-gray-100"}`}
              containerClassName="!gap-0"
            />
            {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
          </div>

          <div id="field-nationality" className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              {ins.nationality || "Quốc tịch"}
            </label>
            <Dropdown
              options={NATIONALITIES.map((n) => ({ label: n, value: n }))}
              value={formData.nationality}
              onChange={(val) => onChange({ target: { name: "nationality", value: val } })}
              disabled={readOnly}
              placeholder={ins.selectNationality || "Chọn quốc tịch"}
              trigger={(isOpen, selectedOption, toggle) => (
                <button
                  type="button"
                  onClick={toggle}
                  disabled={readOnly}
                  className={`w-full h-11 px-3 rounded-xl flex items-center justify-between gap-2 transition bg-gray-50/50 border text-gray-700 hover:bg-gray-100/50 disabled:opacity-50 ${errors.nationality ? "border-red-500" : "border-gray-100"}`}
                >
                  <span className={`flex-1 text-left text-sm truncate min-w-0 ${!selectedOption ? "text-gray-400" : ""}`}>
                    {selectedOption ? selectedOption.label : (ins.selectNationality || "Chọn quốc tịch")}
                  </span>
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
