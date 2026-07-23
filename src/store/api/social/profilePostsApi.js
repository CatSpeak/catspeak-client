import { socialApi } from "./socialApi"

export const profilePostsApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserTimelinePosts: builder.query({
      query: ({ accountId, page = 1, pageSize = 10 }) => ({
        url: `/Post/user/${accountId}`,
        params: { page, pageSize },
      }),
      providesTags: (result, error, { accountId }) => [
        { type: "Post", id: `TIMELINE-${accountId}` },
      ],
      serializeQueryArgs: ({ queryArgs }) => {
        return `getUserTimelinePosts-${queryArgs.accountId}`
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          currentCache.data = newItems.data
        } else {
          const newPosts = newItems.data.filter(
            (newPost) => !currentCache.data.some((p) => p.postId === newPost.postId)
          )
          currentCache.data.push(...newPosts)
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page
      },
    }),
    getUserWallMedia: builder.query({
      query: ({ accountId, page = 1, pageSize = 12 }) => ({
        url: `/Post/user/${accountId}/media`,
        params: { page, pageSize },
      }),
      providesTags: (result, error, { accountId }) => [
        { type: "PostMedia", id: `WALL-${accountId}` },
      ],
    }),
    getUserWallDocuments: builder.query({
      query: ({ accountId, page = 1, pageSize = 12 }) => ({
        url: `/Post/user/${accountId}/documents`,
        params: { page, pageSize },
      }),
      providesTags: (result, error, { accountId }) => [
        { type: "PostMedia", id: `DOCS-${accountId}` },
      ],
    }),
    createPost: builder.mutation({
      query: (formData) => ({
        url: "/Post",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, formData) => [
        { type: "Post", id: `TIMELINE-CURRENT_USER` }, // We will invalidate everything to refresh or specifically the timeline of the current user
        "Post"
      ],
    }),
    updatePost: builder.mutation({
      query: ({ postId, formData }) => ({
        url: `/Post/${postId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Post"],
    }),
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/Post/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUserTimelinePostsQuery,
  useGetUserWallMediaQuery,
  useGetUserWallDocumentsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = profilePostsApi
