import React, { useState, useRef, useEffect, useCallback, createElement, memo } from "react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  Flag,
  EyeOff,
  Link2,
  Download,
  ListPlus,
  UserRound,
  MoreVertical,
} from "lucide-react"

const MENU_ITEMS_KEYS = [
  { icon: Flag, key: "report", defaultLabel: "Report" },
  { icon: EyeOff, key: "notInterested", defaultLabel: "Not Interested" },
  { icon: Link2, key: "copyLink", defaultLabel: "Copy Link" },
  { icon: Download, key: "saveReel", defaultLabel: "Save Reel" },
  { icon: ListPlus, key: "addToPlaylist", defaultLabel: "Add to Playlist" },
  { icon: UserRound, key: "aboutAccount", defaultLabel: "About this account" },
]

/**
 * Three-dot "More" dropdown menu.
 * Self-contained: manages its own open/close state and click-outside dismissal.
 */
const ReelMoreMenu = memo(function ReelMoreMenu({ isMobile, showMenu, onClose }) {
  const { t } = useLanguage()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const menuRef = useRef(null)

  const isOpen = showMenu !== undefined ? showMenu : internalIsOpen

  const toggle = useCallback((e) => {
    e.stopPropagation()
    if (showMenu === undefined) {
      setInternalIsOpen((prev) => !prev)
    }
  }, [showMenu])

  const handleItemClick = useCallback((e) => {
    e.stopPropagation()
    if (showMenu === undefined) {
      setInternalIsOpen(false)
    } else if (onClose) {
      onClose()
    }
    toast("This feature is not available yet.", { icon: "🚧" })
  }, [showMenu, onClose])

  /* Close on outside click or Escape */
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (showMenu === undefined) {
          setInternalIsOpen(false)
        } else if (onClose) {
          onClose()
        }
      }
    }
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (showMenu === undefined) {
          setInternalIsOpen(false)
        } else if (onClose) {
          onClose()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen, onClose, showMenu])

  const menuContent = (
    <div className={`w-48 bg-headingColor rounded-lg py-2 z-50 shadow-xl border border-white/10 text-white font-medium animate-in fade-in zoom-in-95 duration-100 ${isMobile ? 'w-full' : 'absolute top-10 right-0'}`} role="menu">
      {MENU_ITEMS_KEYS.map((item) => (
        <button
          key={item.key}
          className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent text-white outline-none"
          role="menuitem"
          onClick={handleItemClick}
        >
          {createElement(item.icon, { size: 18 })}
          <span>{t?.catSpeak?.reels?.detail?.moreMenu?.[item.key] || item.defaultLabel}</span>
        </button>
      ))}
    </div>
  )

  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-[1300] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div
          className={`absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header handle */}
          <div className="flex items-center justify-center pt-3 pb-2 border-b border-gray-100">
            <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
          </div>
          
          <div className="py-2 pb-safe px-2 pb-8">
            {MENU_ITEMS_KEYS.map((item) => (
              <button
                key={item.key}
                className="w-full text-left px-4 py-3.5 text-[15px] font-semibold text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent outline-none rounded-xl"
                role="menuitem"
                onClick={handleItemClick}
              >
                {createElement(item.icon, { size: 22, className: "text-gray-700" })}
                <span>{t?.catSpeak?.reels?.detail?.moreMenu?.[item.key] || item.defaultLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

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

      {isOpen && menuContent}
    </div>
  )
})

export default ReelMoreMenu
