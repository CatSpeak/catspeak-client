import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  ShoppingCart,
  MessageCircle,
  GraduationCap,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import MobileNavItem from "./MobileNavItem";
import MobileNavDropdown from "./MobileNavDropdown";
import MobileNavSubItem from "./MobileNavSubItem";
import { navLinks, footerLinks } from "../../config/navigation";
import { useActiveLink } from "../../hooks/useActiveLink";
import MobileLanguageSwitcher from "./MobileLanguageSwitcher";
import MobileCommunitySwitcher from "./MobileCommunitySwitcher";

const iconMap = {
  community: Home,
  catSpeak: LayoutDashboard,
  cart: ShoppingCart,
  messages: MessageCircle,
  courses: GraduationCap,
  settings: Settings,
  help: HelpCircle,
};

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
        {navLinks
          .filter((item) => !item.hideInSidebar)
          .map((item) => {
            const label = t.nav?.[item.key] || item.key;
            const IconComponent = iconMap[item.key] || Home;

            if (item.hasDropdown && item.subItems && item.subItems.length > 0) {
              const isDropdownActive = checkIsActive(item);
              return (
                <MobileNavDropdown
                  key={item.key}
                  icon={IconComponent}
                  label={label}
                  isActive={isDropdownActive}
                  isOpen={openDropdownKey === item.key}
                  onToggle={() =>
                    setOpenDropdownKey((prev) =>
                      prev === item.key ? null : item.key,
                    )
                  }
                >
                  {(item.subItems || []).map((sub, idx) => (
                    <MobileNavSubItem
                      key={sub.key}
                      to={resolvePath(sub.path)}
                      label={t.nav?.[sub.key] || sub.key}
                      isLast={idx === (item.subItems || []).length - 1}
                      setIsMobileOpen={setIsMobileOpen}
                    />
                  ))}
                </MobileNavDropdown>
              );
            }

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
          const label = t.nav?.[item.key] || item.key;
          const IconComponent = iconMap[item.key] || Settings;

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
