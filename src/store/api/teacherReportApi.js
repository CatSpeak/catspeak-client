import { baseApi } from "./baseApi"

export const teacherReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitTeacherReport: builder.mutation({
      query: (data) => ({
        url: "/TeacherReport",
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const { useSubmitTeacherReportMutation } = teacherReportApi
