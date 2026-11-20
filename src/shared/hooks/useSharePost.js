import { useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { useSharePostMutation } from "@/store/api/social/postsApi"
import { getShareUrlWithVersion } from "@/shared/utils/shareUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Custom hook to handle post sharing logic across cards/action bars.
 * Supports Web Share API (navigator.share) synchronously on user gesture,
 * with background tracking and graceful fallback to ShareModal.
 */
export const useSharePost = () => {
  const [sharePost, { isLoading: isSharing }] = useSharePostMutation()
  const [shareUrl, setShareUrl] = useState("")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const { lang: paramLang } = useParams()
  const { language } = useLanguage()
  const currentLang = paramLang || language || "vi"

  const handleShare = useCallback(
    async (e, postOrId) => {
      if (e?.preventDefault) {
        e.preventDefault()
      }
      if (e?.stopPropagation) {
        e.stopPropagation()
      }

      if (!postOrId) return

      const isObject = typeof postOrId === "object" && postOrId !== null
      const postId = isObject ? postOrId.postId || postOrId.id : postOrId
      if (!postId) return

      const title = isObject && postOrId.title ? postOrId.title : "CatSpeak"
      const text =
        isObject && (postOrId.excerpt || postOrId.title)
          ? postOrId.excerpt || postOrId.title
          : ""
      const slug = isObject ? postOrId.slug || postOrId.Slug : null

      // Build canonical URL for the post
      const rawUrl =
        (isObject && postOrId.url) ||
        (slug || postId
          ? `${window.location.origin}/${currentLang}/cat-speak/news/${slug || postId}`
          : window.location.href)

      const initialShareUrl = getShareUrlWithVersion(rawUrl)

      const shareData = {
        title,
        text,
        url: initialShareUrl,
      }

      // Check if Web Share API is available and can share this data
      const canWebShare =
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare(shareData))

      if (canWebShare) {
        // Trigger server tracking in background so user gesture window is not lost
        sharePost(postId).catch((err) => {
          console.warn("Background sharePost tracking failed:", err)
        })

        try {
          await navigator.share(shareData)
          return
        } catch (err) {
          if (err?.name === "AbortError") {
            // User dismissed the native share sheet
            return
          }
          console.warn("navigator.share failed, falling back to modal:", err)
        }
      }

      // Fallback: Open ShareModal with the share link
      setShareUrl(initialShareUrl)
      setIsShareModalOpen(true)

      // Fetch custom share link from server if available and update
      try {
        const result = await sharePost(postId).unwrap()
        let serverUrl = typeof result === "string" ? result : result?.shareLink
        if (serverUrl) {
          if (!serverUrl.startsWith("http")) {
            serverUrl = serverUrl.startsWith("/") ? serverUrl : `/${serverUrl}`
            serverUrl = `${window.location.origin}${serverUrl}`
          }
          setShareUrl(getShareUrlWithVersion(serverUrl))
        }
      } catch (err) {
        console.warn("Failed to get server shareLink:", err)
      }
    },
    [currentLang, sharePost]
  )

  return {
    shareUrl,
    isShareModalOpen,
    setIsShareModalOpen,
    handleShare,
    isSharing,
  }
}

export default useSharePost
