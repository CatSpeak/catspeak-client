import { baseApi } from "@/store/api/baseApi"

/**
 * API chấm thẻ FSRS cho Practice (FE-05 S2 <-> BE-02). Tiền tố /v1/flashcards đi qua
 * aiBaseQuery như các API sổ từ vựng khác.
 *
 *   POST /v1/flashcards/cards/{card_id}/grade
 *   body {
 *     client_review_id: string   // uuid sinh ở FE, server dùng để chống ghi trùng (gửi lặp/offline)
 *     rating: 1|2|3|4            // Again | Hard | Good | Easy
 *     mode: "word"|"listen"|"flashcard"
 *     is_correct: boolean
 *     elapsed_ms: number         // thời gian trả lời, đã trừ lúc tab bị ẩn
 *     hints_used: number
 *     reviewed_at: ISO string    // thời điểm chấm thật ở máy học viên (gửi bù offline vẫn đúng)
 *   }
 *   200 { card_id, due_at, scheduled_days, state, stability }
 *
 * Hợp đồng này cần thống nhất với Thiện trước khi BE-02 chốt; đổi tên trường chỉ cần sửa file này.
 */
export const practiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    gradePracticeCard: builder.mutation({
      query: ({ cardId, clientReviewId, rating, mode, isCorrect, elapsedMs, hintsUsed, reviewedAt }) => ({
        url: `/v1/flashcards/cards/${encodeURIComponent(cardId)}/grade`,
        method: "POST",
        body: {
          client_review_id: clientReviewId,
          rating,
          mode,
          is_correct: Boolean(isCorrect),
          elapsed_ms: Math.max(0, Math.round(elapsedMs || 0)),
          hints_used: hintsUsed || 0,
          reviewed_at: reviewedAt,
        },
      }),
      invalidatesTags: ["FlashcardHome", "FlashcardDecks", "FlashcardDeck"],
    }),
  }),
  overrideExisting: false,
})

export const { useGradePracticeCardMutation } = practiceApi
