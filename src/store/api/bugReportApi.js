import { baseApi } from "./baseApi"

export const bugReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitBugReport: builder.mutation({
      query: (body) => ({
        url: "/bug-reports",
        method: "POST",
        body,
      }),
    }),
    uploadBugScreenshot: builder.mutation({
      query: (formData) => ({
        url: "/bug-reports/upload-screenshot",
        method: "POST",
        body: formData,
      }),
    }),
  }),
})

export const {
  useSubmitBugReportMutation,
  useUploadBugScreenshotMutation,
} = bugReportApi
