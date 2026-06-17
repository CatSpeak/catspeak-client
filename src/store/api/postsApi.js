import { baseApi } from "./baseApi"

export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url: "/Post",
        params: { page, pageSize, sortBy: "createDate", sortDesc: true },
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
    getSharedPost: builder.query({
      query: (shareToken) => `/Post/shared/${shareToken}`,
      providesTags: (result, error, id) => [{ type: "Post", id: `shared-${id}` }],
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
    sharePost: builder.mutation({
      query: (postId) => ({
        url: `/Post/${postId}/share`,
        method: "POST",
      }),
    }),
    getPostComments: builder.query({
      query: ({ postId, page = 1, pageSize = 10 }) => ({
        url: `/Post/${postId}/comments`,
        params: { page, pageSize },
      }),
      providesTags: (result, error, { postId }) => [
        { type: "PostComment", id: `LIST-${postId}` },
      ],
      serializeQueryArgs: ({ queryArgs }) => {
        return `getPostComments-${queryArgs.postId}`
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          currentCache.data = newItems.data
        } else {
          const newComments = newItems.data.filter(
            (newComment) => !currentCache.data.some((c) => c.commentId === newComment.commentId)
          )
          currentCache.data.push(...newComments)
        }
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page
      },
    }),
    createPostComment: builder.mutation({
      query: ({ postId, content, parentCommentId, replyToAccountId }) => ({
        url: `/Post/${postId}/comments`,
        method: "POST",
        body: { content, parentCommentId, replyToAccountId },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "PostComment", id: `LIST-${postId}` },
      ],
    }),
    deletePostComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/Post/${postId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "PostComment", id: `LIST-${postId}` },
      ],
    }),
    editPostComment: builder.mutation({
      query: ({ postId, commentId, content }) => ({
        url: `/Post/${postId}/comments/${commentId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "PostComment", id: `LIST-${postId}` },
      ],
    }),
    reactToComment: builder.mutation({
      query: ({ postId, commentId, type }) => ({
        url: `/Post/${postId}/comments/${commentId}/react`,
        method: "POST",
        params: { type },
      }),
      async onQueryStarted({ postId, commentId, type }, { dispatch, getState, queryFulfilled }) {
        const state = getState()
        const patches = []

        for (const [key, query] of Object.entries(state.api.queries)) {
          if (query.endpointName === "getPostComments" && query.status === "fulfilled" && query.originalArgs?.postId === postId) {
            const patch = dispatch(
              postsApi.util.updateQueryData("getPostComments", query.originalArgs, (draft) => {
                const list = draft?.data;
                if (list) {
                  let comment = list.find((c) => c.commentId === commentId);
                  if (!comment) {
                    for (const topLevel of list) {
                      if (topLevel.replies) {
                        comment = topLevel.replies.find((r) => r.commentId === commentId);
                        if (comment) break;
                      }
                    }
                  }
                  if (comment) {
                    if (comment.currentUserReaction === type) {
                      comment.currentUserReaction = null
                      comment.totalReactions = Math.max(0, (comment.totalReactions || 0) - 1)
                    } else {
                      if (!comment.currentUserReaction) {
                        comment.totalReactions = (comment.totalReactions || 0) + 1
                      }
                      comment.currentUserReaction = type
                    }
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
          patches.forEach((patch) => patch.undo())
        }
      },
    }),
  }),
})

export const { 
  useGetPostsQuery, 
  useGetPostByIdQuery, 
  useGetSharedPostQuery,
  useReactToPostMutation,
  useSharePostMutation,
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
  useEditPostCommentMutation,
  useReactToCommentMutation
} = postsApi
