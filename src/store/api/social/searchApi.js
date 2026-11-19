import { socialApi } from "./socialApi"

export const searchApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrendingTopics: builder.query({
      query: (languageCommunity) => ({
        url: "/Search/trending",
        params:
          languageCommunity !== undefined && languageCommunity !== null
            ? { languageCommunity }
            : {},
      }),
      providesTags: ["SearchTrend"],
      // Keep cache for 5 minutes since trending updates every 30m
      keepUnusedDataFor: 300,
    }),

    getSearchSuggestions: builder.query({
      query: ({ prefix = "", languageCommunity } = {}) => ({
        url: "/Search/suggestions",
        params: {
          prefix,
          ...(languageCommunity !== undefined && languageCommunity !== null
            ? { languageCommunity }
            : {}),
        },
      }),
      keepUnusedDataFor: 60,
    }),

    getRecentSearches: builder.query({
      query: () => "/Search/recent",
      providesTags: ["RecentSearch"],
    }),

    deleteRecentSearch: builder.mutation({
      query: (keyword) => ({
        url: "/Search/recent",
        method: "DELETE",
        params: keyword ? { keyword } : {},
      }),
      invalidatesTags: ["RecentSearch"],
      // Optimistic update
      async onQueryStarted(keyword, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          searchApi.util.updateQueryData("getRecentSearches", undefined, (draft) => {
            if (Array.isArray(draft)) {
              if (!keyword) {
                return []
              }
              return draft.filter(
                (item) =>
                  (item.keyword || item).toLowerCase() !== keyword.toLowerCase(),
              )
            }
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetTrendingTopicsQuery,
  useGetSearchSuggestionsQuery,
  useGetRecentSearchesQuery,
  useDeleteRecentSearchMutation,
} = searchApi
