import { baseApi } from "./baseApi"

export const subtitlesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startSubtitles: builder.mutation({
      query: ({ sessionId, language }) => ({
        url: "/livekit/subtitles/start",
        method: "POST",
        body: { sessionId, language },
      }),
      // response: { dispatch_id, language, supported_languages }
      transformResponse: (res) => ({
        dispatchId: res.dispatch_id ?? res.dispatchId,
        language: res.language,
        supportedLanguages: res.supported_languages ?? res.supportedLanguages ?? [],
      }),
    }),

    stopSubtitles: builder.mutation({
      query: ({ sessionId, dispatchId }) => ({
        url: "/livekit/subtitles/stop",
        method: "POST",
        body: { sessionId, dispatchId },
      }),
    }),

    getSubtitleStatus: builder.query({
      query: (sessionId) => `/livekit/subtitles/status/${sessionId}`,
      transformResponse: (res) => ({
        active: res.active,
        dispatchId: res.dispatch_id ?? res.dispatchId,
        supportedLanguages: res.supported_languages ?? res.supportedLanguages ?? [],
      }),
    }),
  }),
})

export const {
  useStartSubtitlesMutation,
  useStopSubtitlesMutation,
  useGetSubtitleStatusQuery,
} = subtitlesApi
