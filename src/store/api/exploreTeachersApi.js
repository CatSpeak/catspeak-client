import { baseApi } from "./baseApi"

export const exploreTeachersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExploreTeachers: builder.query({
      query: (params) => ({
        url: "/explore/teachers",
        method: "GET",
        params: {
          page: params?.page || 1,
          pageSize: params?.pageSize || 6,
          search: params?.search ? params.search.trim() : undefined,
          language:
            params?.language && params.language !== "all"
              ? params.language
              : undefined,
          sort:
            params?.sort && params.sort !== "default"
              ? params.sort
              : undefined,
        },
      }),
      providesTags: ["ExploreTeachers"],
    }),

    getExploreTeacherDetail: builder.query({
      query: (slugOrId) => ({
        url: `/explore/teachers/${encodeURIComponent(slugOrId)}`,
        method: "GET",
      }),
      providesTags: (result, error, slugOrId) => [
        { type: "ExploreTeachers", id: slugOrId },
      ],
    }),

    getExploreTeacherCompetency: builder.query({
      query: (slugOrId) => ({
        url: `/explore/teachers/${encodeURIComponent(slugOrId)}/competency`,
        method: "GET",
      }),
      providesTags: (result, error, slugOrId) => [
        { type: "ExploreTeachers", id: `competency-${slugOrId}` },
      ],
    }),

    getExploreTeacherReviews: builder.query({
      query: ({ slugOrId, ...params }) => ({
        url: `/explore/teachers/${encodeURIComponent(slugOrId)}/reviews`,
        method: "GET",
        params: {
          stars: params?.stars && params.stars !== 0 ? params.stars : undefined,
          sort: params?.sort && params.sort !== "newest" ? params.sort : undefined,
          keyword: params?.keyword ? params.keyword.trim() : undefined,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10,
        },
      }),
      providesTags: (result, error, arg) => [
        { type: "ExploreTeachers", id: `reviews-${arg?.slugOrId}` },
      ],
    }),

    getExploreTeacherClasses: builder.query({
      query: (slugOrId) => ({
        url: `/explore/teachers/${encodeURIComponent(slugOrId)}/classes`,
        method: "GET",
      }),
      providesTags: (result, error, slugOrId) => [
        { type: "ExploreTeachers", id: `classes-${slugOrId}` },
      ],
    }),
  }),
})

export const {
  useGetExploreTeachersQuery,
  useGetExploreTeacherDetailQuery,
  useGetExploreTeacherCompetencyQuery,
  useGetExploreTeacherReviewsQuery,
  useGetExploreTeacherClassesQuery,
} = exploreTeachersApi
