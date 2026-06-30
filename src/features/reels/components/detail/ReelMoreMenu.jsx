import React, { useState, useRef, useEffect, useCallback, createElement, memo } from "react"
import {
  Flag,
  EyeOff,
  Link2,
  Download,
  ListPlus,
  UserRound,
  MoreVertical,
} from "lucide-react"

const MENU_ITEMS = [
  { icon: Flag, label: "Report" },
  { icon: EyeOff, label: "Not Interested" },
  { icon: Link2, label: "Copy Link" },
  { icon: Download, label: "Save Reel" },
  { icon: ListPlus, label: "Add to Playlist" },
  { icon: UserRound, label: "About this account" },
]

/**
 * Three-dot "More" dropdown menu.
 * Self-contained: manages its own open/close state and click-outside dismissal.
 */
const ReelMoreMenu =memo(function ReelMoreMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const toggle = useCallback((e) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
  }, [])

  const handleItemClick = useCallback((e) => {
    e.stopPropagation()
    setIsOpen(false)
  }, [])

  /* Close on outside click or Escape */
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors border-none cursor-pointer outline-none backdrop-blur-sm"
        onClick={toggle}
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <MoreVertical size={20} color="white" />
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-48 bg-headingColor rounded-lg py-2 z-50 shadow-xl border border-white/10 text-white font-medium animate-in fade-in zoom-in-95 duration-100" role="menu">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent text-white outline-none"
              role="menuitem"
              onClick={handleItemClick}
            >
              {createElement(item.icon, { size: 18 })}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default ReelMoreMenu
