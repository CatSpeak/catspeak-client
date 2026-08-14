import { baseApi } from "./baseApi"

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPendingReview: builder.query({
      query: () => "/student/reviews/pending",
      providesTags: ["Reviews"],
    }),
    getReviewContext: builder.query({
      query: (classId) => `/student/reviews/${classId}/context`,
      providesTags: (result, error, classId) => [
        { type: "Reviews", id: classId },
      ],
    }),
    createReview: builder.mutation({
      query: ({ classId, body }) => ({
        url: `/student/reviews/${classId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reviews", "StudentClasses"],
    }),
    getReviewSummary: builder.query({
      query: (classId) => `/student/reviews/${classId}/summary`,
      providesTags: (result, error, classId) => [
        { type: "Reviews", id: classId },
      ],
    }),
    getCompletedClasses: builder.query({
      query: () => "/student/classes/completed",
      providesTags: ["StudentClasses"],
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPendingReviewQuery,
  useGetReviewContextQuery,
  useCreateReviewMutation,
  useGetReviewSummaryQuery,
  useGetCompletedClassesQuery,
} = reviewApi
