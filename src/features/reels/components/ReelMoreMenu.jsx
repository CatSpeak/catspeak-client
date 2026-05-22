import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  Flag,
  EyeOff,
  Link2,
  Download,
  ListPlus,
  UserRound,
  MoreVertical,
} from "lucide-react"
import styles from "../styles/reels.module.css"

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
const ReelMoreMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const toggle = useCallback((e) => {
    e.stopPropagation()
    setIsOpen((prev) => !prev)
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
    <div className={styles.moreMenuWrapper} ref={menuRef}>
      <button
        className={styles.moreMenuBtn}
        onClick={toggle}
        aria-label="More options"
        aria-expanded={isOpen}
      >
        <MoreVertical size={20} color="white" />
      </button>

      {isOpen && (
        <div className={styles.moreMenuDropdown} role="menu">
          {MENU_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className={styles.moreMenuItem}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReelMoreMenu
