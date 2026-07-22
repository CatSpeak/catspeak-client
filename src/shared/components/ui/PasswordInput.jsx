import React, { useState } from "react"
import { Eye, EyeOff, Check, X } from "lucide-react"

const PasswordInput = ({
  name,
  value,
  onChange,
  placeholder,
  isValid,
  validMessage,
  invalidMessage,
  className = "",
}) => {
  const [show, setShow] = useState(false)

  const toggleShow = () => setShow((prev) => !prev)

  // Determine border and focus colors based on validation state
  let borderClass = "border-[#e2e2e2] focus:border-red-900"
  if (isValid === true) borderClass = "border-green-600 focus:border-green-600"
  else if (isValid === false) borderClass = "border-red-600 focus:border-red-600"

  return (
    <div>
      <div className="relative flex items-center">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-12 rounded-2xl border px-4 pr-10 text-base focus:outline-none transition-colors duration-200 ${borderClass} ${className}`}
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
        >
          {show ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {isValid === false && invalidMessage && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1 px-1">
          <X size={12} /> {invalidMessage}
        </p>
      )}
      {isValid === true && validMessage && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1 px-1">
          <Check size={12} /> {validMessage}
        </p>
      )}
    </div>
  )
}

export default PasswordInput
