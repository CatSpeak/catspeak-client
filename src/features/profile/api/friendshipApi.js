import { baseApi } from "@/store/api/baseApi"

export const friendshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConnectionStatus: builder.query({
      query: (targetAccountId) => `/friendships/status/${targetAccountId}`,
      providesTags: (result, error, id) => [{ type: "Friendship", id }],
    }),
    getFriends: builder.query({
      query: (accountId) => `/friendships/user/${accountId}`,
      providesTags: (result, error, accountId) => [
        { type: "Friend", id: `LIST-${accountId}` },
      ],
    }),
    getFollowers: builder.query({
      query: (accountId) => `/friendships/user/${accountId}/followers`,
      providesTags: (result, error, accountId) => [
        { type: "Follower", id: `LIST-${accountId}` },
      ],
    }),
    getFollowing: builder.query({
      query: (accountId) => `/friendships/user/${accountId}/following`,
      providesTags: (result, error, accountId) => [
        { type: "Following", id: `LIST-${accountId}` },
      ],
    }),
    getFriendRecommendations: builder.query({
      query: (limit = 10) => ({
        url: `/friendships/recommendations`,
        method: "GET",
        params: { limit },
      }),
      providesTags: ["Recommendation"],
    }),
    followUser: builder.mutation({
      query: (targetAccountId) => ({
        url: `/friendships/follow/${targetAccountId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, targetAccountId) => [
        { type: "Friendship", id: targetAccountId },
        "Recommendation"
      ],
    }),
    unfollowUser: builder.mutation({
      query: (targetAccountId) => ({
        url: `/friendships/unfollow/${targetAccountId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, targetAccountId) => [
        { type: "Friendship", id: targetAccountId }
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
        "FriendRequest"
      ],
    }),
    deleteFriendship: builder.mutation({
      query: (friendshipId) => ({
        url: `/friendships/${friendshipId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Friendship", "Friend", "PendingRequest"],
    }),
    respondFriendRequest: builder.mutation({
      query: ({ friendshipId, action }) => ({
        url: `/friendships/requests/${friendshipId}`,
        method: "PUT",
        body: { action },
      }),
      invalidatesTags: ["FriendRequest", "Friendship", { type: "Friend", id: "LIST-undefined" }],
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
