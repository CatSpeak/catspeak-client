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
  let borderClass = "border-[#e2e2e2] dark:border-[#3F3F3F] focus:border-cath-red-700 dark:focus:border-red-400"
  if (isValid === true) borderClass = "border-green-600 dark:border-green-500 focus:border-green-600 dark:focus:border-green-500"
  else if (isValid === false) borderClass = "border-red-600 dark:border-red-500 focus:border-red-600 dark:focus:border-red-500"

  const hasDarkBg = className.split(" ").some((c) => /(^|\s)(!?)dark:bg-/.test(c))
  const hasLightBg = className.split(" ").some((c) => /(^|\s)(!?)bg-/.test(c) && !/(^|\s)(!?)dark:bg-/.test(c))
  const bgClass = `${hasLightBg ? "" : "bg-white"} ${hasDarkBg ? "" : "dark:bg-[#242424]"}`

  return (
    <div>
      <div className="relative flex items-center">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-12 rounded-2xl border px-4 pr-10 text-base ${bgClass} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#AAAAAA] focus:outline-none transition-colors duration-200 ${borderClass} ${className}`}
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-4 text-gray-400 hover:text-gray-600 dark:text-[#AAAAAA] dark:hover:text-white focus:outline-none cursor-pointer"
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
