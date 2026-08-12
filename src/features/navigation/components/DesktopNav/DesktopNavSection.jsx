import React, { useState } from "react"
import { ChevronDown, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import DesktopNavItem from "./DesktopNavItem"
import ListItem from "@/shared/components/ui/ListItem"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useActiveLink } from "../../hooks/useActiveLink"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useAuth } from "@/features/auth"

const DesktopNavSection = ({
  section,
  isDocked = false,
  hasTopBorder = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { t } = useLanguage()
  const { isStudent } = useRoleOverride()
  const { resolvePath, currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()

  const filteredItems = (section.items || []).filter((item) => {
    if (item.hideInSidebar) return false
    if (item.lang && item.lang !== currentLang) return false
    if (item.isPrivate && !isAuthenticated) return false
    if (item.key === "myCourses" && isStudent) return false
    return true
  })

  if (filteredItems.length === 0) return null

  const hasLimit =
    !isDocked && section.maxInitial && filteredItems.length > section.maxInitial

  const initialItems = hasLimit
    ? filteredItems.slice(0, section.maxInitial)
    : filteredItems

  const extraItems = hasLimit ? filteredItems.slice(section.maxInitial) : []

  const sectionTitle = section.labelKey
    ? t.nav?.[section.labelKey] || section.defaultLabel
    : null

  const renderNavItem = (item) => {
    const label = t.nav?.[item.key] || item.label || item.key
    const IconComponent = item.icon || Globe
    return (
      <DesktopNavItem
        key={item.key}
        to={resolvePath(item.path)}
        icon={IconComponent}
        label={label}
        color={item.color}
        img={item.img}
        isDocked={isDocked}
      />
    )
  }

  return (
    <div
      className={`w-full p-4 ${
        hasTopBorder
          ? `border-t ${isDocked ? "border-white/20" : "border-border"}`
          : ""
      }`}
    >
      {/* Section Header Label (Expanded Mode) */}
      {sectionTitle && !isDocked && (
        <div className="px-3 pb-2 font-bold select-none">{sectionTitle}</div>
      )}

      {/* Items List */}
      <div className="flex flex-col gap-1">
        {initialItems.map(renderNavItem)}

        {hasLimit && (
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col gap-1 overflow-hidden"
              >
                {extraItems.map(renderNavItem)}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Inline "See More / Show Less" Toggle (Only when expanded) */}
        {hasLimit && (
          <ListItem
            onClick={() => setIsExpanded((prev) => !prev)}
            lines={1}
            leftContent={
              <ChevronDown
                size={20}
                className={`shrink-0 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            }
            className="rounded-2xl cursor-pointer select-none"
            contentClassName="rounded-2xl hover:bg-primaryBg text-gray-700 font-medium transition-colors px-4"
          >
            <span className="text-sm whitespace-nowrap truncate">
              {isExpanded ? t.showLess || "Show less" : t.seeMore || "See more"}
            </span>
          </ListItem>
        )}
      </div>
    </div>
  )
}

export default DesktopNavSection
