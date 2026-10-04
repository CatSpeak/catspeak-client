import { baseApi } from "@/store/api/baseApi"

const getFlashcardApiError = (error) => {
  const body = error?.data?.detail ?? error?.data
  return {
    message:
      (typeof body === "string"
        ? body
        : body?.message || body?.code || body?.errorCode) ||
      error?.error ||
      "Yêu cầu dữ liệu sổ từ vựng thất bại.",
    status: error?.status,
    code: body?.code || body?.errorCode,
    details: body,
  }
}

export const flashcardApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["FlashcardHome", "FlashcardDecks", "FlashcardDeck"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getFlashcardHome: builder.query({
        query: () => "/v1/flashcards/home",
        providesTags: ["FlashcardHome"],
        transformErrorResponse: getFlashcardApiError,
      }),
      getFlashcardDecks: builder.query({
        query: () => "/v1/flashcards/decks",
        providesTags: ["FlashcardDecks"],
        transformErrorResponse: getFlashcardApiError,
      }),
      getDeckCards: builder.query({
        query: ({ deckId, limit = 20, cursor = null }) => ({
          url: `/v1/flashcards/decks/${encodeURIComponent(deckId)}/cards`,
          params: { limit, ...(cursor ? { cursor } : {}) },
        }),
        providesTags: (_r, _e, { deckId }) => [{ type: "FlashcardDeck", id: deckId }],
        transformErrorResponse: getFlashcardApiError,
      }),
    }),
  })

export const {
  useGetFlashcardHomeQuery,
  useGetFlashcardDecksQuery,
  useGetDeckCardsQuery,
} = flashcardApi
