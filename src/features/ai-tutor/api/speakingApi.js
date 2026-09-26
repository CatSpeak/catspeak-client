import { baseApi } from "@/store/api/baseApi"

const getSpeakingApiError = (error) => {
  const body = error?.data?.detail ?? error?.data
  return {
    message: (typeof body === "string" ? body : body?.message || body?.code) || error?.error || "Yêu cầu phòng luyện nói thất bại.",
    status: error?.status,
    code: body?.code,
    details: body,
  }
}

export const speakingApi = baseApi.enhanceEndpoints({
  addTagTypes: ["SpeakingSession", "SpeakingQuota", "SpeakingLevel"],
}).injectEndpoints({
  endpoints: (builder) => ({
    getSpeakingTopics: builder.query({
      query: (hskLevel) => ({
        url: `speaking/topics${hskLevel ? `?hsk_level=${hskLevel}` : ""}`,
      }),
      transformErrorResponse: getSpeakingApiError,
    }),
    getSpeakingQuota: builder.query({
      query: () => "speaking/quota",
      providesTags: ["SpeakingQuota"],
      transformErrorResponse: getSpeakingApiError,
    }),
    getSpeakingLevel: builder.query({
      query: () => "speaking/level",
      providesTags: ["SpeakingLevel"],
      transformErrorResponse: getSpeakingApiError,
    }),
    getActiveSpeakingSession: builder.query({
      query: () => "speaking/sessions/active",
      providesTags: ["SpeakingSession"],
      transformErrorResponse: getSpeakingApiError,
    }),
    getSpeakingSession: builder.query({
      query: (sessionId) => `speaking/sessions/${encodeURIComponent(sessionId)}`,
      providesTags: ["SpeakingSession"],
      transformErrorResponse: getSpeakingApiError,
    }),
    getSpeakingReport: builder.query({
      query: (sessionId) => `speaking/sessions/${encodeURIComponent(sessionId)}/report`,
      transformErrorResponse: getSpeakingApiError,
    }),
    startSpeakingSession: builder.mutation({
      query: ({ topic_id, hsk_level }) => ({
        url: "speaking/sessions",
        method: "POST",
        body: { topic_id, hsk_level },
      }),
      transformErrorResponse: getSpeakingApiError,
      invalidatesTags: ["SpeakingSession", "SpeakingQuota", "SpeakingLevel"],
    }),
    reconnectSpeakingSession: builder.mutation({
      query: (sessionId) => ({
        url: `speaking/sessions/${encodeURIComponent(sessionId)}/reconnect`,
        method: "POST",
      }),
      transformErrorResponse: getSpeakingApiError,
    }),
    endSpeakingSession: builder.mutation({
      query: ({ sessionId, end_reason = "learner_quit", duration_ms }) => ({
        url: `speaking/sessions/${encodeURIComponent(sessionId)}/end`,
        method: "POST",
        body: { end_reason, duration_ms },
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
  useGetSpeakingReportQuery,
  useStartSpeakingSessionMutation,
  useReconnectSpeakingSessionMutation,
  useEndSpeakingSessionMutation,
} = speakingApi
