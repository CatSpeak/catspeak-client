import { useState, useRef, useEffect } from "react"
import { useCreateSharedLinkMutation } from "@/store/api/eventsApi"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useLocation, useNavigate } from "react-router-dom"

const useEventShare = (eventId, occurrenceId) => {
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const location = useLocation()
  const navigate = useNavigate()
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const shareRef = useRef(null)

  const [createSharedLink, { isLoading: isSharing }] =
    useCreateSharedLinkMutation()

  // Dismiss popover when clicking outside the share container
  useEffect(() => {
    if (!sharePopoverOpen) return
    const handler = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setSharePopoverOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [sharePopoverOpen])

  const handleShare = async () => {
    if (!isAuthenticated) {
      if (location.pathname.includes("/events/shared/")) {
        navigate("/", { 
          replace: true, 
          state: { requireLogin: true, redirectTo: location.pathname + location.search }
        })
      } else {
        openAuthModal("login", location.pathname + location.search)
      }
      return
    }

    if (sharePopoverOpen) {
      setSharePopoverOpen(false)
      return
    }
    if (!shareUrl) {
      try {
        if (!occurrenceId) {
          console.error("Cannot create share link: occurrenceId is missing")
          return
        }
        const payload = {
          occurrenceId,
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }

        const res = await createSharedLink(payload).unwrap()
        const token =
          res.token ||
          (typeof res === "string"
            ? res.split("/").pop()
            : res.shareUrl?.split("/").pop())
        const url = `${window.location.origin}/events/shared/${token}`
        setShareUrl(url)
      } catch (err) {
        console.error("Failed to create share link:", err)
        return
      }
    }
    setSharePopoverOpen(true)
  }

  return {
    shareRef,
    sharePopoverOpen,
    shareUrl,
    isSharing,
    handleShare,
  }
}

export default useEventShare
