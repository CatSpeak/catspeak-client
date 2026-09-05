import { socialApi } from "./socialApi"

const DEFAULT_PAGE_SIZE = 20
// Legacy callers (chat modals, invite dropdowns) pass a bare accountId and expect
// the full list for client-side filtering. Keep them working without pagination UI.
const LEGACY_PAGE_SIZE = 200

const normalizeFilterArgs = (params, defaultPageSize = DEFAULT_PAGE_SIZE) => {
  if (params == null) {
    return { page: 1, pageSize: defaultPageSize, searchKeyword: "", isTeacher: undefined, level: undefined }
  }
  if (typeof params === "number" || typeof params === "string") {
    return { page: 1, pageSize: LEGACY_PAGE_SIZE, searchKeyword: "", isTeacher: undefined, level: undefined, legacyId: params }
  }
  if (typeof params === "object") {
    // Legacy: plain accountId passed as { skip }? No — object form is new paged form.
    // Support both { accountId, targetAccountId } + filters.
    const page = params.Page ?? params.page ?? 1
    const hasExplicitPageSize = params.PageSize != null || params.pageSize != null
    const pageSize = params.PageSize ?? params.pageSize ?? defaultPageSize
    const rawKeyword = params.SearchKeyword ?? params.searchKeyword ?? ""
    const searchKeyword = typeof rawKeyword === "string" ? rawKeyword.trim() : ""
    const isTeacher = params.isTeacher ?? params.IsTeacher ?? undefined
    const level = typeof (params.level ?? params.Level) === "string"
      ? (params.level ?? params.Level).trim() || undefined
      : undefined
    const accountId = params.accountId ?? params.targetAccountId ?? params.userId ?? undefined
    return { page, pageSize: hasExplicitPageSize ? pageSize : pageSize, searchKeyword, isTeacher, level, accountId }
  }
  return { page: 1, pageSize: defaultPageSize, searchKeyword: "", isTeacher: undefined, level: undefined }
}

const toQueryParams = ({ page, pageSize, searchKeyword, isTeacher, level }) => {
  const qp = { Page: page, PageSize: pageSize }
  if (searchKeyword) qp.SearchKeyword = searchKeyword
  if (isTeacher !== undefined && isTeacher !== null && isTeacher !== "") qp.IsTeacher = isTeacher
  if (level) qp.Level = level
  return qp
}

const extractList = (res) => (Array.isArray(res) ? res : res?.data || [])

const getItemId = (u) =>
  u?.accountId ?? u?.id ?? u?.userId ?? u?.friendshipId ?? u?.Addressee?.accountId ?? u?.Requester?.accountId

const mergePaged = (currentCache, newItems, { arg }, idOf = getItemId) => {
  const { page, pageSize } = normalizeFilterArgs(arg)
  const incomingData = extractList(newItems)
  if (page === 1) {
    currentCache.data = incomingData
    currentCache.page = newItems?.page ?? 1
    currentCache.pageSize = newItems?.pageSize ?? pageSize
  } else {
    const currentList = Array.isArray(currentCache?.data) ? currentCache.data : []
    const existingIds = new Set(currentList.map((u) => idOf(u)))
    const filtered = incomingData.filter((u) => !existingIds.has(idOf(u)))
    currentCache.data = [...currentList, ...filtered]
    currentCache.page = newItems?.page ?? page
    currentCache.pageSize = newItems?.pageSize ?? pageSize
  }
  currentCache.hasMore = incomingData.length >= pageSize
}

const forceRefetchFiltered = ({ currentArg, previousArg }) => {
  const c = normalizeFilterArgs(currentArg)
  const p = normalizeFilterArgs(previousArg)
  const cTarget = currentArg?.accountId ?? currentArg?.targetAccountId ?? currentArg
  const pTarget = previousArg?.accountId ?? previousArg?.targetAccountId ?? previousArg
  return (
    c.page !== p.page ||
    c.pageSize !== p.pageSize ||
    c.searchKeyword !== p.searchKeyword ||
    String(c.isTeacher ?? "") !== String(p.isTeacher ?? "") ||
    String(c.level ?? "") !== String(p.level ?? "") ||
    String(cTarget ?? "") !== String(pTarget ?? "")
  )
}

const resolveAccountId = (arg, fallback) => {
  if (typeof arg === "number" || typeof arg === "string") return arg
  return arg?.accountId ?? arg?.targetAccountId ?? arg?.userId ?? fallback
}

export const friendshipApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getConnectionStatus: builder.query({
      query: (targetAccountId) => `/friendships/status/${targetAccountId}`,
      providesTags: (result, error, id) => [{ type: "Friendship", id }],
    }),
    getFriendshipCounts: builder.query({
      query: () => "/friendships/counts",
      providesTags: ["FriendshipCounts"],
    }),
    getFriends: builder.query({
      query: (arg) => {
        const accountId = resolveAccountId(arg)
        const n = normalizeFilterArgs(typeof arg === "object" ? arg : { pageSize: LEGACY_PAGE_SIZE })
        // Legacy number call → pageSize 100 to preserve chat/invite modals.
        const pageSize = typeof arg === "number" || typeof arg === "string" ? LEGACY_PAGE_SIZE : n.pageSize
        return {
          url: `/friendships/user/${accountId}`,
          method: "GET",
          params: toQueryParams({ ...n, pageSize }),
        }
      },
      providesTags: (result, error, arg) => {
        const accountId = resolveAccountId(arg, "")
        return [{ type: "Friend", id: `LIST-${accountId}` }, "Friend"]
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs)
        const target = resolveAccountId(queryArgs, "")
        return `${endpointName}_${target}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${n.pageSize}`
      },
      merge: (c, n, o) => mergePaged(c, n, o, (u) => u?.accountId ?? u?.id ?? u?.userId),
      forceRefetch: forceRefetchFiltered,
    }),
    getFollowers: builder.query({
      query: (arg) => {
        const accountId = resolveAccountId(arg)
        const n = normalizeFilterArgs(typeof arg === "object" ? arg : { pageSize: LEGACY_PAGE_SIZE })
        const pageSize = typeof arg === "number" || typeof arg === "string" ? LEGACY_PAGE_SIZE : n.pageSize
        return {
          url: `/friendships/user/${accountId}/followers`,
          method: "GET",
          params: toQueryParams({ ...n, pageSize }),
        }
      },
      providesTags: (result, error, arg) => {
        const accountId = resolveAccountId(arg, "")
        return [{ type: "Follower", id: `LIST-${accountId}` }, "Follower"]
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs)
        const target = resolveAccountId(queryArgs, "")
        return `${endpointName}_${target}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${n.pageSize}`
      },
      merge: (c, n, o) => mergePaged(c, n, o, (u) => u?.accountId ?? u?.id ?? u?.userId),
      forceRefetch: forceRefetchFiltered,
    }),
    getFollowing: builder.query({
      query: (arg) => {
        const accountId = resolveAccountId(arg)
        const n = normalizeFilterArgs(typeof arg === "object" ? arg : { pageSize: LEGACY_PAGE_SIZE })
        const pageSize = typeof arg === "number" || typeof arg === "string" ? LEGACY_PAGE_SIZE : n.pageSize
        return {
          url: `/friendships/user/${accountId}/following`,
          method: "GET",
          params: toQueryParams({ ...n, pageSize }),
        }
      },
      providesTags: (result, error, arg) => {
        const accountId = resolveAccountId(arg, "")
        return [{ type: "Following", id: `LIST-${accountId}` }, "Following"]
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs)
        const target = resolveAccountId(queryArgs, "")
        return `${endpointName}_${target}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${n.pageSize}`
      },
      merge: (c, n, o) => mergePaged(c, n, o, (u) => u?.accountId ?? u?.id ?? u?.userId),
      forceRefetch: forceRefetchFiltered,
    }),
    getFriendRecommendations: builder.query({
      query: (params = {}) => {
        let page = 1
        let pageSize = DEFAULT_PAGE_SIZE
        let searchKeyword = ""
        let isTeacher
        let level

        if (typeof params === "number") {
          pageSize = params
        } else if (params && typeof params === "object") {
          page = params.Page ?? params.page ?? 1
          pageSize = params.PageSize ?? params.pageSize ?? DEFAULT_PAGE_SIZE
          searchKeyword = (params.SearchKeyword ?? params.searchKeyword ?? "").trim()
          isTeacher = params.isTeacher ?? params.IsTeacher ?? undefined
          const rawLevel = params.level ?? params.Level ?? ""
          level = typeof rawLevel === "string" && rawLevel.trim() ? rawLevel.trim() : undefined
        }

        return {
          url: `/friendships/recommendations`,
          method: "GET",
          params: toQueryParams({ page, pageSize, searchKeyword, isTeacher, level }),
        }
      },
      providesTags: ["Recommendation"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        let keyword = ""
        let pageSize = DEFAULT_PAGE_SIZE
        let isTeacher = ""
        let level = ""
        if (typeof queryArgs === "number") {
          pageSize = queryArgs
        } else if (queryArgs && typeof queryArgs === "object") {
          keyword = (queryArgs.SearchKeyword ?? queryArgs.searchKeyword ?? "").trim()
          pageSize = queryArgs.PageSize ?? queryArgs.pageSize ?? DEFAULT_PAGE_SIZE
          isTeacher = String(queryArgs.isTeacher ?? queryArgs.IsTeacher ?? "")
          const rawLevel = queryArgs.level ?? queryArgs.Level ?? ""
          level = typeof rawLevel === "string" ? rawLevel.trim() : String(rawLevel ?? "")
        }
        return `${endpointName}_${keyword}_${isTeacher}_${level}_${pageSize}`
      },
      merge: (currentCache, newItems, { arg }) => {
        let page = 1
        let pageSize = DEFAULT_PAGE_SIZE
        if (typeof arg === "number") {
          pageSize = arg
        } else if (arg && typeof arg === "object") {
          page = arg.Page ?? arg.page ?? 1
          pageSize = arg.PageSize ?? arg.pageSize ?? DEFAULT_PAGE_SIZE
        }

        const incomingData = extractList(newItems)

        if (page === 1) {
          currentCache.data = incomingData
          currentCache.page = newItems?.page ?? 1
          currentCache.pageSize = newItems?.pageSize ?? pageSize
        } else {
          const currentList = Array.isArray(currentCache?.data) ? currentCache.data : []
          const existingIds = new Set(currentList.map((u) => u.accountId))
          const filtered = incomingData.filter((u) => !existingIds.has(u.accountId))
          currentCache.data = [...currentList, ...filtered]
          currentCache.page = newItems?.page ?? page
          currentCache.pageSize = newItems?.pageSize ?? pageSize
        }
        currentCache.hasMore = incomingData.length >= pageSize
      },
      forceRefetch({ currentArg, previousArg }) {
        const getArgValues = (arg) => {
          if (typeof arg === "number") return { page: 1, pageSize: arg, keyword: "", isTeacher: "", level: "" }
          return {
            page: arg?.Page ?? arg?.page ?? 1,
            pageSize: arg?.PageSize ?? arg?.pageSize ?? DEFAULT_PAGE_SIZE,
            keyword: (arg?.SearchKeyword ?? arg?.searchKeyword ?? "").trim(),
            isTeacher: String(arg?.isTeacher ?? arg?.IsTeacher ?? ""),
            level: String(arg?.level ?? arg?.Level ?? "").trim(),
          }
        }
        const curr = getArgValues(currentArg)
        const prev = getArgValues(previousArg)

        return (
          curr.page !== prev.page ||
          curr.keyword !== prev.keyword ||
          curr.pageSize !== prev.pageSize ||
          curr.isTeacher !== prev.isTeacher ||
          curr.level !== prev.level
        )
      },
    }),
    followUser: builder.mutation({
      query: (targetAccountId) => ({
        url: `/friendships/follow/${targetAccountId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, targetAccountId) => [
        { type: "Friendship", id: targetAccountId },
        "Follower",
        "Following",
        "Recommendation",
        "FriendshipCounts",
      ],
    }),
    unfollowUser: builder.mutation({
      query: (targetAccountId) => ({
        url: `/friendships/unfollow/${targetAccountId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, targetAccountId) => [
        { type: "Friendship", id: targetAccountId },
        "Follower",
        "Following",
        "FriendshipCounts",
      ],
    }),
    getPendingFriendRequests: builder.query({
      query: (params) => {
        const n = normalizeFilterArgs(params, params == null ? LEGACY_PAGE_SIZE : DEFAULT_PAGE_SIZE)
        const pageSize = params == null ? LEGACY_PAGE_SIZE : n.pageSize
        return {
          url: "/friendships/requests",
          method: "GET",
          params: toQueryParams({ ...n, pageSize }),
        }
      },
      providesTags: ["FriendRequest"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs, queryArgs == null ? LEGACY_PAGE_SIZE : DEFAULT_PAGE_SIZE)
        const pageSize = queryArgs == null ? LEGACY_PAGE_SIZE : n.pageSize
        return `${endpointName}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${pageSize}`
      },
      merge: (c, n, o) => mergePaged(c, n, o, (u) => u?.friendshipId ?? u?.requester?.accountId),
      forceRefetch: forceRefetchFiltered,
    }),
    getSentFriendRequests: builder.query({
      query: (params = {}) => {
        const n = normalizeFilterArgs(params, DEFAULT_PAGE_SIZE)
        return {
          url: "/friendships/requests/sent",
          method: "GET",
          params: toQueryParams(n),
        }
      },
      providesTags: ["SentFriendRequest"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs)
        return `${endpointName}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${n.pageSize}`
      },
      merge: (c, n, o) => mergePaged(c, n, o, (u) => u?.friendshipId ?? u?.addressee?.accountId),
      forceRefetch: forceRefetchFiltered,
    }),
    sendFriendRequest: builder.mutation({
      query: (targetAccountId) => ({
        url: "/friendships/requests",
        method: "POST",
        body: { addresseeId: targetAccountId },
      }),
      invalidatesTags: (result, error, targetAccountId) => [
        { type: "Friendship", id: targetAccountId },
        "Friendship",
        "FriendRequest",
        "SentFriendRequest",
        "Friend",
        "Following",
        "Recommendation",
        "FriendshipCounts",
      ],
    }),
    deleteFriendship: builder.mutation({
      query: (friendshipId) => ({
        url: `/friendships/${friendshipId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Friendship",
        "Friend",
        "Follower",
        "Following",
        "FriendRequest",
        "SentFriendRequest",
        "Recommendation",
        "FriendshipCounts",
      ],
    }),
    respondFriendRequest: builder.mutation({
      query: ({ friendshipId, action }) => ({
        url: `/friendships/requests/${friendshipId}`,
        method: "PUT",
        body: { action },
      }),
      invalidatesTags: [
        "FriendRequest",
        "SentFriendRequest",
        "Friendship",
        "Friend",
        "Follower",
        "Following",
        "Recommendation",
        "FriendshipCounts",
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetConnectionStatusQuery,
  useGetFriendshipCountsQuery,
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetFriendRecommendationsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useSendFriendRequestMutation,
  useGetPendingFriendRequestsQuery,
  useGetSentFriendRequestsQuery,
  useRespondFriendRequestMutation,
  useDeleteFriendshipMutation,
} = friendshipApi
