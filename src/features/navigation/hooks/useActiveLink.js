import { useLocation } from "react-router-dom"

/**
 * Which primary desktop nav key matches the current path (first match wins).
 * @param {string} pathname
 * @returns {string|null}
 */
export const getActiveDesktopNavKey = (pathname) => {
  if (pathname.includes("/community")) return "community"
  if (pathname.includes("/cat-speak")) return "catSpeak"
  if (pathname.includes("/workspace")) return "workspace"
  if (pathname.startsWith("/cart")) return "cart"
  if (pathname.startsWith("/connect")) return "connect"
  return null
}

/**
 * Custom hook to check if a navigation item is active
 * @param {string} key - The navigation key (e.g., 'community', 'catSpeak')
 * @returns {boolean} - True if the item is active
 */
export const useActiveLink = (key) => {
  const location = useLocation()
  return getActiveDesktopNavKey(location.pathname) === key
}
