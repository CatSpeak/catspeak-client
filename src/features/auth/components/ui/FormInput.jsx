import React from "react"
import colors from "@/shared/utils/colors"

const FormInput = ({ name, label, placeholder, rules, type = "text", value, onChange }) => {
  return (
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={name} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-full border border-gray-300 px-4 py-3 text-base outline-none transition focus:border-[#72000d]"
      />
    </div>
  )
}

export default FormInput
