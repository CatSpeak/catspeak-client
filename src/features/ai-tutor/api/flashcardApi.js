import { baseApi } from "@/store/api/baseApi"
import { MOCK_FLASHCARD_HOME, MOCK_DECKS } from "@/store/api/flashcardMocks"

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
    addTagTypes: ["FlashcardHome", "FlashcardDecks"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getFlashcardHome: builder.query({
        query: () => "/v1/flashcards/home",
        providesTags: ["FlashcardHome"],
        transformResponse: (response) => response || MOCK_FLASHCARD_HOME,
        transformErrorResponse: getFlashcardApiError,
      }),
      getFlashcardDecks: builder.query({
        query: () => "/v1/flashcards/decks",
        providesTags: ["FlashcardDecks"],
        transformResponse: (response) => response || MOCK_DECKS,
        transformErrorResponse: getFlashcardApiError,
      }),
      getDeckCards: builder.query({
        query: ({ deckId, limit = 20, cursor = null }) => ({
          url: `/v1/flashcards/decks/${encodeURIComponent(deckId)}/cards`,
          params: { limit, ...(cursor ? { cursor } : {}) },
        }),
        transformErrorResponse: getFlashcardApiError,
      }),
    }),
  })

export const {
  useGetFlashcardHomeQuery,
  useGetFlashcardDecksQuery,
  useGetDeckCardsQuery,
} = flashcardApi
