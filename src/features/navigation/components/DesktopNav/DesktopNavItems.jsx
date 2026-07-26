import React from "react";
import { Settings, Globe } from "lucide-react";
import { LayoutGroup } from "framer-motion";
import { useLanguage } from "@/shared/context/LanguageContext";
import DesktopNavItem from "./DesktopNavItem";
import DesktopNavSection from "./DesktopNavSection";
import {
  navSections,
  footerLinks,
  settingNavLinks,
} from "../../config/navigation";
import { useActiveLink } from "../../hooks/useActiveLink";
import { useSidebar } from "@/shared/context/SidebarContext";
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher";
import { useAuth } from "@/features/auth";

const DesktopNavItems = () => {
  const { t } = useLanguage();
  const { isStudent } = useRoleOverride();
  const { resolvePath, pathname, currentLang } = useActiveLink();
  const { isAuthenticated } = useAuth();

  const { isDesktopSidebarDocked } = useSidebar();
  const isSettingsPage = pathname.startsWith("/setting");

  return (
    <LayoutGroup id="sidebarNav">
      <div
        className={`flex-1 ${
          isDesktopSidebarDocked
            ? "overflow-visible"
            : "overflow-y-auto overflow-x-hidden"
        }`}
      >
        {isSettingsPage ? (
          <div className="flex flex-col gap-1 w-full p-4">
            {!isDesktopSidebarDocked && (
              <div className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 select-none">
                {t.nav?.settings || "Settings"}
              </div>
            )}
            {settingNavLinks
              .filter((item) => {
                if (item.hideInSidebar) return false;
                if (item.lang && item.lang !== currentLang) return false;
                if (item.isPrivate && !isAuthenticated) return false;
                return true;
              })
              .map((item) => {
                const label = t.nav?.[item.key] || item.label || item.key;
                const IconComponent = item.icon || Globe;
                return (
                  <DesktopNavItem
                    key={item.key}
                    to={resolvePath(item.path)}
                    icon={IconComponent}
                    label={label}
                    color={item.color}
                    img={item.img}
                    isDocked={isDesktopSidebarDocked}
                  />
                );
              })}
          </div>
        ) : (
          (() => {
            let renderedCount = 0;
            return navSections.map((section) => {
              const hasVisibleItems = (section.items || []).some((item) => {
                if (item.hideInSidebar) return false;
                if (item.lang && item.lang !== currentLang) return false;
                if (item.isPrivate && !isAuthenticated) return false;
                if (item.key === "myCourses" && isStudent) return false;
                return true;
              });

              if (!hasVisibleItems) return null;

              const hasTopBorder = renderedCount > 0;
              renderedCount++;

              return (
                <DesktopNavSection
                  key={section.key}
                  section={section}
                  isDocked={isDesktopSidebarDocked}
                  hasTopBorder={hasTopBorder}
                />
              );
            });
          })()
        )}
      </div>

      <div
        className={`p-4 flex flex-col gap-1 mt-auto border-t ${isDesktopSidebarDocked ? "border-white/20" : "border-border"}`}
      >
        {footerLinks.map((item) => {
          const label = t.nav?.[item.key] || item.label || item.key;
          const IconComponent = item.icon || Settings;

          return (
            <DesktopNavItem
              key={item.key}
              to={resolvePath(item.path)}
              icon={IconComponent}
              label={label}
              color={item.color}
              img={item.img}
              isDocked={isDesktopSidebarDocked}
            />
          );
        })}
      </div>
    </LayoutGroup>
  );
};

export default DesktopNavItems;
