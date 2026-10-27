import { baseApi } from "@/store/api/baseApi"

const getSpeakingApiError = (error) => {
  const body = error?.data?.detail ?? error?.data
  return {
    message: (typeof body === "string" ? body : body?.message || body?.code || body?.errorCode) || error?.error || "Yêu cầu phòng luyện nói thất bại.",
    status: error?.status,
    code: body?.code || body?.errorCode,
    details: body,
  }
}

export const speakingApi = baseApi.enhanceEndpoints({
  addTagTypes: ["SpeakingSession", "SpeakingQuota", "SpeakingLevel"],
}).injectEndpoints({
  endpoints: (builder) => ({
    getSpeakingTopics: builder.query({
      query: (hskLevel) => ({
        url: `/v1/speaking/topics${hskLevel ? `?hsk_level=${hskLevel}` : ""}`,
      }),
      transformErrorResponse: getSpeakingApiError,
    }),
    getSpeakingQuota: builder.query({
      query: () => "/v1/speaking/quota",
      providesTags: ["SpeakingQuota"],
      transformErrorResponse: getSpeakingApiError,
    }),
    getSpeakingLevel: builder.query({
      query: () => "/v1/speaking/level",
      providesTags: ["SpeakingLevel"],
      transformErrorResponse: getSpeakingApiError,
    }),
    getActiveSpeakingSession: builder.query({
      query: () => "/v1/speaking/sessions/active",
      providesTags: ["SpeakingSession"],
      transformErrorResponse: getSpeakingApiError,
    }),
    getSpeakingSession: builder.query({
      query: (sessionId) => `/v1/speaking/sessions/${encodeURIComponent(sessionId)}`,
      providesTags: ["SpeakingSession"],
      transformErrorResponse: getSpeakingApiError,
    }),
    startSpeakingSession: builder.mutation({
      query: ({ topic_id, hsk_level }) => ({
        url: "/v1/speaking/sessions",
        method: "POST",
        body: { topic_id, hsk_level },
      }),
      transformErrorResponse: getSpeakingApiError,
      invalidatesTags: ["SpeakingSession", "SpeakingQuota", "SpeakingLevel"],
    }),
    reconnectSpeakingSession: builder.mutation({
      query: (sessionId) => ({
        url: `/v1/speaking/sessions/${encodeURIComponent(sessionId)}/reconnect`,
        method: "POST",
      }),
      transformErrorResponse: getSpeakingApiError,
    }),
    endSpeakingSession: builder.mutation({
      query: ({ sessionId, end_reason = "early_finish" }) => ({
        url: `/v1/speaking/sessions/${encodeURIComponent(sessionId)}/end`,
        method: "POST",
        body: { end_reason },
      }),
      transformErrorResponse: getSpeakingApiError,
      invalidatesTags: ["SpeakingSession", "SpeakingQuota"],
    }),
  }),
})

export const {
  useGetSpeakingTopicsQuery,
  useGetSpeakingQuotaQuery,
  useGetSpeakingLevelQuery,
  useGetActiveSpeakingSessionQuery,
  useGetSpeakingSessionQuery,
  useLazyGetSpeakingSessionQuery,
  useStartSpeakingSessionMutation,
  useReconnectSpeakingSessionMutation,
  useEndSpeakingSessionMutation,
} = speakingApi
