import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DesktopNavItem from "./DesktopNavItem"
import DesktopSubNavDropdown from "./DesktopSubNavDropdown"
import { DesktopSubNavContent } from "./DesktopSubNavContent"
import { navLinks } from "@/features/navigation/config/navigation"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import { useAuth } from "@/features/auth"

const DesktopNav = ({ onRequestLogin }) => {
  const { currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()

  const [activeKey, setActiveKey] = useState(null)
  const closeTimer = useRef(null)

  const handleMouseEnter = (key) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setActiveKey(key)
  }

  const handleMouseLeave = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
    }
    closeTimer.current = setTimeout(() => {
      setActiveKey(null)
    }, 180)
  }

  return (
    <nav
      className="relative hidden items-center justify-center p-1 gap-2 text-black lg:flex"
      onMouseLeave={handleMouseLeave}
    >
      {navLinks
        .filter((item) => {
          if (item.hideInSidebar) return false
          if (item.lang && item.lang !== currentLang) return false
          if (item.showOnHorizontalBar === false) return false
          if (item.isPrivate && !isAuthenticated) return false
          return true
        })
        .map((item) => {
          const { key, path, hasDropdown, subItems, noActive, color, img, requiresAuth } = item
          const isLocked = requiresAuth && !isAuthenticated
          const isDropdown = key === "community" || (subItems && subItems.length > 0)

          if (isDropdown) {
            return (
              <div
                key={key}
                className="relative"
                onMouseEnter={() => handleMouseEnter(key)}
                onMouseLeave={handleMouseLeave}
              >
                <DesktopSubNavDropdown
                  item={item}
                  onRequestLogin={onRequestLogin}
                  isOpen={activeKey === key}
                />

                <AnimatePresence>
                  {activeKey === key && !isLocked && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full left-0 mt-2 z-50 rounded-2xl border border-border shadow-2xl bg-white overflow-hidden pointer-events-auto before:absolute before:-top-3 before:left-0 before:right-0 before:h-4 before:content-['']"
                      onMouseEnter={() => {
                        if (closeTimer.current) clearTimeout(closeTimer.current)
                      }}
                    >
                      <DesktopSubNavContent
                        item={item}
                        onItemClick={() => setActiveKey(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          // Plain nav link
          return (
            <div key={key} onMouseEnter={() => handleMouseEnter(key)}>
              <DesktopNavItem
                navKey={key}
                path={path}
                noActive={noActive}
                color={color}
                img={img}
              />
            </div>
          )
        })}
    </nav>
  )
}

export default DesktopNav
