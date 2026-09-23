import { socialApi } from "./socialApi"
import { maskBody } from "@/shared/utils/moderation"
import {
  updatePostInCaches,
  updateCommentInCaches,
} from "./utils/postsCacheUtils"

/**
 * @typedef {Object} Topic
 * @property {number} topicId
 * @property {string} title
 * @property {string} slug
 * @property {0|1|2|3} languageCommunity - 0: All, 1: English, 2: Chinese, 3: Japanese
 */

export const postsApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getTopics: builder.query({
      query: ({ languageCommunity, keyword, page = 1, pageSize = 10 } = {}) => ({
        url: "/topics",
        params: {
          languageCommunity,
          keyword,
          page,
          pageSize,
        },
      }),
      providesTags: ["Topic"],
    }),
    getPosts: builder.query({
      query: ({
        page = 1,
        pageSize = 10,
        postType,
        searchKeyword,
        sortBy,
        topicIds,
      } = {}) => ({
        url: "/Post",
        params: {
          page,
          pageSize,
          postType,
          searchKeyword,
          sortBy,
          sortDesc: true,
          topicIds:
            Array.isArray(topicIds) && topicIds.length > 0
              ? topicIds
              : topicIds !== undefined && topicIds !== null && topicIds !== ""
                ? [topicIds]
                : undefined,
        },
      }),
      providesTags: ["Post"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const topicKey = Array.isArray(queryArgs?.topicIds)
          ? queryArgs.topicIds.slice().sort().join(",")
          : queryArgs?.topicIds || ""
        return `${endpointName}_${queryArgs?.postType || "all"}_${queryArgs?.searchKeyword || ""}_${queryArgs?.sortBy || "createDate"}_${topicKey}`
      },
      transformResponse: (response, meta, arg) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
        return {
          ...(typeof response === "object" && response !== null && !Array.isArray(response)
            ? response
            : {}),
          data: items,
          hasMore: items.length >= (arg?.pageSize || 10),
        }
      },
      merge: (currentCache, newItems, { arg }) => {
        const items = Array.isArray(newItems?.data)
          ? newItems.data
          : Array.isArray(newItems)
            ? newItems
            : []
        if (arg.page === 1) {
          currentCache.data = items
        } else {
          const existingData = Array.isArray(currentCache.data)
            ? currentCache.data
            : Array.isArray(currentCache)
              ? currentCache
              : []
          const newPosts = items.filter(
            (newPost) =>
              !existingData.some((p) => p.postId === newPost.postId),
          )
          if (Array.isArray(currentCache.data)) {
            currentCache.data.push(...newPosts)
          } else {
            currentCache.data = [...existingData, ...newPosts]
          }
        }
        currentCache.hasMore = items.length >= (arg?.pageSize || 10)
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page
      },
    }),
    getLandingPosts: builder.query({
      query: (limit = 12) => ({
        url: "/Post/landing",
        params: { limit },
      }),
      providesTags: ["Post"],
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
      // [Moderation] Che ★ nội dung bình luận trước khi gửi.
      queryFn: async (
        { postId, content, parentCommentId, replyToAccountId },
        api,
        extraOptions,
        baseQuery,
      ) =>
        baseQuery({
          url: `/Post/${postId}/comments`,
          method: "POST",
          body: await maskBody(api, {
            content,
            parentCommentId,
            replyToAccountId,
          }),
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
      // [Moderation] Sửa bình luận đi qua cùng một lớp như lúc tạo.
      queryFn: async (
        { postId, commentId, content },
        api,
        extraOptions,
        baseQuery,
      ) =>
        baseQuery({
          url: `/Post/${postId}/comments/${commentId}`,
          method: "PUT",
          body: await maskBody(api, { content }),
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
              comment.totalReactions = Math.max(
                0,
                (comment.totalReactions || 0) - 1,
              )
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
  useGetTopicsQuery,
  useGetPostsQuery,
  useGetLandingPostsQuery,
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
