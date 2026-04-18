import { useEffect } from "react"

/**
 * Hook to handle clicks outside a specified element.
 * 
 * @param {React.RefObject} ref - The ref of the element to monitor.
 * @param {Function} handler - The function to call when a click outside occurs.
 * @param {Object} options - Additional options.
 * @param {boolean} options.enabled - Whether the event listener is active. Default is true.
 * @param {string} options.ignoreSelector - A CSS selector. If the click happens on an element matching or inside this selector, it will be ignored.
 */
const useClickOutside = (ref, handler, options = {}) => {
  const { enabled = true, ignoreSelector = null } = options

  useEffect(() => {
    if (!enabled) return

    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }

      // Do nothing if clicking ignored element or its descendents
      if (ignoreSelector && event.target.closest?.(ignoreSelector)) {
        return
      }

      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler, enabled, ignoreSelector])
}

export default useClickOutside
