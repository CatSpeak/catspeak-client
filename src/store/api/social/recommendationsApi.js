import { socialApi } from "./socialApi"

export const recommendationsApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getSidebarRecommendations: builder.query({
      query: ({ languageCommunity = 0, limit = 3 } = {}) => ({
        url: "/recommendation/sidebar",
        method: "GET",
        params: { languageCommunity, limit },
      }),
      providesTags: ["Recommendation"],
      // Client cache TTL = 5 minutes (300 seconds)
      keepUnusedDataFor: 300,
    }),

    getInFeedRecommendations: builder.query({
      query: ({ cycleType = "teacher", languageCommunity = 0, count = 6 } = {}) => ({
        url: "/recommendation/in-feed",
        method: "GET",
        params: { cycleType, languageCommunity, count },
      }),
      providesTags: ["Recommendation"],
      // BR-DX-17: Client cache TTL = 5 minutes
      keepUnusedDataFor: 300,
    }),

    getAllRecommendations: builder.query({
      query: ({
        type = "teacher",
        languageCommunity = 0,
        page = 1,
        pageSize = 20,
        sortBy = "relevance",
        searchKeyword = "",
      } = {}) => ({
        url: "/recommendation/all",
        method: "GET",
        params: {
          type,
          languageCommunity,
          page,
          pageSize,
          sortBy,
          searchKeyword: searchKeyword?.trim() || undefined,
        },
      }),
      providesTags: ["Recommendation"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { type = "teacher", languageCommunity = 0, sortBy = "relevance", searchKeyword = "" } = queryArgs || {}
        return `${endpointName}_${type}_${languageCommunity}_${sortBy}_${searchKeyword.trim()}`
      },
      merge: (currentCache, newItems, { arg }) => {
        const page = arg?.page ?? 1
        const incomingData = Array.isArray(newItems?.data) ? newItems.data : []
        if (page === 1) {
          currentCache.data = incomingData
          currentCache.page = 1
        } else {
          const currentList = Array.isArray(currentCache?.data) ? currentCache.data : []
          const existingIds = new Set(currentList.map((x) => `${x.type}_${x.id}`))
          const fresh = incomingData.filter((x) => !existingIds.has(`${x.type}_${x.id}`))
          currentCache.data = [...currentList, ...fresh]
          currentCache.page = page
        }
        currentCache.hasMore = incomingData.length >= (arg?.pageSize ?? 20)
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page
      },
    }),

    trackRecommendation: builder.mutation({
      query: (data) => ({
        url: "/recommendation/track",
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const {
  useGetSidebarRecommendationsQuery,
  useGetInFeedRecommendationsQuery,
  useGetAllRecommendationsQuery,
  useTrackRecommendationMutation,
} = recommendationsApi
