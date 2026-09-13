import { socialApi } from "@/store/api/social/socialApi"
import { maskBody } from "@/shared/utils/moderation"

export const storiesApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new story
    createStory: builder.mutation({
      // [Moderation] Thư gửi đi hiện cho cả cộng đồng thấy (danmaku), nên đây là
      // một trong những chỗ cần che ★ nhất.
      queryFn: async (data, api, extraOptions, baseQuery) =>
        baseQuery({
          url: "/stories",
          method: "POST",
          body: await maskBody(api, data),
        }),
      invalidatesTags: ["Stories", "MyStories"],
    }),

    // Get all active stories (excluding user's own stories and declined stories)
    getStories: builder.query({
      query: (languageCommunity) => ({
        url: "/stories",
        params: languageCommunity ? { languageCommunity } : undefined,
      }),
      providesTags: ["Stories"],
    }),

    // Get current user's stories
    getMyStories: builder.query({
      query: (languageCommunity) => ({
        url: "/stories/my-stories",
        params: languageCommunity ? { languageCommunity } : undefined,
      }),
      providesTags: ["MyStories"],
    }),

    // Interact with a story (Accept or Decline)
    interactWithStory: builder.mutation({
      query: (data) => ({
        url: "/stories/interact",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Stories", "Conversations"],
    }),

    // Delete a story (only by story creator)
    deleteStory: builder.mutation({
      query: (storyId) => ({
        url: `/stories/${storyId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stories", "MyStories"],
    }),

    // Report a story
    reportStory: builder.mutation({
      query: (storyId) => ({
        url: `/stories/${storyId}/report`,
        method: "POST",
      }),
      invalidatesTags: ["Stories"],
    }),
  }),
})

export const {
  useCreateStoryMutation,
  useGetStoriesQuery,
  useGetMyStoriesQuery,
  useInteractWithStoryMutation,
  useDeleteStoryMutation,
  useReportStoryMutation
} = storiesApi
