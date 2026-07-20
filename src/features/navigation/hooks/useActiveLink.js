import { useLocation, useParams } from "react-router-dom"

export const useActiveLink = () => {
  const location = useLocation()
  const { lang } = useParams()
  const currentLang = lang || localStorage.getItem("communityLanguage") || "zh"

  // Resolves the path with the current language prefix if needed
  const resolvePath = (p) => {
    if (!p) return p
    if (p.startsWith('/website')) {
      return `/${currentLang}/cat-speak${p}`
    }
    if (p.startsWith('/community') || p.startsWith('/cat-speak')) {
      return `/${currentLang}${p}`
    }
    return p
  }

  // Checks if a navigation item or its dropdown sub-items are active
  const checkIsActive = (item) => {
    if (item.hasDropdown && item.subItems && item.subItems.length > 0) {
      return item.subItems.some((sub) => {
        if (sub.hasDropdown && sub.subItems && sub.subItems.length > 0) {
          return sub.subItems.some((nestedSub) => {
            const res = resolvePath(nestedSub.path)
            return res && location.pathname.startsWith(res)
          })
        }
        const res = resolvePath(sub.path)
        return res && location.pathname.startsWith(res)
      })
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
