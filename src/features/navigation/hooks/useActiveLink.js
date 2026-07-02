import { useLocation, useParams } from "react-router-dom"

export const useActiveLink = () => {
  const location = useLocation()
  const { lang } = useParams()
  const currentLang = lang || localStorage.getItem("communityLanguage") || "zh"

  // Resolves the path with the current language prefix if needed
  const resolvePath = (p) => {
    if (p && (p.startsWith('/community') || p.startsWith('/cat-speak'))) {
      return `/${currentLang}${p}`
    }
    return p
  }

  // Checks if a navigation item or its dropdown sub-items are active
  const checkIsActive = (item) => {
    if (item.hasDropdown && item.subItems && item.subItems.length > 0) {
      return item.subItems.some(sub => location.pathname.startsWith(resolvePath(sub.path)))
    }
    
    const resolvedPath = resolvePath(item.path)
    if (!resolvedPath) return false
    
    return location.pathname.startsWith(resolvedPath)
  }

  return {
    resolvePath,
    checkIsActive,
    currentLang,
    pathname: location.pathname
  }
}
