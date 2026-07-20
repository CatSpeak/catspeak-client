import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink";

const MobileNavItem = ({ navKey, onClose }) => {
  const { t } = useLanguage();
  const { lang } = useParams();
  const isActive = useActiveLink(navKey);

  if (navKey === "cart" || navKey === "connect") return null;

  const currentLang = lang || localStorage.getItem("communityLanguage") || "en";

  let href;
  if (navKey === "catSpeak") {
    href = `/${currentLang}/cat-speak/news`;
  } else if (navKey === "cart") {
    href = "/cart";
  } else if (navKey === "connect") {
    href = "/connect";
  } else {
    href = "/";
  }

  const label = t.nav?.[navKey] || navKey;

  return (
    <NavLink
      to={href}
      onClick={onClose}
      title={label}
      className={`flex items-center px-3 h-10 w-full text-sm rounded-[5px] transition-colors min-w-0 ${
        isActive
          ? "text-cath-red-700 bg-[#F2F2F2] hover:bg-[#E6E6E6]"
          : "hover:bg-[#F2F2F2]"
      }`}
    >
      <span className="truncate min-w-0">{label}</span>
    </NavLink>
  );
};

export default MobileNavItem;
