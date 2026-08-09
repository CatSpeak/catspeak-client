import { baseApi } from "./baseApi"

const REEL_LIST_ENDPOINTS = new Set([
  "getReelsFeed",
  "getReelsByChallenge",
  "getUserReels",
])

const updateBookmarkFields = (reel) => {
  reel.isBookmarked = !reel.isBookmarked
}

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
    checkUploadEligibility: builder.query({
      query: () => "/Reels/check-eligibility",
    }),

    getCreatorCount: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams()
        if (from) params.append("from", from)
        if (to) params.append("to", to)
        return `/Reels/creator-count?${params.toString()}`
      },
    }),

    // Get Reels feed using decay scoring (perfect for infinite scroll)
    getReelsFeed: builder.query({
      query: ({ sourceFilter = "All", page = 1, pageSize = 20, excludeReelIds } = {}) => {
        const params = new URLSearchParams()
        if (sourceFilter) params.append("sourceFilter", sourceFilter)
        if (page) params.append("page", String(page))
        if (pageSize) params.append("pageSize", String(pageSize))

        if (excludeReelIds && Array.isArray(excludeReelIds)) {
          excludeReelIds.forEach((id) => params.append("excludeReelIds", String(id)))
        }

        return `/Reels/feed?${params.toString()}`
      },
      transformResponse: (response) => ({
        ...(response && typeof response === "object" && !Array.isArray(response) ? response : {}),
        data: getReelList(response),
        lastPageCount: getReelList(response).length,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs = {} }) => {
        const sourceFilter = queryArgs.sourceFilter || "All"
        const pageSize = queryArgs.pageSize || 20
        return `${endpointName}-${sourceFilter}-${pageSize}`
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
          currentArg?.sourceFilter !== previousArg?.sourceFilter ||
          currentArg?.page !== previousArg?.page ||
          currentArg?.pageSize !== previousArg?.pageSize
        )
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
      invalidatesTags: (result, error, formData) => {
        const challengeId = typeof formData?.get === "function"
          ? formData.get("ChallengeId")
          : null

        return [
          { type: "Reels", id: "FEED" },
          { type: "Reels", id: "USER_REELS" },
          challengeId ? { type: "Reels", id: `CHALLENGE_${challengeId}` } : null,
        ].filter(Boolean)
      },
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
      invalidatesTags: [],
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
      ],
    }),

    // Get active challenges currently running
    getActiveChallenges: builder.query({
      query: () => "/reels/challenges/active",
    }),

    // Get past challenges
    getPastChallenges: builder.query({
      query: () => "/reels/challenges/past",
    }),

    // Get reels associated with a specific challenge or challenge filter
    getReelsByChallenge: builder.query({
      query: ({ challengeId, challengeFilter, page = 1, pageSize = 10 } = {}) => {
        const params = new URLSearchParams()
        if (challengeId) params.append("challengeId", String(challengeId))
        if (challengeFilter) params.append("challengeFilter", challengeFilter)
        if (page) params.append("page", String(page))
        if (pageSize) params.append("pageSize", String(pageSize))
        return `/Reels/challenge?${params.toString()}`
      },
      transformResponse: (response) => ({
        ...(response && typeof response === "object" && !Array.isArray(response) ? response : {}),
        data: getReelList(response),
        lastPageCount: getReelList(response).length,
      }),
      serializeQueryArgs: ({ endpointName, queryArgs = {} }) => {
        const challengeId = queryArgs.challengeId || ""
        const challengeFilter = queryArgs.challengeFilter || ""
        const pageSize = queryArgs.pageSize || 10
        return `${endpointName}-${challengeId}-${challengeFilter}-${pageSize}`
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
      },
      providesTags: (result, error, { challengeId, challengeFilter } = {}) => {
        const challengeTag = challengeId
          ? { type: "Reels", id: `CHALLENGE_${challengeId}` }
          : null
        const filterTag = challengeFilter
          ? { type: "Reels", id: `CHALLENGE_FILTER_${challengeFilter}` }
          : null
        const listTags = result?.data
          ? result.data.map(({ reelId }) => ({ type: "Reels", id: String(reelId) }))
          : []

        return [
          ...listTags,
          { type: "Reels", id: "FEED" },
          challengeTag,
          filterTag,
        ].filter(Boolean)
      },
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

    // Get user's custom playlists
    getPlaylists: builder.query({
      query: () => `/Reels/playlists`,
      providesTags: ["Playlists"],
    }),
    
    // Get bookmarked reels (optionally filtered by playlist)
    getBookmarkedReels: builder.query({
      query: (playlistId) => playlistId ? `/Reels/bookmarked?playlistId=${playlistId}` : `/Reels/bookmarked`,
      providesTags: (result, error, playlistId) => [{ type: "Playlists", id: playlistId || "ALL" }],
    }),

    // Get ALL bookmarked reels (including those in custom playlists) to accurately compute isBookmarked
    getAllBookmarkedReels: builder.query({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          // 1. Fetch default bookmarks (no playlist)
          const defaultResult = await fetchWithBQ('/Reels/bookmarked')
          if (defaultResult.error) return { error: defaultResult.error }
          
          const bookmarksMap = new Map()
          if (defaultResult.data) {
            defaultResult.data.forEach(item => {
              bookmarksMap.set(String(item.reelId), { ...item, __playlistIds: [null] })
            })
          }

          // 2. Fetch all playlists
          const playlistsResult = await fetchWithBQ('/Reels/playlists')
          if (playlistsResult.error) return { error: playlistsResult.error }
          
          // 3. Fetch bookmarks for each playlist
          const playlists = playlistsResult.data || []
          const playlistPromises = playlists.map(p => fetchWithBQ(`/Reels/bookmarked?playlistId=${p.playlistId}`))
          const playlistResults = await Promise.all(playlistPromises)
          
          playlistResults.forEach((result, i) => {
            if (result.data) {
              const playlistId = playlists[i].playlistId
              result.data.forEach(item => {
                const key = String(item.reelId)
                if (bookmarksMap.has(key)) {
                  bookmarksMap.get(key).__playlistIds.push(playlistId)
                } else {
                  bookmarksMap.set(key, { ...item, __playlistIds: [playlistId] })
                }
              })
            }
          })
          
          return { data: Array.from(bookmarksMap.values()) }
        } catch (error) {
          return { error: { status: 'CUSTOM_ERROR', error: error.message } }
        }
      },
      providesTags: ["Playlists"],
    }),

    // Create a new playlist
    createPlaylist: builder.mutation({
      query: (body) => ({
        url: "/Reels/playlists",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Playlists"],
    }),

    // Update a playlist
    updatePlaylist: builder.mutation({
      query: ({ playlistId, ...body }) => ({
        url: `/Reels/playlists/${playlistId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Playlists"],
    }),

    // Delete a playlist
    deletePlaylist: builder.mutation({
      query: (playlistId) => ({
        url: `/Reels/playlists/${playlistId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Playlists"],
    }),

    // Bookmark a reel
    bookmarkReel: builder.mutation({
      query: ({ reelId, playlistId }) => ({
        url: `/Reels/${reelId}/bookmark`,
        method: "POST",
        body: playlistId ? { playlistId } : {},
      }),
      // Optimistic update
      async onQueryStarted({ reelId }, { dispatch, getState, queryFulfilled }) {
        const patchResults = [
          patchCachedReelById(dispatch, reelId, updateBookmarkFields),
          ...patchCachedReelLists(dispatch, getState, reelId, updateBookmarkFields),
        ]
        try {
          await queryFulfilled
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo())
        }
      },
      invalidatesTags: ["Playlists"],
    }),

    // Report a reel
    reportReel: builder.mutation({
      query: ({ reelId, ...body }) => ({
        url: `/Reels/${reelId}/report`,
        method: "POST",
        body,
      }),
    }),

    // Mark reel as not interested
    notInterestedReel: builder.mutation({
      query: ({ reelId, ...body }) => ({
        url: `/Reels/${reelId}/not-interested`,
        method: "POST",
        body,
      }),
      // Optimistic update
      async onQueryStarted({ reelId }, { dispatch, getState, queryFulfilled }) {
        const patchResults = patchCachedReelLists(dispatch, getState, reelId, (reel) => {
          // If we had a way to mark it hidden, we could do it here
          // But usually we just remove it from the list
          // This requires removing it from the array, which patchCachedReelLists doesn't support easily yet
          // So we might just let the UI handle it or refetch
        })
        try {
          await queryFulfilled
        } catch {
          patchResults.forEach((patchResult) => patchResult.undo())
        }
      },
    }),
  }),
})

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
  useGetPlaylistsQuery,
  useGetBookmarkedReelsQuery,
  useGetAllBookmarkedReelsQuery,
  useCreatePlaylistMutation,
  useUpdatePlaylistMutation,
  useDeletePlaylistMutation,
  useBookmarkReelMutation,
  useReportReelMutation,
  useNotInterestedReelMutation,
  useGetCreatorCountQuery,
  useLazyCheckUploadEligibilityQuery,
} = reelsApi
