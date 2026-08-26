import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { createReauthBaseQuery } from "../baseApi"
import { getBrowserTimeZone } from "@/shared/constants/timezones"

const socialRawBaseQuery = fetchBaseQuery({
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

    // Attach user timezone (e.g. "Asia/Ho_Chi_Minh")
    const userTz = getState()?.auth?.user?.timeZone || getBrowserTimeZone()
    headers.set("X-Time-Zone", userTz)

    // Attach local timezone offset in minutes
    headers.set("X-Timezone-Offset", (-new Date().getTimezoneOffset()).toString())

    return headers
  },
})

export const socialApi = createApi({
  reducerPath: "socialApi",
  baseQuery: createReauthBaseQuery(socialRawBaseQuery),
  tagTypes: [
    "Post",
    "PostComment",
    "PostMedia",
    "Conversations",
    "Messages",
    "Friendship",
    "Friend",
    "Follower",
    "Following",
    "Recommendation",
    "FriendRequest",
    "Stories",
    "MyStories",
  ],
  endpoints: () => ({}),
})
