import { useRef, useEffect, useCallback } from "react"
import { useDispatch, useStore } from "react-redux"
import { useReactToPostMutation } from "@/store/api/social/postsApi"
import { updatePostInCaches } from "@/store/api/social/utils/postsCacheUtils"
import { useAuth } from "@/features/auth"
import { useAuthModal } from "@/shared/context/AuthModalContext"

/**
 * Custom hook to provide debounced, spam-free optimistic reactions for posts.
 *
 * - Instantly updates the Redux cache on click for 0ms lag-free UI feedback across all views.
 * - Debounces network requests by 400ms so rapid clicking/spamming sends only 1 final request.
 * - Cancels the network call completely if the user toggles back to their initial reaction state.
 * - Flushes pending reaction on unmount to prevent lost user actions.
 *
 * @param {Object} post - The post object containing postId, currentUserReaction, totalReactions.
 * @returns {{ handleReact: (eOrType: any, maybeType?: string) => void }}
 */
export const usePostReaction = (post) => {
  const postId = post?.postId || post?.id
  const currentUserReaction = post?.currentUserReaction ?? null
  const totalReactions = post?.totalReactions ?? 0

  const { isAuthenticated } = useAuth()
  const { openAuthModal } = useAuthModal()
  const dispatch = useDispatch()
  const store = useStore()
  const [reactToPostMutation] = useReactToPostMutation()

  // Track the authoritative server state before any rapid clicking started
  const originalStateRef = useRef({
    reaction: currentUserReaction,
    totalReactions,
  })
  const pendingReactionRef = useRef(currentUserReaction)
  const debounceTimerRef = useRef(null)
  const isSyncingRef = useRef(false)

  // Keep original state in sync with server data when idle
  useEffect(() => {
    if (!debounceTimerRef.current && !isSyncingRef.current) {
      originalStateRef.current = {
        reaction: currentUserReaction,
        totalReactions,
      }
      pendingReactionRef.current = currentUserReaction
    }
  }, [currentUserReaction, totalReactions])

  // Flush on unmount if user clicked and immediately navigated away
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
        const finalReaction = pendingReactionRef.current
        const originalReaction = originalStateRef.current.reaction

        if (finalReaction !== originalReaction && postId) {
          const typeToSend = finalReaction || originalReaction
          if (typeToSend) {
            reactToPostMutation({
              postId,
              type: typeToSend,
              skipOptimistic: true,
            })
          }
        }
      }
    }
  }, [postId, reactToPostMutation])

  const handleReact = useCallback(
    (eOrType, maybeType) => {
      let e = null
      let type = null

      if (typeof eOrType === "string") {
        type = eOrType
      } else {
        e = eOrType
        type = maybeType
      }

      e?.preventDefault?.()
      e?.stopPropagation?.()

      if (!isAuthenticated) {
        openAuthModal?.("login")
        return
      }

      if (!postId || !type) return

      // Determine next state based on current pending state
      const current = pendingReactionRef.current
      const nextReaction = current === type ? null : type
      pendingReactionRef.current = nextReaction

      // 1. Instant optimistic update in Redux cache (0ms latency, updates all cards and badges)
      updatePostInCaches(store.getState(), dispatch, postId, (p) => {
        if (p.currentUserReaction === type) {
          p.currentUserReaction = null
          p.totalReactions = Math.max(0, (p.totalReactions || 0) - 1)
        } else {
          if (!p.currentUserReaction) {
            p.totalReactions = (p.totalReactions || 0) + 1
          }
          p.currentUserReaction = type
        }
      })

      // 2. Clear any running debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // 3. Debounce API call (400ms after user pauses clicking)
      debounceTimerRef.current = setTimeout(async () => {
        debounceTimerRef.current = null
        const finalReaction = pendingReactionRef.current
        const originalReaction = originalStateRef.current.reaction

        // If user ended back where they started, no server call is needed!
        if (finalReaction === originalReaction) {
          return
        }

        isSyncingRef.current = true
        const typeToSend = finalReaction || originalReaction

        try {
          await reactToPostMutation({
            postId,
            type: typeToSend,
            skipOptimistic: true,
          }).unwrap()

          originalStateRef.current.reaction = finalReaction
        } catch (error) {
          console.error("Failed to sync reaction to server:", error)
          // Rollback to original server state
          updatePostInCaches(store.getState(), dispatch, postId, (p) => {
            p.currentUserReaction = originalStateRef.current.reaction
            p.totalReactions = originalStateRef.current.totalReactions
          })
          pendingReactionRef.current = originalStateRef.current.reaction
        } finally {
          isSyncingRef.current = false
        }
      }, 400)
    },
    [
      dispatch,
      store,
      isAuthenticated,
      openAuthModal,
      postId,
      reactToPostMutation,
    ],
  )

  return { handleReact }
}

export default usePostReaction
