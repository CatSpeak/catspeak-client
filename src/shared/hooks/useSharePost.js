import { useState } from "react"
import { useSharePostMutation } from "@/store/api/social/postsApi"

/**
 * Custom hook to handle post sharing logic across cards/action bars.
 */
export const useSharePost = () => {
  const [sharePost, { isLoading: isSharing }] = useSharePostMutation()
  const [shareUrl, setShareUrl] = useState("")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const handleShare = async (e, postId) => {
    if (e?.stopPropagation) {
      e.stopPropagation()
    }
    if (!postId) return

    try {
      const result = await sharePost(postId).unwrap()
      let url =
        (typeof result === "string" ? result : result?.shareLink) ||
        window.location.href

      if (url && !url.startsWith("http")) {
        url = url.startsWith("/") ? url : `/${url}`
        url = `${window.location.origin}${url}`
      }

      if (url) {
        setShareUrl(url)
        setIsShareModalOpen(true)
      }
    } catch (err) {
      console.error("Share failed", err)
    }
  }

  return {
    shareUrl,
    isShareModalOpen,
    setIsShareModalOpen,
    handleShare,
    isSharing,
  }
}

export default useSharePost
