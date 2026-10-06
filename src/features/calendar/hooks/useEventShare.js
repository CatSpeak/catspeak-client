import { useState, useRef, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useCreateSharedLinkMutation } from "@/store/api/eventsApi"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"
import { useLocation, useNavigate } from "react-router-dom"
import { getCommunityLang } from "@/shared/utils/navigation"
import { communityCodeFromValue } from "../utils/community"
import { useLanguage } from "@/shared/context/LanguageContext"

const SHARED_LINK_VISIBILITY = "SHARED_LINK_ONLY"

/**
 * Builds the direct (no-token) share URL for a PUBLIC occurrence.
 */
const buildDirectShareUrl = (occurrenceId, languageCommunity, fallbackLanguage) => {
  // `languageCommunity` is stored as a canonical value ("Chinese"/"English"/"Japanese");
  // route segments need the code form (zh/en/ja), so map it and fall back to the
  // community derived from the current language when it is missing or unknown.
  const communityCode =
    communityCodeFromValue(languageCommunity) || getCommunityLang(fallbackLanguage)
  return `${window.location.origin}/${communityCode}/cat-speak/calendar?occurrenceId=${occurrenceId}`
}

const useEventShare = ({
  occurrenceId,
  visibilityScope,
  isCreator,
  languageCommunity,
} = {}) => {
  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const { language, t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const shareRef = useRef(null)

  const [createSharedLink, { isLoading: isSharing }] =
    useCreateSharedLinkMutation()

  const isPublic = visibilityScope !== SHARED_LINK_VISIBILITY
  const isCreatorOnlyTokenLink =
    visibilityScope === SHARED_LINK_VISIBILITY && !isCreator
  const isDisabled = !occurrenceId || isCreatorOnlyTokenLink

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

    if (isDisabled) {
      setErrorMessage(
        isCreatorOnlyTokenLink
          ? t.calendar?.shareCreatorOnly ||
              "Chỉ người tạo sự kiện mới có thể tạo liên kết chia sẻ."
          : t.calendar?.shareMissingOccurrence ||
              "Không thể chia sẻ: thiếu thông tin buổi diễn ra.",
      )
      setSharePopoverOpen(true)
      return
    }

    if (sharePopoverOpen) {
      setSharePopoverOpen(false)
      return
    }

    if (!shareUrl) {
      setErrorMessage("")

      if (isPublic) {
        setShareUrl(
          buildDirectShareUrl(occurrenceId, languageCommunity, language),
        )
        setSharePopoverOpen(true)
        return
      }

      try {
        const res = await createSharedLink({ occurrenceId }).unwrap()
        const token =
          res?.token ||
          (typeof res === "string"
            ? res.split("/").pop()
            : res?.shareUrl?.split("/").pop())

        if (!token) {
          toast.error(
            t.calendar?.shareFailed || "Không thể tạo liên kết chia sẻ.",
          )
          return
        }

        setShareUrl(`${window.location.origin}/events/shared/${token}`)
      } catch (err) {
        console.error("Failed to create share link:", err)
        toast.error(
          t.calendar?.shareFailed || "Không thể tạo liên kết chia sẻ.",
        )
        return
      }
    }
    setSharePopoverOpen(true)
  }

  return {
    shareRef,
    sharePopoverOpen,
    shareUrl,
    errorMessage,
    isSharing,
    isPublic,
    isDisabled,
    handleShare,
  }
}

export default useEventShare
