import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Home, Settings } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DesktopNavItem from "./DesktopNavItem"
import DesktopNavDropdown from "./DesktopNavDropdown"
import DesktopNavSubItem from "./DesktopNavSubItem"
import { navLinks, footerLinks } from "../../config/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useActiveLink } from "../../hooks/useActiveLink"

const DesktopNavItems = ({ isExpanded, setIsExpanded }) => {
  const { t } = useLanguage()
  const { resolvePath, checkIsActive, pathname } = useActiveLink()

  const [hoveredTooltip, setHoveredTooltip] = useState(null)
  
  // Initialize openDropdownKey based on the currently active route
  const [openDropdownKey, setOpenDropdownKey] = useState(() => {
    const activeItem = navLinks.find(item => item.hasDropdown && checkIsActive(item))
    return activeItem ? activeItem.key : null
  })

  // Keep the open dropdown in sync with the current route
  useEffect(() => {
    const activeItem = navLinks.find(item => item.hasDropdown && checkIsActive(item))
    if (activeItem) {
      setOpenDropdownKey(activeItem.key)
    } else {
      setOpenDropdownKey(null)
    }
  }, [pathname])

  const handleMouseEnter = (e, label) => {
    if (isExpanded) return
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredTooltip({ label, top: rect.top + rect.height / 2 })
  }

  const handleMouseLeave = () => {
    setHoveredTooltip(null)
  }

  return (
    <>
      <AnimatePresence>
        {hoveredTooltip && !isExpanded && (
          <motion.div 
            initial={{ opacity: 0, x: -5, y: "-50%" }}
            animate={{ opacity: 1, x: 0, y: "-50%" }}
            exit={{ opacity: 0, x: -5, y: "-50%" }}
            transition={{ duration: 0.15 }}
            className="fixed z-[100] left-[90px] px-3 py-1.5 bg-cath-red-700 text-white text-sm rounded shadow-md pointer-events-none whitespace-nowrap"
            style={{ top: `${hoveredTooltip.top}px` }}
          >
            {hoveredTooltip.label}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden py-2 flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-gray-200 transition-all duration-300 ${
        isExpanded ? "px-2" : "px-[18px]"
      }`}>
        {navLinks.map((item) => {
          // Use key mapping for translations, falling back to capitalized key if not found
          const label = t.nav?.[item.key] || item.key
          const IconComponent = item.icon || Home

          if (item.hasDropdown && item.subItems && item.subItems.length > 0) {
            const isDropdownActive = checkIsActive(item)
            return (
              <DesktopNavDropdown 
                key={item.key}
                icon={IconComponent} 
                label={label} 
                isActive={isDropdownActive}
                isExpanded={isExpanded}
                isOpen={openDropdownKey === item.key}
                onToggle={() => {
                  if (!isExpanded && setIsExpanded) {
                    setIsExpanded(true)
                  }
                  setOpenDropdownKey(prev => prev === item.key ? null : item.key)
                }}
                onMouseEnter={(e) => handleMouseEnter(e, label)}
                onMouseLeave={handleMouseLeave}
              >
                {(item.subItems || []).map((sub, idx) => (
                  <DesktopNavSubItem 
                    key={sub.key}
                    to={resolvePath(sub.path)} 
                    label={t.nav?.[sub.key] || sub.key} 
                    isLast={idx === (item.subItems || []).length - 1} 
                  />
                ))}
              </DesktopNavDropdown>
            )
          }

          return (
            <DesktopNavItem 
              key={item.key}
              to={resolvePath(item.path)} 
              icon={IconComponent} 
              label={label} 
              isExpanded={isExpanded} 
              onMouseEnter={(e) => handleMouseEnter(e, label)}
              onMouseLeave={handleMouseLeave}
            />
          )
        })}
      </div>

      <div className="px-2 py-3 flex flex-col gap-1.5 mt-auto border-t border-gray-100">
        {footerLinks.map((item) => {
          const label = t.nav?.[item.key] || item.key
          const IconComponent = item.icon || Settings
          
          return (
            <DesktopNavItem 
              key={item.key}
              to={resolvePath(item.path)} 
              icon={IconComponent} 
              label={label} 
              isExpanded={isExpanded} 
              onMouseEnter={(e) => handleMouseEnter(e, label)}
              onMouseLeave={handleMouseLeave}
            />
          )
        })}
      </div>
    </>
  )
}

export default DesktopNavItems
