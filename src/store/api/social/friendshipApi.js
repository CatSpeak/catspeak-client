import { socialApi } from "./socialApi"

export const friendshipApi = socialApi.injectEndpoints({
  endpoints: (builder) => ({
    getConnectionStatus: builder.query({
      query: (targetAccountId) => `/friendships/status/${targetAccountId}`,
      providesTags: (result, error, id) => [{ type: "Friendship", id }],
    }),
    getFriends: builder.query({
      query: (accountId) => `/friendships/user/${accountId}`,
      providesTags: (result, error, accountId) => [
        { type: "Friend", id: `LIST-${accountId}` },
        "Friend",
      ],
    }),
    getFollowers: builder.query({
      query: (accountId) => `/friendships/user/${accountId}/followers`,
      providesTags: (result, error, accountId) => [
        { type: "Follower", id: `LIST-${accountId}` },
        "Follower",
      ],
    }),
    getFollowing: builder.query({
      query: (accountId) => `/friendships/user/${accountId}/following`,
      providesTags: (result, error, accountId) => [
        { type: "Following", id: `LIST-${accountId}` },
        "Following",
      ],
    }),
    getFriendRecommendations: builder.query({
      query: (params = {}) => {
        let page = 1
        let pageSize = 10
        let searchKeyword = ""

        if (typeof params === "number") {
          pageSize = params
        } else if (params && typeof params === "object") {
          page = params.Page ?? params.page ?? 1
          pageSize = params.PageSize ?? params.pageSize ?? 10
          searchKeyword = (params.SearchKeyword ?? params.searchKeyword ?? "").trim()
        }

        const queryParams = {
          Page: page,
          PageSize: pageSize,
        }

        if (searchKeyword) {
          queryParams.SearchKeyword = searchKeyword
        }

        return {
          url: `/friendships/recommendations`,
          method: "GET",
          params: queryParams,
        }
      },
      providesTags: ["Recommendation"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        let keyword = ""
        let pageSize = 10
        if (typeof queryArgs === "number") {
          pageSize = queryArgs
        } else if (queryArgs && typeof queryArgs === "object") {
          keyword = (queryArgs.SearchKeyword ?? queryArgs.searchKeyword ?? "").trim()
          pageSize = queryArgs.PageSize ?? queryArgs.pageSize ?? 10
        }
        return `${endpointName}_${keyword}_${pageSize}`
      },
      merge: (currentCache, newItems, { arg }) => {
        let page = 1
        let pageSize = 10
        if (typeof arg === "number") {
          pageSize = arg
        } else if (arg && typeof arg === "object") {
          page = arg.Page ?? arg.page ?? 1
          pageSize = arg.PageSize ?? arg.pageSize ?? 10
        }

        const incomingData = Array.isArray(newItems?.data)
          ? newItems.data
          : Array.isArray(newItems)
          ? newItems
          : []

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
          if (typeof arg === "number") return { page: 1, pageSize: arg, keyword: "" }
          return {
            page: arg?.Page ?? arg?.page ?? 1,
            pageSize: arg?.PageSize ?? arg?.pageSize ?? 10,
            keyword: (arg?.SearchKeyword ?? arg?.searchKeyword ?? "").trim(),
          }
        }
        const curr = getArgValues(currentArg)
        const prev = getArgValues(previousArg)

        return (
          curr.page !== prev.page ||
          curr.keyword !== prev.keyword ||
          curr.pageSize !== prev.pageSize
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
      ],
    }),
    getPendingFriendRequests: builder.query({
      query: () => "/friendships/requests",
      providesTags: ["FriendRequest"],
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
        "Friend",
        "Recommendation",
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
        "Recommendation",
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
        "Friendship",
        "Friend",
        "Follower",
        "Following",
        "Recommendation",
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetConnectionStatusQuery,
  useGetFriendsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetFriendRecommendationsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useSendFriendRequestMutation,
  useGetPendingFriendRequestsQuery,
  useRespondFriendRequestMutation,
  useDeleteFriendshipMutation,
} = friendshipApi
