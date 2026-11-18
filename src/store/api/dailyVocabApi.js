import { baseApi } from "./baseApi"

export const dailyVocabApi = baseApi
  .enhanceEndpoints({
    addTagTypes: ["DailyVocabulary"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getDailyVocabulary: builder.query({
        query: (lang = "en") => ({
          url: "/v1/daily-vocabulary",
          method: "GET",
          params: { lang },
        }),
        providesTags: ["DailyVocabulary"],
      }),
      markVocabKnown: builder.mutation({
        query: ({ bankId, lang = "en" }) => ({
          url: `/v1/daily-vocabulary/${bankId}/known`,
          method: "POST",
          params: { lang },
        }),
        invalidatesTags: ["DailyVocabulary"],
      }),
      saveDailyVocab: builder.mutation({
        query: (bankVocabularyId) => ({
          url: "/v1/daily-vocabulary/save",
          method: "POST",
          body: { bankVocabularyId },
        }),
        invalidatesTags: ["DailyVocabulary", "Vocabulary", "FlashcardHome"],
      }),
      submitVocabReview: builder.mutation({
        query: ({ vocabularyId, action }) => ({
          url: "/v1/daily-vocabulary/review",
          method: "POST",
          body: { vocabularyId, action },
        }),
        invalidatesTags: ["DailyVocabulary"],
      }),
    }),
  })

export const {
  useGetDailyVocabularyQuery,
  useMarkVocabKnownMutation,
  useSaveDailyVocabMutation,
  useSubmitVocabReviewMutation,
} = dailyVocabApi
