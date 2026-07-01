import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Home, Settings } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import MobileNavItem from "./MobileNavItem"
import MobileNavDropdown from "./MobileNavDropdown"
import MobileNavSubItem from "./MobileNavSubItem"
import { navLinks, footerLinks } from "../../config/navigation"
import { useActiveLink } from "../../hooks/useActiveLink"
import MobileLanguageSwitcher from "./MobileLanguageSwitcher"
import MobileCommunitySwitcher from "./MobileCommunitySwitcher"

const MobileNavItems = ({ setIsMobileOpen }) => {
  const { t } = useLanguage();
  const { resolvePath, checkIsActive, pathname } = useActiveLink();

  const [openDropdownKey, setOpenDropdownKey] = useState(() => {
    const activeItem = navLinks.find(
      (item) => item.hasDropdown && checkIsActive(item),
    );
    return activeItem ? activeItem.key : null;
  });

  useEffect(() => {
    const activeItem = navLinks.find(
      (item) => item.hasDropdown && checkIsActive(item),
    );
    if (activeItem) {
      setOpenDropdownKey(activeItem.key);
    } else {
      setOpenDropdownKey(null);
    }
  }, [pathname]);

  return (
    <>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 flex flex-col gap-2 scrollbar-none">
        {navLinks.map((item) => {
          const label = t.nav?.[item.key] || item.key
          const IconComponent = item.icon || Home

            return (
              <MobileNavItem
                key={item.key}
                to={resolvePath(item.path)}
                icon={IconComponent}
                label={label}
                setIsMobileOpen={setIsMobileOpen}
              />
            );
          })}
      </div>

      <div className="px-3 py-4 flex flex-col gap-2 mt-auto border-t border-gray-100">
        <MobileCommunitySwitcher />
        <MobileLanguageSwitcher />

        {footerLinks.map((item) => {
          const label = t.nav?.[item.key] || item.key
          const IconComponent = item.icon || Settings
          
          return (
            <MobileNavItem
              key={item.key}
              to={resolvePath(item.path)}
              icon={IconComponent}
              label={label}
              setIsMobileOpen={setIsMobileOpen}
            />
          );
        })}
      </div>
    </>
  );
};

export default MobileNavItems;
