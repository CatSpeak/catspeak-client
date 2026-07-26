import { socialApi } from "./socialApi"
import {
  updatePostInCaches,
  updateCommentInCaches,
} from "./utils/postsCacheUtils"

export const postsApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: ({ page = 1, pageSize = 10, postType } = {}) => ({
        url: "/Post",
        params: {
          page,
          pageSize,
          postType,
          sortBy: "createDate",
          sortDesc: true,
        },
      }),
      providesTags: ["Post"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}_${queryArgs?.postType || "all"}`
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          currentCache.data = newItems.data
        } else {
          const newPosts = newItems.data.filter(
            (newPost) =>
              !currentCache.data.some((p) => p.postId === newPost.postId),
          )
          currentCache.data.push(...newPosts)
        }
        currentCache.hasMore = newItems.data.length === arg.pageSize
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.postType !== previousArg?.postType
        )
      },
    }),
    getPostById: builder.query({
      query: (postId) => `/Post/${postId}`,
      providesTags: (result, error, id) => [{ type: "Post", id }],
    }),
    getPostBySlug: builder.query({
      query: (slug) => `/Post/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Post", id: slug }],
    }),
    getSharedPost: builder.query({
      query: (shareToken) => `/Post/shared/${shareToken}`,
      providesTags: (result, error, id) => [
        { type: "Post", id: `shared-${id}` },
      ],
    }),
    reactToPost: builder.mutation({
      query: ({ postId, type }) => ({
        url: `/Post/${postId}/react`,
        method: "POST",
        params: { type },
      }),
      async onQueryStarted(
        { postId, type },
        { dispatch, getState, queryFulfilled },
      ) {
        // 1. Instant optimistic local update
        const patches = updatePostInCaches(
          getState(),
          dispatch,
          postId,
          (post) => {
            if (post.currentUserReaction === type) {
              post.currentUserReaction = null
              post.totalReactions = Math.max(0, (post.totalReactions || 0) - 1)
            } else {
              if (!post.currentUserReaction) {
                post.totalReactions = (post.totalReactions || 0) + 1
              }
              post.currentUserReaction = type
            }
          },
        )

        try {
          // 2. Sync with authoritative server response when request completes
          const { data: res } = await queryFulfilled
          const serverData = res?.data || res
          if (serverData) {
            updatePostInCaches(getState(), dispatch, postId, (post) => {
              if (serverData.currentUserReaction !== undefined)
                post.currentUserReaction = serverData.currentUserReaction
              if (serverData.totalReactions !== undefined)
                post.totalReactions = serverData.totalReactions
            })
          }
        } catch {
          // 3. Rollback optimistic patches on error
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
            (newComment) =>
              !currentCache.data.some(
                (c) => c.commentId === newComment.commentId,
              ),
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
      async onQueryStarted(
        { postId, parentCommentId },
        { dispatch, getState, queryFulfilled },
      ) {
        try {
          const { data: created } = await queryFulfilled
          const queries =
            getState().socialApi?.queries || getState().api?.queries || {}

          for (const [, query] of Object.entries(queries)) {
            if (
              query.endpointName === "getPostComments" &&
              query.status === "fulfilled" &&
              String(query.originalArgs?.postId) === String(postId)
            ) {
              dispatch(
                socialApi.util.updateQueryData(
                  "getPostComments",
                  query.originalArgs,
                  (draft) => {
                    if (!draft?.data) return
                    const newComment = created?.data || created
                    if (!newComment) return

                    if (parentCommentId) {
                      const parent = draft.data.find(
                        (c) => String(c.commentId) === String(parentCommentId),
                      )
                      if (parent) {
                        if (!parent.replies) parent.replies = []
                        parent.replies.push(newComment)
                      }
                    } else {
                      draft.data.unshift(newComment)
                    }
                  },
                ),
              )
              return
            }
          }
        } catch {
          // Refetch will correct the cache on error
        }
      },
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
      async onQueryStarted(
        { postId, commentId, type },
        { dispatch, getState, queryFulfilled },
      ) {
        const patches = updateCommentInCaches(
          getState(),
          dispatch,
          postId,
          commentId,
          (comment) => {
            if (comment.currentUserReaction === type) {
              comment.currentUserReaction = null
              comment.totalReactions = Math.max(0, (comment.totalReactions || 0) - 1)
            } else {
              if (!comment.currentUserReaction) {
                comment.totalReactions = (comment.totalReactions || 0) + 1
              }
              comment.currentUserReaction = type
            }
          },
        )

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
  useGetPostBySlugQuery,
  useGetSharedPostQuery,
  useReactToPostMutation,
  useSharePostMutation,
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
  useEditPostCommentMutation,
  useReactToCommentMutation,
} = postsApi
