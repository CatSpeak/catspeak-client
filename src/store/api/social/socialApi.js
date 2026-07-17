import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SOCIAL_API_BASE_URL || "/api/social",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set("authorization", `Bearer ${token}`)
      }

      // Extract community language from URL (e.g., /zh/cat-speak/...)
      const match = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/i)
      if (match) {
        headers.set("X-Community-Lang", match[1])
      }

      return headers
    },
  }),
  tagTypes: ["Post", "Conversations", "Messages", "Friendship", "Friend", "Follower", "Following", "Recommendation", "FriendRequest"],
  endpoints: () => ({}),
})
