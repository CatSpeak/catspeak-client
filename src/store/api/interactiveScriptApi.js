import { baseApi } from "./baseApi"

export const interactiveScriptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRandomScript: builder.query({
      query: ({ languageCommunity, currentScriptId }) => {
        const params = { languageCommunity };
        if (currentScriptId) params.currentScriptId = currentScriptId;
        return {
          url: "/interactive-script/random",
          method: "GET",
          params,
        };
      },
      // Keep script cached but allow refetch
      providesTags: ["InteractiveScript"],
    }),

    getScriptTranslation: builder.query({
      query: ({ id, targetLanguage }) => ({
        url: `/interactive-script/${id}/translation`,
        method: "GET",
        params: { targetLanguage },
      }),
    }),

    lookupWord: builder.query({
      query: ({ word, sourceLanguage, targetLanguage, scriptId }) => ({
        url: "/interactive-dictionary/lookup",
        method: "GET",
        params: { word, sourceLanguage, targetLanguage, scriptId },
      }),
    }),

    saveVocabulary: builder.mutation({
      query: (body) => ({
        url: "/interactive-vocabulary",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vocabulary"],
    }),

    getVocabularies: builder.query({
      query: (params) => ({
        url: "/interactive-vocabulary",
        method: "GET",
        params,
      }),
      providesTags: ["Vocabulary"],
    }),

    deleteVocabulary: builder.mutation({
      query: (id) => ({
        url: `/interactive-vocabulary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vocabulary"],
    }),

    contributeDefinition: builder.mutation({
      query: (body) => ({
        url: "/student/dictionary/contribute",
        method: "POST",
        body,
      }),
    }),

    reportTranslationError: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/student/script/${id}/report`,
        method: "POST",
        body,
      }),
    }),
  }),
})

export const {
  useGetRandomScriptQuery,
  useLazyGetRandomScriptQuery,
  useGetScriptTranslationQuery,
  useLazyGetScriptTranslationQuery,
  useLookupWordQuery,
  useLazyLookupWordQuery,
  useSaveVocabularyMutation,
  useGetVocabulariesQuery,
  useDeleteVocabularyMutation,
  useContributeDefinitionMutation,
  useReportTranslationErrorMutation,
} = interactiveScriptApi
