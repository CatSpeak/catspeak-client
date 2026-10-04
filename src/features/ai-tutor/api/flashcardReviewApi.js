/**
 * API phiên ôn flashcard (TASK-AI-16, lát của Khôi) trên catspeak-ai.
 *
 *   POST /v1/flashcards/sessions                  mở phiên: { mode, deck_id, session_id_source, timezone }
 *   GET  /v1/flashcards/sessions/{id}             đọc lại phiên đang mở (tải lại trang)
 *   POST /v1/flashcards/sessions/{id}/review      chấm một thẻ (idempotent, server thắng)
 *   POST /v1/flashcards/sessions/{id}/finish      kết thúc, trả số liệu cho fc03
 *
 * Tiền tố /v1/flashcards được baseApi chuyển sang aiBaseQuery (VITE_AI_API_BASE_URL).
 * Trang chủ flashcard và danh mục deck (/v1/flashcards/home, /decks) là phần của
 * Thái, nằm ở file API riêng để hai người không sửa chung một file.
 */
import { baseApi } from "@/store/api/baseApi"

const api = baseApi.enhanceEndpoints({ addTagTypes: ["FlashcardReviewSession"] })

const sid = (id) => encodeURIComponent(id)

export const flashcardReviewApi = api.injectEndpoints({
  endpoints: (builder) => ({
    startFlashcardSession: builder.mutation({
      query: ({ mode = "due", deckId = null, sourceSessionId = null }) => ({
        url: "/v1/flashcards/sessions",
        method: "POST",
        body: {
          mode,
          deck_id: deckId,
          session_id_source: sourceSessionId,
        },
      }),
    }),

    getFlashcardSession: builder.query({
      query: (sessionId) => `/v1/flashcards/sessions/${sid(sessionId)}`,
      providesTags: (_r, _e, sessionId) => [{ type: "FlashcardReviewSession", id: sessionId }],
    }),

    reviewFlashcardCard: builder.mutation({
      query: ({ sessionId, cardId, exerciseType, isCorrect, isOverride = false }) => ({
        url: `/v1/flashcards/sessions/${sid(sessionId)}/review`,
        method: "POST",
        body: {
          card_id: cardId,
          exercise_type: exerciseType,
          is_correct: Boolean(isCorrect),
          is_override: Boolean(isOverride),
        },
      }),
      invalidatesTags: ["FlashcardHome", "FlashcardDecks", { type: "FlashcardDeck" }],
    }),

    finishFlashcardSession: builder.mutation({
      query: (sessionId) => ({
        url: `/v1/flashcards/sessions/${sid(sessionId)}/finish`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, sessionId) => [{ type: "FlashcardReviewSession", id: sessionId }, "FlashcardHome", "FlashcardDecks", { type: "FlashcardDeck" }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useStartFlashcardSessionMutation,
  useLazyGetFlashcardSessionQuery,
  useReviewFlashcardCardMutation,
  useFinishFlashcardSessionMutation,
} = flashcardReviewApi

/** Mã lỗi của ai-api nằm ở error.data.detail.errorCode (FastAPI HTTPException). */
export const flashcardErrorCode = (error) => error?.data?.detail?.errorCode || null
