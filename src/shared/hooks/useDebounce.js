import { useState, useEffect } from "react"

/**
 * Custom hook to debounce any value (e.g. search input string, window dimensions).
 *
 * @param {*} value - The value to debounce.
 * @param {number} [delay=300] - Delay in milliseconds before updating the debounced value.
 * @returns {*} The debounced value.
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
