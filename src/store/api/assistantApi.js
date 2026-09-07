import { baseApi } from "./baseApi"

export const assistantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startAssistant: builder.mutation({
      query: ({ sessionId }) => ({
        url: "/livekit/assistant/start",
        method: "POST",
        body: { sessionId },
      }),
      transformResponse: (res) => ({
        dispatchId: res.dispatchId ?? res.dispatch_id,
      }),
    }),

    stopAssistant: builder.mutation({
      query: ({ sessionId, dispatchId }) => ({
        url: "/livekit/assistant/stop",
        method: "POST",
        body: { sessionId, dispatchId },
      }),
    }),

    getAssistantStatus: builder.query({
      query: (sessionId) => `/livekit/assistant/status/${sessionId}`,
      transformResponse: (res) => ({
        active: res.active,
        dispatchId: res.dispatchId ?? res.dispatch_id,
      }),
    }),
  }),
})

export const {
  useStartAssistantMutation,
  useStopAssistantMutation,
  useGetAssistantStatusQuery,
} = assistantApi
