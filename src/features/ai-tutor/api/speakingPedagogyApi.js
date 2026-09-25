/**
 * API phần sư phạm của buổi luyện nói (TASK-AI-15, lát của Khôi) trên catspeak-ai.
 *
 *   GET  /v1/speaking/sessions/{id}/report          ss10 hỏi định kỳ, ss11 hiện
 *   GET  /v1/speaking/sessions/{id}/pronunciation   ss12 (P1), lần đầu chấm vài giây
 *   GET  /v1/speaking/sessions/{id}/turns/{seq}/audio?start_ms=&end_ms=
 *   POST /v1/speaking/pronunciation/retry           ss12, multipart audio + text
 *   GET  /v1/speaking/sample-audio?text=&rate=slow  ss12, phát âm mẫu chậm
 *   GET  /v1/speaking/pronunciation/videos?ref_code= ss13
 *
 * Tiền tố /v1/speaking được baseApi chuyển sang aiBaseQuery (VITE_AI_API_BASE_URL).
 * Vòng đời phiên (tạo phiên, chủ đề, hạn mức) là phần của Thái, không nằm ở đây.
 *
 * Audio đi qua ai-api dưới dạng bytes và cần JWT, nên không gán thẳng vào
 * <audio src>. getSpeakingAudioUrl tải về rồi trả một blob URL (chuỗi, lưu được
 * trong cache RTK Query) và tự thu hồi khi cache hết hạn.
 */
import { baseApi } from "@/store/api/baseApi"

const api = baseApi.enhanceEndpoints({
  addTagTypes: ["SpeakingReport", "SpeakingPronunciation"],
})

const sid = (id) => encodeURIComponent(id)

export const speakingAudioPath = {
  turn: (sessionId, seq, startMs, endMs) => {
    const q = new URLSearchParams()
    if (startMs != null) q.set("start_ms", String(Math.max(0, Math.round(startMs))))
    if (endMs != null) q.set("end_ms", String(Math.max(0, Math.round(endMs))))
    const qs = q.toString()
    return `/v1/speaking/sessions/${sid(sessionId)}/turns/${seq}/audio${qs ? `?${qs}` : ""}`
  },
  sample: (text, rate = "slow") =>
    `/v1/speaking/sample-audio?text=${encodeURIComponent(text)}&rate=${rate}`,
}

export const speakingPedagogyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSpeakingReport: builder.query({
      query: (sessionId) => `/v1/speaking/sessions/${sid(sessionId)}/report`,
      providesTags: (_r, _e, sessionId) => [{ type: "SpeakingReport", id: sessionId }],
    }),

    getSpeakingPronunciation: builder.query({
      query: ({ sessionId, refresh = false }) =>
        `/v1/speaking/sessions/${sid(sessionId)}/pronunciation${refresh ? "?refresh=true" : ""}`,
      providesTags: (_r, _e, { sessionId }) => [{ type: "SpeakingPronunciation", id: sessionId }],
      // Chấm lần đầu gọi Azure cho cả buổi: giữ kết quả lâu, mở lại modal không chấm lại.
      keepUnusedDataFor: 600,
    }),

    retrySpeakingPronunciation: builder.mutation({
      query: ({ audioBlob, text, previousScore }) => {
        const form = new FormData()
        const ext = audioBlob?.type?.includes("ogg") ? "ogg" : audioBlob?.type?.includes("wav") ? "wav" : "webm"
        form.append("audio", audioBlob, `retry.${ext}`)
        form.append("text", text)
        if (previousScore != null) form.append("previous_score", String(previousScore))
        return { url: "/v1/speaking/pronunciation/retry", method: "POST", body: form }
      },
    }),

    getPronunciationGuide: builder.query({
      query: (refCode) =>
        `/v1/speaking/pronunciation/videos?ref_code=${encodeURIComponent(refCode)}`,
      keepUnusedDataFor: 3600,
    }),

    getSpeakingAudioUrl: builder.query({
      async queryFn(path, _api, _extra, baseQuery) {
        const res = await baseQuery({ url: path, responseHandler: (r) => r.blob() })
        if (res.error) return { error: res.error }
        return { data: URL.createObjectURL(res.data) }
      },
      keepUnusedDataFor: 300,
      async onCacheEntryAdded(_arg, { cacheDataLoaded, cacheEntryRemoved }) {
        try {
          const { data } = await cacheDataLoaded
          await cacheEntryRemoved
          URL.revokeObjectURL(data)
        } catch {
          // truy vấn lỗi thì không có URL nào để thu hồi
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetSpeakingReportQuery,
  useGetSpeakingPronunciationQuery,
  useRetrySpeakingPronunciationMutation,
  useGetPronunciationGuideQuery,
  useLazyGetSpeakingAudioUrlQuery,
} = speakingPedagogyApi

/** Mã lỗi của ai-api nằm ở error.data.detail.errorCode (FastAPI HTTPException). */
export const speakingErrorCode = (error) => error?.data?.detail?.errorCode || null

export const isReportNotReady = (error) =>
  error?.status === 404 && speakingErrorCode(error) === "SPEAKING_REPORT_NOT_READY"
