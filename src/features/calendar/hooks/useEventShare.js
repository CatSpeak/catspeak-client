import { useState, useRef, useEffect } from "react"
import { useCreateSharedLinkMutation } from "@/store/api/eventsApi"

const useEventShare = (eventId, occurrenceId) => {
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)
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
          eventId: occurrenceId,
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

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return {
    shareRef,
    sharePopoverOpen,
    shareUrl,
    copied,
    isSharing,
    handleShare,
    handleCopy,
  }
}

export default useEventShare
