import React from "react"
import colors from "@/shared/utils/colors"

const FormSelect = ({ name, label, placeholder, rules, options, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1 w-full text-left relative">
      {label && (
        <label htmlFor={name} className="text-sm font-semibold text-gray-700 dark:text-neutral-200">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-full border border-gray-300 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] dark:text-white px-4 py-3 text-base outline-none transition focus:border-[#72000d] dark:focus:border-red-400"
        style={{ color: value ? "inherit" : "#9ca3af" }}
      >
        {placeholder && (
          <option value="" disabled hidden className="text-gray-400 dark:text-neutral-500">
            {placeholder}
          </option>
        )}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-black dark:text-white dark:bg-[#272727]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FormSelect
