import React, {
  useRef,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from "react"
import TextInput from "./TextInput"

/**
 * Format a raw number or string to vi-VN thousand-separated dots (e.g. "10500000" -> "10.500.000")
 */
export const formatCurrencyValue = (val) => {
  if (val === null || val === undefined || val === "") return ""
  const clean = String(val).replace(/\D/g, "")
  if (!clean) return ""
  return new Intl.NumberFormat("vi-VN").format(Number(clean))
}

/**
 * Parse a formatted string back to raw digits (e.g. "10.500.000" -> "10500000")
 */
export const parseCurrencyValue = (val) => {
  if (val === null || val === undefined) return ""
  return String(val).replace(/\D/g, "")
}

/**
 * Count raw numeric digits in a string up to a specific index
 */
const countDigitsUpTo = (str, index) => {
  let count = 0
  for (let i = 0; i < index && i < str.length; i++) {
    if (/\d/.test(str[i])) count++
  }
  return count
}

/**
 * Find character index in formatted string right after a given count of digits
 */
const findIndexAfterDigits = (str, digitCount) => {
  if (digitCount <= 0) return 0
  let count = 0
  for (let i = 0; i < str.length; i++) {
    if (/\d/.test(str[i])) {
      count++
      if (count === digitCount) {
        return i + 1
      }
    }
  }
  return str.length
}

export const CurrencyInput = forwardRef(
  (
    {
      value,
      onChange,
      onValueChange,
      onKeyDown,
      placeholder = "0",
      rightContent = "₫",
      maxDigits,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef(null)
    const nextCursorRef = useRef(null)

    useImperativeHandle(ref, () => inputRef.current)

    // Format controlled value for display
    const displayValue = formatCurrencyValue(value)

    useLayoutEffect(() => {
      if (nextCursorRef.current !== null && inputRef.current) {
        const pos = Math.min(
          nextCursorRef.current,
          inputRef.current.value.length,
        )
        inputRef.current.setSelectionRange(pos, pos)
        nextCursorRef.current = null
      }
    })

    const triggerChange = (rawVal, formattedVal, targetCursor) => {
      nextCursorRef.current = targetCursor

      if (onChange) {
        const syntheticEvent = {
          target: {
            name: props.name,
            value: rawVal,
            rawValue: rawVal ? Number(rawVal) : 0,
            formattedValue: formattedVal,
          },
        }
        onChange(syntheticEvent, rawVal)
      }

      if (onValueChange) {
        onValueChange(rawVal, rawVal ? Number(rawVal) : 0)
      }
    }

    const handleKeyDown = (e) => {
      onKeyDown?.(e)
      if (e.defaultPrevented) return

      const input = e.target
      const { selectionStart, selectionEnd, value: currentVal } = input

      // Handle Backspace directly after a separator dot (e.g. "10.|500.000")
      if (
        e.key === "Backspace" &&
        selectionStart === selectionEnd &&
        selectionStart > 0
      ) {
        const pos = selectionStart
        if (currentVal[pos - 1] === ".") {
          e.preventDefault()
          // Delete the digit before the dot
          const digitsBefore = currentVal
            .slice(0, pos - 1)
            .replace(/\D/g, "")
            .slice(0, -1)
          const digitsAfter = currentVal.slice(pos).replace(/\D/g, "")
          const newRaw = digitsBefore + digitsAfter
          const newFormatted = formatCurrencyValue(newRaw)
          const targetCursor = findIndexAfterDigits(
            newFormatted,
            digitsBefore.length,
          )
          triggerChange(newRaw, newFormatted, targetCursor)
          return
        }
      }

      // Handle Delete directly before a separator dot (e.g. "10|.500.000")
      if (
        e.key === "Delete" &&
        selectionStart === selectionEnd &&
        selectionStart < currentVal.length
      ) {
        const pos = selectionStart
        if (currentVal[pos] === ".") {
          e.preventDefault()
          // Delete the digit after the dot
          const digitsBefore = currentVal.slice(0, pos).replace(/\D/g, "")
          const digitsAfter = currentVal
            .slice(pos + 1)
            .replace(/\D/g, "")
            .slice(1)
          const newRaw = digitsBefore + digitsAfter
          const newFormatted = formatCurrencyValue(newRaw)
          const targetCursor = findIndexAfterDigits(
            newFormatted,
            digitsBefore.length,
          )
          triggerChange(newRaw, newFormatted, targetCursor)
          return
        }
      }
    }

    const handleChange = (e) => {
      const input = e.target
      const currentVal = input.value
      const currentCursor = input.selectionStart

      const digitsBefore = countDigitsUpTo(currentVal, currentCursor)
      const raw = currentVal.replace(/\D/g, "")

      if (maxDigits && raw.length > maxDigits) return

      const newFormatted = formatCurrencyValue(raw)
      const targetCursor = findIndexAfterDigits(newFormatted, digitsBefore)

      triggerChange(raw, newFormatted, targetCursor)
    }

    return (
      <TextInput
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rightContent={rightContent}
        {...props}
      />
    )
  },
)

CurrencyInput.displayName = "CurrencyInput"

export default CurrencyInput
