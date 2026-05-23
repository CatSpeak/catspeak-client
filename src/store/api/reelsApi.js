import { baseApi } from "./baseApi"

const REEL_LIST_ENDPOINTS = new Set([
  "getReelsFeed",
  "getReelsByChallenge",
  "getUserReels",
])

const getReelList = (response) => {
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response)) return response
  return []
}

const findReelInDraft = (draft, reelId) => {
  const reelsList = getReelList(draft)
  return reelsList.find((reel) => String(reel.reelId) === String(reelId))
}

const patchCachedReelById = (dispatch, reelId, updateReel) =>
  dispatch(
    reelsApi.util.updateQueryData("getReelById", reelId, (draft) => {
      const reel = draft?.data !== undefined ? draft.data : draft
      if (reel) updateReel(reel)
    })
  )

const patchCachedReelLists = (dispatch, getState, reelId, updateReel) => {
  const patchedCacheKeys = new Set()

  return reelsApi.util
    .selectInvalidatedBy(getState(), [{ type: "Reels", id: String(reelId) }])
    .filter(({ endpointName, queryCacheKey }) => {
      if (!REEL_LIST_ENDPOINTS.has(endpointName)) return false
      if (patchedCacheKeys.has(queryCacheKey)) return false
      patchedCacheKeys.add(queryCacheKey)
      return true
    })
    .map(({ endpointName, originalArgs }) =>
      dispatch(
        reelsApi.util.updateQueryData(endpointName, originalArgs, (draft) => {
          const reel = findReelInDraft(draft, reelId)
          if (reel) updateReel(reel)
        })
      )
    )
}

const removeCachedReelFromLists = (dispatch, getState, reelId) => {
  const patchedCacheKeys = new Set()

  return reelsApi.util
    .selectInvalidatedBy(getState(), [{ type: "Reels", id: String(reelId) }])
    .filter(({ endpointName, queryCacheKey }) => {
      if (!REEL_LIST_ENDPOINTS.has(endpointName)) return false
      if (patchedCacheKeys.has(queryCacheKey)) return false
      patchedCacheKeys.add(queryCacheKey)
      return true
    })
    .map(({ endpointName, originalArgs }) =>
      dispatch(
        reelsApi.util.updateQueryData(endpointName, originalArgs, (draft) => {
          const reelsList = getReelList(draft)
          const index = reelsList.findIndex((reel) => String(reel.reelId) === String(reelId))
          if (index !== -1) reelsList.splice(index, 1)
        })
      )
    )
}

const updateLikeFields = (reel) => {
  const wasLiked = reel.isLiked
  reel.isLiked = !wasLiked
  reel.likesCount = !wasLiked
    ? (reel.likesCount || 0) + 1
    : Math.max(0, (reel.likesCount || 0) - 1)
}

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
      invalidatesTags: [
        { type: "Reels", id: "FEED" },
        { type: "Reels", id: "USER_REELS" },
      ],
    }),

    // Search #hashtags for Reel description autocomplete
    searchReelHashtags: builder.query({
      query: ({ query = "", take = 10 } = {}) => {
        const params = new URLSearchParams()
        params.append("query", query)
        params.append("take", String(take))

        return `/Reels/search/hashtags?${params.toString()}`
      },
      transformResponse: (response) => (Array.isArray(response) ? response : []),
    }),

    // Search @mentions for Reel description autocomplete
    searchReelMentions: builder.query({
      query: ({ query = "", take = 10 } = {}) => {
        const params = new URLSearchParams()
        params.append("query", query)
        params.append("take", String(take))

        return `/Reels/search/mentions?${params.toString()}`
      },
      transformResponse: (response) => (Array.isArray(response) ? response : []),
    }),

    // Toggle like/unlike state for a Reel
    toggleLikeReel: builder.mutation({
      query: (reelId) => ({
        url: `/Reels/${reelId}/like`,
        method: "POST",
      }),
      async onQueryStarted(reelId, { dispatch, getState, queryFulfilled }) {
        const patchResults = [
          patchCachedReelById(dispatch, reelId, updateLikeFields),
          ...patchCachedReelLists(dispatch, getState, reelId, updateLikeFields),
        ]

        try {
          await queryFulfilled
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo())
        }
      },
      invalidatesTags: (result, error, reelId) => [
        { type: "Reels", id: String(reelId) },
      ],
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
      async onQueryStarted({ reelId }, { dispatch, getState, queryFulfilled }) {
        const incrementComments = (reel) => {
          reel.commentsCount = (reel.commentsCount || 0) + 1
        }

        const patchResults = [
          patchCachedReelById(dispatch, reelId, incrementComments),
          ...patchCachedReelLists(dispatch, getState, reelId, incrementComments),
        ]

        try {
          await queryFulfilled
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo())
        }
      },
      invalidatesTags: (result, error, { reelId }) => [
        { type: "ReelComments", id: String(reelId) },
        { type: "Reels", id: String(reelId) },
      ],
    }),

    // Delete owned comment
    deleteReelComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/Reels/comments/${commentId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ reelId }, { dispatch, getState, queryFulfilled }) {
        const decrementComments = (reel) => {
          reel.commentsCount = Math.max(0, (reel.commentsCount || 0) - 1)
        }

        const patchResults = [
          patchCachedReelById(dispatch, reelId, decrementComments),
          ...patchCachedReelLists(dispatch, getState, reelId, decrementComments),
        ]

        try {
          await queryFulfilled
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo())
        }
      },
      invalidatesTags: (result, error, { reelId }) => [
        { type: "ReelComments", id: String(reelId) },
        { type: "Reels", id: String(reelId) },
      ],
    }),

    // Get active challenges currently running
    getActiveChallenges: builder.query({
      query: () => "/Reels/challenges/active",
    }),

    // Get past challenges
    getPastChallenges: builder.query({
      query: () => "/Reels/challenges/past",
    }),

    // Get reels associated with a specific challenge
    getReelsByChallenge: builder.query({
      query: ({ challengeId, page = 1, pageSize = 10 } = {}) =>
        `/Reels/challenge/${challengeId}?page=${page}&pageSize=${pageSize}`,
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ reelId }) => ({ type: "Reels", id: String(reelId) })),
            { type: "Reels", id: "FEED" },
          ]
          : [{ type: "Reels", id: "FEED" }],
    }),

    // Get challenge leaderboard ranking list
    getChallengeLeaderboard: builder.query({
      query: ({ challengeId, take = 10 } = {}) =>
        `/Reels/challenges/${challengeId}/leaderboard?take=${take}`,
    }),

    // Get reels uploaded by a specific user (GET /api/reels/user/:id)
    getUserReels: builder.query({
      query: ({ userId, page = 1, pageSize = 5 } = {}) =>
        `/reels/user/${userId}?page=${page}&pageSize=${pageSize}`,
      transformResponse: (response) => ({
        ...(response && typeof response === "object" && !Array.isArray(response) ? response : {}),
        data: getReelList(response),
        lastPageCount: getReelList(response).length,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs = {} }) => {
        const userId = queryArgs.userId || "unknown"
        const pageSize = queryArgs.pageSize || 5
        return `${endpointName}-${userId}-${pageSize}`
      },
      merge: (currentCache, incomingResponse, { arg }) => {
        const incomingReels = getReelList(incomingResponse)

        if (!arg?.page || arg.page === 1) {
          Object.assign(currentCache, incomingResponse, {
            data: incomingReels,
            lastPageCount: incomingReels.length,
          })
          return
        }

        const currentReels = getReelList(currentCache)
        const existingIds = new Set(currentReels.map((reel) => String(reel.reelId)))
        incomingReels.forEach((reel) => {
          if (!existingIds.has(String(reel.reelId))) {
            currentReels.push(reel)
          }
        })

        Object.entries(incomingResponse || {}).forEach(([key, value]) => {
          if (key !== "data") currentCache[key] = value
        })
        currentCache.lastPageCount = incomingReels.length
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.userId !== previousArg?.userId ||
          currentArg?.page !== previousArg?.page ||
          currentArg?.pageSize !== previousArg?.pageSize
        )
      },
      providesTags: (result, error, { userId } = {}) =>
        result?.data
          ? [
            ...result.data.map(({ reelId }) => ({ type: "Reels", id: String(reelId) })),
            { type: "Reels", id: `USER_${userId}` },
            { type: "Reels", id: "USER_REELS" },
          ]
          : [
            { type: "Reels", id: `USER_${userId}` },
            { type: "Reels", id: "USER_REELS" },
          ],
    }),

    // Delete a user's Reel (DELETE /api/reels/:id)
    deleteReel: builder.mutation({
      query: (reelId) => ({
        url: `/Reels/${reelId}`,
        method: "DELETE",
      }),
      async onQueryStarted(reelId, { dispatch, getState, queryFulfilled }) {
        const patchResults = removeCachedReelFromLists(dispatch, getState, reelId)

        try {
          await queryFulfilled
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo())
        }
      },
      invalidatesTags: (result, error, reelId) => [
        { type: "Reels", id: String(reelId) },
        { type: "Reels", id: "FEED" },
        { type: "Reels", id: "USER_REELS" },
      ],
    }),
  }),
})

// Export hooks for usage in components
export const {
  useGetReelsFeedQuery,
  useGetReelByIdQuery,
  useCreateReelMutation,
  useSearchReelHashtagsQuery,
  useSearchReelMentionsQuery,
  useToggleLikeReelMutation,
  useGetReelCommentsQuery,
  useCreateReelCommentMutation,
  useDeleteReelCommentMutation,
  useGetActiveChallengesQuery,
  useGetPastChallengesQuery,
  useGetReelsByChallengeQuery,
  useGetChallengeLeaderboardQuery,
  useGetUserReelsQuery,
  useDeleteReelMutation,
} = reelsApi
