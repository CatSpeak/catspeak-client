import React from "react"
import { colors } from "@/shared/utils/colors"

const FormTextField = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  type = "text",
  InputProps,
}) => {
  return (
    <div className="flex w-full flex-col gap-1 text-left">
      {label && (
        <label
          className={`text-sm font-bold ${
            error ? "text-red-500" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative flex w-full items-center">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-full border px-4 py-3 text-sm outline-none transition ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-[#72000d]"
          }`}
        />
        {InputProps?.endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {InputProps.endAdornment}
          </div>
        )}
      </div>
      {helperText && (
        <span
          className={`mt-1 text-xs ${
            error ? "text-red-500" : "text-gray-500"
          }`}
        >
          {helperText}
        </span>
      )}
    </div>
  )
}

export default FormTextField
