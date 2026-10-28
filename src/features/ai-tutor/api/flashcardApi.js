import { baseApi } from "@/store/api/baseApi"

/**
 * API sổ flashcard ngoài phiên ôn (catspeak-ai, TASK-AI-16).
 *
 *   GET    /v1/flashcards/home                    fc01
 *   GET    /v1/flashcards/decks                   fc04: deck hệ thống + chủ đề
 *   GET    /v1/flashcards/decks/{id}/cards        fc05: duyệt (search, status, cursor)
 *   GET    /v1/flashcards/lookup?word=            fc09: tra từ
 *   POST   /v1/flashcards/cards                   fc09: thêm tay
 *   POST   /v1/flashcards/cards/{id}/known        fc11: Đã biết rồi
 *   DELETE /v1/flashcards/cards/{id}              fc11: xoá
 *   POST   /v1/flashcards/cards/{id}/restore      fc11: hoàn tác
 *   PUT    /v1/flashcards/cards/{id}/folders      thêm vào thư mục
 *   GET|POST|PATCH|DELETE /v1/flashcards/folders  thư mục tự tạo
 *   GET    /v1/flashcards/drill/status            luyện phát âm có dùng được không
 */
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

const LIBRARY_TAGS = ["FlashcardHome", "FlashcardDecks", "FlashcardDeck", "FlashcardFolders"]

export const flashcardApi = baseApi
  .enhanceEndpoints({
    addTagTypes: [...LIBRARY_TAGS, "FlashcardDrill"],
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
        query: ({ deckId, limit = 20, cursor = null, search = "", status = null }) => ({
          url: `/v1/flashcards/decks/${encodeURIComponent(deckId)}/cards`,
          params: {
            limit,
            ...(cursor ? { cursor } : {}),
            ...(search ? { search } : {}),
            ...(status ? { status } : {}),
          },
        }),
        providesTags: (_r, _e, { deckId }) => [{ type: "FlashcardDeck", id: deckId }, "FlashcardDeck"],
        transformErrorResponse: getFlashcardApiError,
      }),
      lookupFlashcardWord: builder.query({
        query: (word) => ({ url: "/v1/flashcards/lookup", params: { word } }),
        transformErrorResponse: getFlashcardApiError,
      }),
      addFlashcardCard: builder.mutation({
        query: (body) => ({ url: "/v1/flashcards/cards", method: "POST", body }),
        invalidatesTags: LIBRARY_TAGS,
        transformErrorResponse: getFlashcardApiError,
      }),
      setFlashcardKnown: builder.mutation({
        query: ({ cardId, known }) => ({
          url: `/v1/flashcards/cards/${cardId}/known`,
          method: "POST",
          body: { known },
        }),
        invalidatesTags: LIBRARY_TAGS,
        transformErrorResponse: getFlashcardApiError,
      }),
      deleteFlashcardCard: builder.mutation({
        query: (cardId) => ({ url: `/v1/flashcards/cards/${cardId}`, method: "DELETE" }),
        invalidatesTags: LIBRARY_TAGS,
        transformErrorResponse: getFlashcardApiError,
      }),
      restoreFlashcardCard: builder.mutation({
        query: (cardId) => ({ url: `/v1/flashcards/cards/${cardId}/restore`, method: "POST" }),
        invalidatesTags: LIBRARY_TAGS,
        transformErrorResponse: getFlashcardApiError,
      }),
      setFlashcardCardFolders: builder.mutation({
        query: ({ cardId, folderIds }) => ({
          url: `/v1/flashcards/cards/${cardId}/folders`,
          method: "PUT",
          body: { folder_ids: folderIds },
        }),
        invalidatesTags: ["FlashcardFolders", "FlashcardDeck"],
        transformErrorResponse: getFlashcardApiError,
      }),
      getFlashcardFolders: builder.query({
        query: () => "/v1/flashcards/folders",
        providesTags: ["FlashcardFolders"],
        transformErrorResponse: getFlashcardApiError,
      }),
      createFlashcardFolder: builder.mutation({
        query: (name) => ({ url: "/v1/flashcards/folders", method: "POST", body: { name } }),
        invalidatesTags: ["FlashcardFolders"],
        transformErrorResponse: getFlashcardApiError,
      }),
      renameFlashcardFolder: builder.mutation({
        query: ({ folderId, name }) => ({
          url: `/v1/flashcards/folders/${folderId}`,
          method: "PATCH",
          body: { name },
        }),
        invalidatesTags: ["FlashcardFolders"],
        transformErrorResponse: getFlashcardApiError,
      }),
      deleteFlashcardFolder: builder.mutation({
        query: (folderId) => ({ url: `/v1/flashcards/folders/${folderId}`, method: "DELETE" }),
        invalidatesTags: ["FlashcardFolders", "FlashcardDeck"],
        transformErrorResponse: getFlashcardApiError,
      }),
      getFlashcardDrillStatus: builder.query({
        query: () => "/v1/flashcards/drill/status",
        providesTags: ["FlashcardDrill"],
        transformErrorResponse: getFlashcardApiError,
      }),
    }),
  })

export const {
  useGetFlashcardHomeQuery,
  useGetFlashcardDecksQuery,
  useGetDeckCardsQuery,
  useLazyLookupFlashcardWordQuery,
  useAddFlashcardCardMutation,
  useSetFlashcardKnownMutation,
  useDeleteFlashcardCardMutation,
  useRestoreFlashcardCardMutation,
  useSetFlashcardCardFoldersMutation,
  useGetFlashcardFoldersQuery,
  useCreateFlashcardFolderMutation,
  useRenameFlashcardFolderMutation,
  useDeleteFlashcardFolderMutation,
  useGetFlashcardDrillStatusQuery,
} = flashcardApi

/** Lỗi do mất mạng (RTK Query trả FETCH_ERROR khi fetch không tới được máy chủ). */
export const isNetworkError = (error) =>
  error?.status === "FETCH_ERROR" || error?.status === "TIMEOUT_ERROR"
