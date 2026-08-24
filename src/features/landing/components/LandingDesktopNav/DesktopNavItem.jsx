import { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { NavLink, useParams } from "react-router-dom"
import { Globe } from "lucide-react"

const DesktopNavItem = ({ navKey, path, color, img }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const [imgError, setImgError] = useState(false)

  if (navKey === "cart" || navKey === "connect") return null

  // Determine href based on key
  let href
  if (navKey === "catSpeak") {
    const currentLang =
      lang || localStorage.getItem("communityLanguage") || "zh"
    href = `/${currentLang}/cat-speak/news`
  } else if (navKey === "workspace") {
    href = "/workspace"
  } else {
    href = path || "/"
  }

  return (
    <NavLink
      to={href}
      className="flex min-w-max h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-200 no-underline hover:bg-[#E5E5E5] active:bg-[#e0e0e0] text-black hover:text-[#990011]"
      style={color ? { color } : undefined}
    >
      {img && !imgError ? (
        <img
          key={img}
          src={img}
          alt=""
          onError={() => setImgError(true)}
          className="w-5 h-5 object-contain shrink-0 rounded-sm"
        />
      ) : img !== undefined ? (
        <Globe size={18} className="shrink-0" style={color ? { color } : undefined} />
      ) : null}
      <span>{t.nav?.[navKey] || (navKey === "workspace" ? "My Workspace" : navKey)}</span>
    </NavLink>
  )
}

export default DesktopNavItem
