import { baseApi } from "./baseApi"

export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url: "/Post",
        params: { page, pageSize },
      }),
      providesTags: ["Post"],
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName
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
        currentCache.hasMore = newItems.data.length === arg.pageSize
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page
      },
    }),
    getPostById: builder.query({
      query: (postId) => `/Post/${postId}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),
    reactToPost: builder.mutation({
      query: ({ postId, type }) => ({
        url: `/Post/${postId}/react`,
        method: "POST",
        params: { type },
      }),
      async onQueryStarted({ postId, type }, { dispatch, getState, queryFulfilled }) {
        const state = getState()
        const patches = []

        // Iterate over all active getPosts queries (for different pages) and optimistically update them
        for (const [key, query] of Object.entries(state.api.queries)) {
          if (query.endpointName === "getPosts" && query.status === "fulfilled") {
            const patch = dispatch(
              postsApi.util.updateQueryData("getPosts", query.originalArgs, (draft) => {
                if (draft?.data) {
                  const post = draft.data.find((p) => p.postId === postId)
                  if (post) {
                    if (post.currentUserReaction === type) {
                      // Toggle off
                      post.currentUserReaction = null
                      post.totalReactions = Math.max(0, (post.totalReactions || 0) - 1)
                    } else {
                      // Switch or add reaction
                      if (!post.currentUserReaction) {
                        post.totalReactions = (post.totalReactions || 0) + 1
                      }
                      post.currentUserReaction = type
                    }
                  }
                }
              })
            )
            patches.push(patch)
          } else if (query.endpointName === "getPostById" && query.status === "fulfilled") {
            const patch = dispatch(
              postsApi.util.updateQueryData("getPostById", query.originalArgs, (draft) => {
                if (draft?.data && draft.data.postId === postId) {
                  const post = draft.data
                  if (post.currentUserReaction === type) {
                    post.currentUserReaction = null
                    post.totalReactions = Math.max(0, (post.totalReactions || 0) - 1)
                  } else {
                    if (!post.currentUserReaction) {
                      post.totalReactions = (post.totalReactions || 0) + 1
                    }
                    post.currentUserReaction = type
                  }
                }
              })
            )
            patches.push(patch)
          }
        }

        try {
          await queryFulfilled
        } catch {
          // If the request fails, revert all optimistic updates
          patches.forEach((patch) => patch.undo())
        }
      },
    }),
  }),
})

export const { useGetPostsQuery, useGetPostByIdQuery, useReactToPostMutation } =
  postsApi
