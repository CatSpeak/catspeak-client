import { useState, useEffect } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { NavLink, useParams } from "react-router-dom";
import { Globe } from "lucide-react";

const DesktopNavItem = ({ navKey, color, img }) => {
  const { t } = useLanguage();
  const { lang } = useParams();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [img]);

  if (navKey === "cart" || navKey === "connect") return null;

  // Determine href based on key
  let href;
  if (navKey === "catSpeak") {
    const currentLang =
      lang || localStorage.getItem("communityLanguage") || "zh";
    href = `/${currentLang}/cat-speak/news`;
  } else if (navKey === "cart") {
    href = "/cart";
  } else if (navKey === "connect") {
    href = "/connect";
  } else if (navKey === "workspace") {
    href = "/workspace";
  } else {
    // Default fallback
    href = "/";
  }

  const label = t.nav?.[navKey] || (navKey === "workspace" ? "My Workspace" : navKey);

  return (
    <NavLink
      to={href}
      title={label}
      className="flex h-10 w-36 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-base font-bold tracking-wide transition-colors duration-200 no-underline hover:bg-gray-100/50 text-black hover:text-[#990011]"
      style={color ? { color } : undefined}
    >
      {img && !imgError ? (
        <img
          src={img}
          alt=""
          onError={() => setImgError(true)}
          className="w-5 h-5 object-contain shrink-0 rounded-sm"
        />
      ) : img !== undefined ? (
        <Globe size={18} className="shrink-0" style={color ? { color } : undefined} />
      ) : null}
      <span className="truncate min-w-0">{label}</span>
    </NavLink>
  );
};

export default DesktopNavItem;
