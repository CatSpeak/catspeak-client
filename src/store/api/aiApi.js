import { baseApi } from "./baseApi"

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send a message to public AI
    chatPublicAi: builder.mutation({
      query: (data) => ({
        url: "/room-chat/public",
        method: "POST",
        body: data,
      }),
    }),

    // Send a message to private AI
    chatPrivateAi: builder.mutation({
      query: (data) => ({
        url: "/room-chat/private",
        method: "POST",
        body: data,
      }),
    }),

    // Get room chat quota state
    getRoomChatQuota: builder.query({
      query: (tier) => ({
        url: `/room-chat/quota${tier ? `?tier=${encodeURIComponent(tier)}` : ""}`,
        method: "GET",
      }),
    }),
  }),
})

export const {
  useChatPublicAiMutation,
  useChatPrivateAiMutation,
  useGetRoomChatQuotaQuery,
} = aiApi

