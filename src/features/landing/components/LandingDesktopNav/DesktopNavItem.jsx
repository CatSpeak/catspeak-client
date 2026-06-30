import { useLanguage } from "@/shared/context/LanguageContext";
import { NavLink, useParams } from "react-router-dom";

const DesktopNavItem = ({ navKey }) => {
  const { t } = useLanguage();
  const { lang } = useParams();

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

  return (
    <NavLink
      to={href}
      className="flex min-w-max h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full px-4 text-base font-bold tracking-wide transition-colors duration-200 no-underline hover:bg-gray-100/50
        text-black hover:text-[#990011]"
    >
      {t.nav?.[navKey] || (navKey === "workspace" ? "My Workspace" : navKey)}
    </NavLink>
  );
};

export default DesktopNavItem;
