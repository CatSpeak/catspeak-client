import { baseApi } from "@/store/api/baseApi"

export const learningPathApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendar: builder.query({
      query: () => "/learning-path/calendar",
      providesTags: ["LearningPath"],
    }),
    getSessionPreview: builder.query({
      query: (cardId) => `/learning-path/sessions/${cardId}/preview`,
      providesTags: (result, error, cardId) => [
        { type: "LearningPath", id: cardId },
      ],
    }),
    launchSession: builder.mutation({
      query: (cardId) => ({
        url: `/learning-path/sessions/${cardId}/launch`,
        method: "POST",
      }),
      invalidatesTags: ["LearningPath"],
    }),
    abandonSession: builder.mutation({
      query: (cardId) => ({
        url: `/learning-path/sessions/${cardId}/abandon`,
        method: "POST",
      }),
      invalidatesTags: ["LearningPath"],
    }),
    completeSession: builder.mutation({
      query: ({ cardId, score, sessionId, completedAt }) => ({
        url: `/learning-path/sessions/${cardId}/complete`,
        method: "POST",
        body: { score, sessionId, completedAt },
      }),
      invalidatesTags: ["LearningPath"],
    }),
    changeLevel: builder.mutation({
      query: (body) => ({
        url: "/learning-path/level-change",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LearningPath"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCalendarQuery,
  useGetSessionPreviewQuery,
  useLaunchSessionMutation,
  useAbandonSessionMutation,
  useCompleteSessionMutation,
  useChangeLevelMutation,
} = learningPathApi
