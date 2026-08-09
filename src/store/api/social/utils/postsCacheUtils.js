import { socialApi } from "../socialApi"

/**
 * Helper to update a post across all active query caches (getPosts, getUserTimelinePosts, getPostById, getPostBySlug, getSharedPost).
 */
export const updatePostInCaches = (state, dispatch, postId, updateFn) => {
  const queries = state.socialApi?.queries || state.api?.queries || {}
  const patches = []

  for (const [, query] of Object.entries(queries)) {
    if (query.status !== "fulfilled") continue
    const endpoint = query.endpointName

    if (endpoint === "getPosts" || endpoint === "getUserTimelinePosts") {
      const patch = dispatch(
        socialApi.util.updateQueryData(endpoint, query.originalArgs, (draft) => {
          const post = draft?.data?.find(
            (p) => String(p.postId) === String(postId),
          )
          if (post) updateFn(post)
        }),
      )
      patches.push(patch)
    } else if (
      endpoint === "getPostById" ||
      endpoint === "getPostBySlug" ||
      endpoint === "getSharedPost"
    ) {
      const patch = dispatch(
        socialApi.util.updateQueryData(endpoint, query.originalArgs, (draft) => {
          const post = draft?.data
          if (post && String(post.postId) === String(postId)) {
            updateFn(post)
          }
        }),
      )
      patches.push(patch)
    }
  }

  return patches
}

/**
 * Helper to update a comment across active getPostComments query caches.
 */
export const updateCommentInCaches = (
  state,
  dispatch,
  postId,
  commentId,
  updateFn,
) => {
  const queries = state.socialApi?.queries || state.api?.queries || {}
  const patches = []

  for (const [, query] of Object.entries(queries)) {
    if (
      query.endpointName === "getPostComments" &&
      query.status === "fulfilled" &&
      String(query.originalArgs?.postId) === String(postId)
    ) {
      const patch = dispatch(
        socialApi.util.updateQueryData(
          "getPostComments",
          query.originalArgs,
          (draft) => {
            const list = draft?.data
            if (!list) return
            let comment = list.find(
              (c) => String(c.commentId) === String(commentId),
            )
            if (!comment) {
              for (const topLevel of list) {
                if (topLevel.replies) {
                  comment = topLevel.replies.find(
                    (r) => String(r.commentId) === String(commentId),
                  )
                  if (comment) break
                }
              }
            }
            if (comment) updateFn(comment)
          },
        ),
      )
      patches.push(patch)
    }
  }

  return patches
}
