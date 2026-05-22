import { baseApi } from "./baseApi"

// Reels API slice
export const reelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Reels feed using decay scoring (perfect for infinite scroll)
    getReelsFeed: builder.query({
      query: ({ sourceFilter = "All", page = 1, pageSize = 10, excludeReelIds } = {}) => {
        const params = new URLSearchParams()
        if (sourceFilter) params.append("sourceFilter", sourceFilter)
        if (page) params.append("page", String(page))
        if (pageSize) params.append("pageSize", String(pageSize))

        if (excludeReelIds && Array.isArray(excludeReelIds)) {
          excludeReelIds.forEach((id) => params.append("excludeReelIds", String(id)))
        }

        return `/Reels/feed?${params.toString()}`
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ reelId }) => ({ type: "Reels", id: String(reelId) })),
            { type: "Reels", id: "FEED" },
          ]
          : [{ type: "Reels", id: "FEED" }],
    }),

    // Get a single Reel by ID (automatically increments view count on backend)
    getReelById: builder.query({
      query: (reelId) => `/Reels/${reelId}`,
      providesTags: (result, error, reelId) => [{ type: "Reels", id: String(reelId) }],
    }),

    // Upload a new short video (Reel)
    createReel: builder.mutation({
      query: (formData) => ({
        url: "/Reels",
        method: "POST",
        body: formData, // FormData containing Title, Description, Privacy, VideoFile, CoverFile
      }),
      invalidatesTags: [{ type: "Reels", id: "FEED" }],
    }),

    // Toggle like/unlike state for a Reel
    // Toggle like/unlike state for a Reel
    toggleLikeReel: builder.mutation({
      query: (reelId) => ({
        url: `/Reels/${reelId}/like`,
        method: "POST",
      }),
      async onQueryStarted(reelId, { dispatch, queryFulfilled }) {
        // Optimistic update for single reel details
        const patchResultById = dispatch(
          reelsApi.util.updateQueryData("getReelById", reelId, (draft) => {
            const reel = draft?.data !== undefined ? draft.data : draft
            if (reel) {
              const wasLiked = reel.isLiked
              reel.isLiked = !wasLiked
              reel.likesCount = !wasLiked ? (reel.likesCount + 1) : Math.max(0, reel.likesCount - 1)
            }
          })
        )

        // Optimistic update for reels feed
        const patchResultFeed = dispatch(
          reelsApi.util.updateQueryData("getReelsFeed", undefined, (draft) => {
            const reelsList = draft?.data !== undefined ? draft.data : draft
            if (Array.isArray(reelsList)) {
              const reel = reelsList.find((r) => String(r.reelId) === String(reelId))
              if (reel) {
                const wasLiked = reel.isLiked
                reel.isLiked = !wasLiked
                reel.likesCount = !wasLiked ? (reel.likesCount + 1) : Math.max(0, reel.likesCount - 1)
              }
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResultById.undo()
          patchResultFeed.undo()
        }
      },
    }),

    // Get hierarchical comments tree for a Reel
    getReelComments: builder.query({
      query: (reelId) => `/Reels/${reelId}/comments`,
      providesTags: (result, error, reelId) => [
        { type: "ReelComments", id: String(reelId) },
      ],
    }),

    // Add a comment or reply to a Reel
    createReelComment: builder.mutation({
      query: ({ reelId, content, parentCommentId = null }) => ({
        url: `/Reels/${reelId}/comments`,
        method: "POST",
        body: { content, parentCommentId },
      }),
      async onQueryStarted({ reelId }, { dispatch, queryFulfilled }) {
        // Optimistic update for single reel comments count
        const patchResultById = dispatch(
          reelsApi.util.updateQueryData("getReelById", reelId, (draft) => {
            const reel = draft?.data !== undefined ? draft.data : draft
            if (reel) {
              reel.commentsCount = (reel.commentsCount || 0) + 1
            }
          })
        )

        // Optimistic update for reels feed comments count
        const patchResultFeed = dispatch(
          reelsApi.util.updateQueryData("getReelsFeed", undefined, (draft) => {
            const reelsList = draft?.data !== undefined ? draft.data : draft
            if (Array.isArray(reelsList)) {
              const reel = reelsList.find((r) => String(r.reelId) === String(reelId))
              if (reel) {
                reel.commentsCount = (reel.commentsCount || 0) + 1
              }
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResultById.undo()
          patchResultFeed.undo()
        }
      },
      invalidatesTags: (result, error, { reelId }) => [
        { type: "ReelComments", id: String(reelId) },
      ],
    }),

    // Delete owned comment
    deleteReelComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/Reels/comments/${commentId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ reelId }, { dispatch, queryFulfilled }) {
        // Optimistic update for single reel comments count
        const patchResultById = dispatch(
          reelsApi.util.updateQueryData("getReelById", reelId, (draft) => {
            const reel = draft?.data !== undefined ? draft.data : draft
            if (reel) {
              reel.commentsCount = Math.max(0, (reel.commentsCount || 0) - 1)
            }
          })
        )

        // Optimistic update for reels feed comments count
        const patchResultFeed = dispatch(
          reelsApi.util.updateQueryData("getReelsFeed", undefined, (draft) => {
            const reelsList = draft?.data !== undefined ? draft.data : draft
            if (Array.isArray(reelsList)) {
              const reel = reelsList.find((r) => String(r.reelId) === String(reelId))
              if (reel) {
                reel.commentsCount = Math.max(0, (reel.commentsCount || 0) - 1)
              }
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResultById.undo()
          patchResultFeed.undo()
        }
      },
      invalidatesTags: (result, error, { reelId }) => [
        { type: "ReelComments", id: String(reelId) },
      ],
    }),
  }),
})

// Export hooks for usage in components
export const {
  useGetReelsFeedQuery,
  useGetReelByIdQuery,
  useCreateReelMutation,
  useToggleLikeReelMutation,
  useGetReelCommentsQuery,
  useCreateReelCommentMutation,
  useDeleteReelCommentMutation,
} = reelsApi
