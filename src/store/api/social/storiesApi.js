import { socialApi } from "./socialApi"

export const storiesApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new story
    createStory: builder.mutation({
      query: (data) => ({
        url: "/stories",
        method: "POST",
        body: data,
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
  }),
})

export const {
  useCreateStoryMutation,
  useGetStoriesQuery,
  useGetMyStoriesQuery,
  useInteractWithStoryMutation,
  useDeleteStoryMutation,
} = storiesApi
