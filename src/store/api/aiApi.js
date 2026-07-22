import { baseApi } from "./baseApi"

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send a message to public AI
    chatPublicAi: builder.mutation({
      query: (data) => ({
        url: "/conversations/ai/public-ai",
        method: "POST",
        body: data,
      }),
    }),

    // Send a message to private AI
    chatPrivateAi: builder.mutation({
      query: (data) => ({
        url: "/conversations/ai/private-ai",
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const {
  useChatPublicAiMutation,
  useChatPrivateAiMutation,
} = aiApi
