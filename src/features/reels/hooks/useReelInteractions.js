import { useCallback } from "react"
import toast from "react-hot-toast"
import {
  useToggleLikeReelMutation,
  useCreateReelCommentMutation,
  useDeleteReelCommentMutation,
  useBookmarkReelMutation,
} from "@/store/api/reelsApi"

export const useReelInteractions = ({ reel, isAuthenticated, openAuthModal, t }) => {
  const [toggleLike] = useToggleLikeReelMutation()
  const [createComment, { isLoading: isPostingComment }] = useCreateReelCommentMutation()
  const [deleteComment] = useDeleteReelCommentMutation()
  const [bookmarkReel] = useBookmarkReelMutation()

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      openAuthModal()
      return
    }
    if (!reel?.id) return
    try {
      await toggleLike(reel.id).unwrap()
    } catch {
      toast.error(t?.catSpeak?.reels?.detail?.errorLike || "Failed to like reel.")
    }
  }, [isAuthenticated, reel, openAuthModal, toggleLike, t])

  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated) {
      openAuthModal()
      return
    }
    if (!reel?.id) return
    try {
      await bookmarkReel({ reelId: reel.id }).unwrap()
      if (!reel.isBookmarked) {
        toast.success(t?.catSpeak?.reels?.detail?.moreMenu?.addToPlaylistSuccess || "Added to playlist.")
      }
    } catch {
      toast.error(t?.catSpeak?.reels?.detail?.errorBookmark || "Failed to bookmark reel.")
    }
  }, [isAuthenticated, reel, openAuthModal, bookmarkReel, t])

  const handleShare = useCallback(async () => {
    if (!reel?.id) return
    const url = `${window.location.origin}/vi/cat-speak/reels/${reel.id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: reel.title || "CatSpeak Reel",
          text: reel.description || "Check out this reel!",
          url: url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success(t?.catSpeak?.reels?.detail?.linkCopied || "Link copied!")
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error)
        toast.error("Failed to share.")
      }
    }
  }, [reel, t])

  const handleCommentSubmit = useCallback(async (commentText, replyTarget, resetInput) => {
    if (!isAuthenticated) {
      openAuthModal()
      return
    }
    if (!commentText.trim()) return

    try {
      await createComment({
        reelId: reel.id,
        content: commentText.trim(),
        parentId: replyTarget?.id || null,
      }).unwrap()

      resetInput()
    } catch {
      toast.error("Failed to post comment.")
    }
  }, [isAuthenticated, openAuthModal, createComment, reel])

  const handleCommentDelete = useCallback(async (commentId) => {
    if (!isAuthenticated) return
    try {
      await deleteComment({
        reelId: reel.id,
        commentId,
      }).unwrap()
      toast.success(t?.catSpeak?.reels?.detail?.commentDeleted || "Comment deleted!")
    } catch {
      toast.error("Failed to delete comment.")
    }
  }, [isAuthenticated, deleteComment, reel, t])

  return {
    handleLike,
    handleBookmark,
    handleShare,
    handleCommentSubmit,
    handleCommentDelete,
    isPostingComment,
  }
}
