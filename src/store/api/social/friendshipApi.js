import { socialApi } from "./socialApi"

const DEFAULT_PAGE_SIZE = 20
export const MAX_SOCIAL_PAGE_SIZE = 50
const MAX_AUTO_PAGES = 20

const normalizeFilterArgs = (params, defaultPageSize = DEFAULT_PAGE_SIZE, { defaultFetchAllOnNull = false } = {}) => {
  if (params == null) {
    return {
      page: 1,
      pageSize: defaultFetchAllOnNull ? MAX_SOCIAL_PAGE_SIZE : defaultPageSize,
      searchKeyword: "",
      isTeacher: undefined,
      level: undefined,
      fetchAll: defaultFetchAllOnNull,
    }
  }
  if (typeof params === "number" || typeof params === "string") {
    return {
      page: 1,
      pageSize: MAX_SOCIAL_PAGE_SIZE,
      searchKeyword: "",
      isTeacher: undefined,
      level: undefined,
      legacyId: params,
      fetchAll: true,
    }
  }
  if (typeof params === "object") {
    const page = Math.max(1, Number(params.Page ?? params.page ?? 1) || 1)
    const rawPageSize = params.PageSize ?? params.pageSize ?? defaultPageSize
    const numericPageSize = Math.max(1, Number(rawPageSize) || defaultPageSize)
    const fetchAll = params.fetchAll === true || (page === 1 && numericPageSize > MAX_SOCIAL_PAGE_SIZE)
    const pageSize = Math.min(numericPageSize, MAX_SOCIAL_PAGE_SIZE)
    const rawKeyword = params.SearchKeyword ?? params.searchKeyword ?? ""
    const searchKeyword = typeof rawKeyword === "string" ? rawKeyword.trim() : ""
    const isTeacher = params.isTeacher ?? params.IsTeacher ?? undefined
    const level = typeof (params.level ?? params.Level) === "string"
      ? (params.level ?? params.Level).trim() || undefined
      : undefined
    const accountId = params.accountId ?? params.targetAccountId ?? params.userId ?? undefined
    return { page, pageSize, searchKeyword, isTeacher, level, accountId, fetchAll }
  }
  return {
    page: 1,
    pageSize: defaultPageSize,
    searchKeyword: "",
    isTeacher: undefined,
    level: undefined,
    fetchAll: false,
  }
}

const toQueryParams = ({ page, pageSize, searchKeyword, isTeacher, level }) => {
  const clampedSize = Math.min(Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE), MAX_SOCIAL_PAGE_SIZE)
  const qp = { Page: Math.max(1, Number(page) || 1), PageSize: clampedSize }
  if (searchKeyword) qp.SearchKeyword = searchKeyword
  if (isTeacher !== undefined && isTeacher !== null && isTeacher !== "") qp.IsTeacher = isTeacher
  if (level) qp.Level = level
  return qp
}

const extractList = (res) => (Array.isArray(res) ? res : res?.data || [])

const getItemId = (u) =>
  u?.accountId ?? u?.id ?? u?.userId ?? u?.friendshipId ?? u?.Addressee?.accountId ?? u?.Requester?.accountId

export async function executeSocialListQuery(
  { url, arg, defaultPageSize = DEFAULT_PAGE_SIZE, defaultFetchAllOnNull = false, idOf = getItemId },
  baseQuery,
) {
  const n = normalizeFilterArgs(arg, defaultPageSize, { defaultFetchAllOnNull })
  if (!n.fetchAll) {
    return baseQuery({
      url,
      method: "GET",
      params: toQueryParams(n),
    })
  }

  const collected = []
  const seenIds = new Set()

  for (let currentPage = 1; currentPage <= MAX_AUTO_PAGES; currentPage += 1) {
    const res = await baseQuery({
      url,
      method: "GET",
      params: toQueryParams({ ...n, page: currentPage, pageSize: MAX_SOCIAL_PAGE_SIZE }),
    })
    if (res.error) {
      return { error: res.error }
    }

    const batch = extractList(res.data)
    for (const item of batch) {
      const key = idOf(item)
      if (key == null) {
        collected.push(item)
      } else if (!seenIds.has(key)) {
        seenIds.add(key)
        collected.push(item)
      }
    }

    if (batch.length < MAX_SOCIAL_PAGE_SIZE) {
      break
    }
  }

  return {
    data: {
      data: collected,
      page: 1,
      pageSize: collected.length,
      hasMore: false,
    },
  }
}

const mergePaged = (currentCache, newItems, { arg }, idOf = getItemId) => {
  const { page, pageSize } = normalizeFilterArgs(arg)
  const effectivePageSize = Math.min(pageSize, MAX_SOCIAL_PAGE_SIZE)
  const incomingData = extractList(newItems)
  if (page === 1) {
    currentCache.data = incomingData
    currentCache.page = newItems?.page ?? 1
    currentCache.pageSize = newItems?.pageSize ?? effectivePageSize
  } else {
    const currentList = Array.isArray(currentCache?.data) ? currentCache.data : []
    const existingIds = new Set(currentList.map((u) => idOf(u)))
    const filtered = incomingData.filter((u) => !existingIds.has(idOf(u)))
    currentCache.data = [...currentList, ...filtered]
    currentCache.page = newItems?.page ?? page
    currentCache.pageSize = newItems?.pageSize ?? effectivePageSize
  }
  currentCache.hasMore =
    newItems?.hasMore !== undefined
      ? Boolean(newItems.hasMore)
      : incomingData.length >= effectivePageSize
}

const forceRefetchFiltered = ({ currentArg, previousArg }) => {
  const c = normalizeFilterArgs(currentArg)
  const p = normalizeFilterArgs(previousArg)
  const cTarget = currentArg?.accountId ?? currentArg?.targetAccountId ?? currentArg
  const pTarget = previousArg?.accountId ?? previousArg?.targetAccountId ?? previousArg
  return (
    c.page !== p.page ||
    c.pageSize !== p.pageSize ||
    c.fetchAll !== p.fetchAll ||
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
      query: (accountId) => {
        const params = accountId != null ? { accountId } : undefined
        return {
          url: "/friendships/counts",
          method: "GET",
          params,
        }
      },
      providesTags: (result, error, accountId) => [
        { type: "FriendshipCounts", id: accountId ?? "self" },
      ],
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        `${endpointName}_${queryArgs ?? "self"}`,
      forceRefetch: ({ currentArg, previousArg }) =>
        (currentArg ?? null) !== (previousArg ?? null),
    }),
    getFriends: builder.query({
      queryFn: (arg, _queryApi, _extraOptions, baseQuery) => {
        const accountId = resolveAccountId(arg)
        return executeSocialListQuery(
          {
            url: `/friendships/user/${accountId}`,
            arg,
            idOf: (u) => u?.accountId ?? u?.id ?? u?.userId,
          },
          baseQuery,
        )
      },
      providesTags: (result, error, arg) => {
        const accountId = resolveAccountId(arg, "")
        return [{ type: "Friend", id: `LIST-${accountId}` }, "Friend"]
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs)
        const target = resolveAccountId(queryArgs, "")
        return `${endpointName}_${target}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${n.fetchAll ? "all" : n.pageSize}`
      },
      merge: (c, n, o) => mergePaged(c, n, o, (u) => u?.accountId ?? u?.id ?? u?.userId),
      forceRefetch: forceRefetchFiltered,
    }),
    getFollowers: builder.query({
      queryFn: (arg, _queryApi, _extraOptions, baseQuery) => {
        const accountId = resolveAccountId(arg)
        return executeSocialListQuery(
          {
            url: `/friendships/user/${accountId}/followers`,
            arg,
            idOf: (u) => u?.accountId ?? u?.id ?? u?.userId,
          },
          baseQuery,
        )
      },
      providesTags: (result, error, arg) => {
        const accountId = resolveAccountId(arg, "")
        return [{ type: "Follower", id: `LIST-${accountId}` }, "Follower"]
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs)
        const target = resolveAccountId(queryArgs, "")
        return `${endpointName}_${target}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${n.fetchAll ? "all" : n.pageSize}`
      },
      merge: (c, n, o) => mergePaged(c, n, o, (u) => u?.accountId ?? u?.id ?? u?.userId),
      forceRefetch: forceRefetchFiltered,
    }),
    getFollowing: builder.query({
      queryFn: (arg, _queryApi, _extraOptions, baseQuery) => {
        const accountId = resolveAccountId(arg)
        return executeSocialListQuery(
          {
            url: `/friendships/user/${accountId}/following`,
            arg,
            idOf: (u) => u?.accountId ?? u?.id ?? u?.userId,
          },
          baseQuery,
        )
      },
      providesTags: (result, error, arg) => {
        const accountId = resolveAccountId(arg, "")
        return [{ type: "Following", id: `LIST-${accountId}` }, "Following"]
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs)
        const target = resolveAccountId(queryArgs, "")
        return `${endpointName}_${target}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${n.fetchAll ? "all" : n.pageSize}`
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
      queryFn: (params, _queryApi, _extraOptions, baseQuery) =>
        executeSocialListQuery(
          {
            url: "/friendships/requests",
            arg: params,
            defaultFetchAllOnNull: true,
            idOf: (u) => u?.friendshipId ?? u?.requester?.accountId,
          },
          baseQuery,
        ),
      providesTags: ["FriendRequest"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const n = normalizeFilterArgs(queryArgs, DEFAULT_PAGE_SIZE, { defaultFetchAllOnNull: true })
        return `${endpointName}_${n.searchKeyword}_${n.isTeacher ?? ""}_${n.level ?? ""}_${n.fetchAll ? "all" : n.pageSize}`
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
