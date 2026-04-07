import React from "react"
import colors from "@/shared/utils/colors"

const FormSelect = ({ name, label, placeholder, rules, options, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1 w-full text-left relative">
      {label && (
        <label htmlFor={name} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-full border border-gray-300 bg-white px-4 py-3 text-base outline-none transition focus:border-[#72000d]"
        style={{ color: value ? "inherit" : "#9ca3af" }}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-black">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FormSelect
