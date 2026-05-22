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
  }),
})

// Export hooks for usage in components
export const {
  useGetReelsFeedQuery,
  useGetReelByIdQuery,
  useCreateReelMutation,
} = reelsApi
