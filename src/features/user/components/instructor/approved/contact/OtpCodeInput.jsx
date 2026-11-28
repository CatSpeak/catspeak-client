import React, { useRef } from "react"

const OTP_LENGTH = 6

/**
 * Six-box OTP field drawn to match the mockups. A single real <input> sits
 * transparently over the boxes, so typing, backspace and paste all behave
 * natively while the visuals stay as discrete slots.
 */
const OtpCodeInput = ({
  value = "",
  onChange,
  length = OTP_LENGTH,
  disabled = false,
  error = false,
  ariaLabel,
  describedBy,
}) => {
  const inputRef = useRef(null)
  const digits = String(value).replace(/\D/g, "").slice(0, length)
  const slots = Array.from({ length })

  const handleChange = (event) => {
    onChange?.(event.target.value.replace(/\D/g, "").slice(0, length))
  }

  return (
    <div
      className="relative w-full"
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={length}
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={describedBy}
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />
      <div className="flex items-center gap-2.5">
        {slots.map((_, index) => (
          <div
            key={index}
            className={`flex h-12 w-[42px] items-center justify-center rounded-lg border bg-white text-[15px] font-semibold text-[#101828] dark:bg-[#242424] dark:text-white dark:border-[#3F3F3F] ${
              error ? "border-red-500 dark:border-red-400" : "border-[#D0D5DD]"
            }`}
          >
            {digits[index] || ""}
          </div>
        ))}
      </div>
    </div>
  )
}

export default OtpCodeInput
