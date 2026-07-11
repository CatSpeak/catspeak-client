import React, { useState, useRef, useEffect, useCallback, createElement, memo } from "react"
import toast from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useBookmarkReelMutation, useNotInterestedReelMutation } from "@/store/api/reelsApi"
import ReelReportModal from "../modals/ReelReportModal"
import ReelPlaylistModal from "../modals/ReelPlaylistModal"
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
const ReelMoreMenu = memo(function ReelMoreMenu({ isMobile, showMenu, onClose, reel }) {
  const { t } = useLanguage()
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const menuRef = useRef(null)

  const [bookmarkReel] = useBookmarkReelMutation()
  const [notInterestedReel] = useNotInterestedReelMutation()

  const [showReport, setShowReport] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)

  const isOpen = showMenu !== undefined ? showMenu : internalIsOpen

  const toggle = useCallback((e) => {
    e.stopPropagation()
    if (showMenu === undefined) {
      setInternalIsOpen((prev) => !prev)
    }
  }, [showMenu])

  const handleItemClick = useCallback(async (e, key) => {
    e.stopPropagation()
    if (showMenu === undefined) {
      setInternalIsOpen(false)
    } else if (onClose) {
      onClose()
    }

    if (!reel?.id && key !== "copyLink") {
      toast.error("Reel ID missing.")
      return
    }

    const actionHandlers = {
      report: () => setShowReport(true),

      notInterested: async () => {
        await notInterestedReel({ reelId: reel.id, hideCreator: false, hideTags: [] }).unwrap()
        window.dispatchEvent(new CustomEvent('hideReel', { detail: reel.id }))
        toast.success(t?.catSpeak?.reels?.detail?.moreMenu?.notInterestedSuccess || "We will show fewer reels like this.")
      },

      copyLink: async () => {
        const langCode = localStorage.getItem("communityLanguage") || language || "en"
        const url = `${window.location.origin}/${langCode}/cat-speak/reels/${reel.id}`
        await navigator.clipboard.writeText(url)
        toast.success(t?.catSpeak?.reels?.detail?.moreMenu?.copySuccess || "Link copied to clipboard.")
      },

      saveReel: async () => {
        toast.loading(t?.catSpeak?.reels?.detail?.moreMenu?.savingReel || "Saving Reel...", { id: "saveReel" })
        try {
          const response = await fetch(reel.videoUrl)
          const blob = await response.blob()
          const blobUrl = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.style.display = "none"
          a.href = blobUrl
          a.download = `CatSpeak_Reel_${reel.id}.mp4`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(blobUrl)
          toast.success(t?.catSpeak?.reels?.detail?.moreMenu?.saveSuccess || "Reel saved to device.", { id: "saveReel" })
        } catch {
          toast.error(t?.catSpeak?.reels?.detail?.moreMenu?.saveFailed || "Failed to save reel.", { id: "saveReel" })
        }
      },

      addToPlaylist: () => setShowPlaylist(true),

      aboutAccount: () =>
        toast(t?.catSpeak?.reels?.detail?.moreMenu?.featureNotAvailable || "This feature is not available yet.", { icon: "🚧" }),
    }

    try {
      const handler = actionHandlers[key]
      if (handler) {
        await handler()
      } else {
        toast(t?.catSpeak?.reels?.detail?.moreMenu?.featureNotAvailable || "This feature is not available yet.", { icon: "🚧" })
      }
    } catch (err) {
      toast.error(t?.catSpeak?.reels?.detail?.moreMenu?.actionFailed || "Failed to perform action.")
    }
  }, [showMenu, onClose, reel, bookmarkReel, notInterestedReel])

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
    <div className={`w-48 bg-white rounded-xl py-2 z-50 shadow-xl border border-gray-100 text-gray-800 font-medium animate-in fade-in zoom-in-95 duration-100 ${isMobile ? 'w-full' : 'absolute top-10 right-0'}`} role="menu">
      {MENU_ITEMS_KEYS.map((item) => (
        <button
          key={item.key}
          className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 cursor-pointer border-none bg-transparent outline-none"
          role="menuitem"
          onClick={(e) => handleItemClick(e, item.key)}
        >
          {createElement(item.icon, { size: 18, className: "text-gray-600" })}
          <span>{t?.catSpeak?.reels?.detail?.moreMenu?.[item.key] || item.defaultLabel}</span>
        </button>
      ))}
    </div>
  )

  return (
    <>
      {isMobile ? (
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
                  onClick={(e) => handleItemClick(e, item.key)}
                >
                  {createElement(item.icon, { size: 22, className: "text-gray-700" })}
                  <span>{t?.catSpeak?.reels?.detail?.moreMenu?.[item.key] || item.defaultLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative" ref={menuRef}>
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors border-none cursor-pointer outline-none text-gray-500 hover:text-gray-800 bg-transparent"
            onClick={toggle}
            aria-label="More options"
            aria-expanded={isOpen}
          >
            <MoreVertical size={20} />
          </button>

          {isOpen && menuContent}
        </div>
      )}

      {showReport && reel && (
        <ReelReportModal reel={reel} onClose={() => setShowReport(false)} />
      )}
      
      {showPlaylist && (
        <ReelPlaylistModal reelId={reel.id} onClose={() => setShowPlaylist(false)} />
      )}
    </>
  )
})

export default ReelMoreMenu
