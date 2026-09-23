import { baseApi } from "./baseApi"

/**
 * Build a FormData object from text fields and file fields.
 * Skips null/undefined values so only provided fields are sent.
 */
export function buildInstructorFormData({
  fullName,
  email,
  address,
  phoneNumber,
  nationality,
  dateOfBirth,
  languagesTeach,
  nativeLanguage,
  introduction,
  idCardFront,
  idCardBack,
  credentials,
  introVideo,
  introVideoUrl,
  removeIntroVideo,
  taskId,
  otpCode,
}) {
  const fd = new FormData()

  if (taskId) fd.append("TaskId", taskId)

  // Text fields
  if (fullName) fd.append("FullName", fullName)
  if (email) fd.append("Email", email)
  if (address) fd.append("Address", address)
  if (phoneNumber) fd.append("PhoneNumber", phoneNumber)
  if (nationality) fd.append("Nationality", nationality)
  if (dateOfBirth) fd.append("DateOfBirth", dateOfBirth)
  if (nativeLanguage) fd.append("NativeLanguage", nativeLanguage)
  if (introduction) fd.append("Introduction", introduction)

  // LanguagesTeach is sent as a JSON string
  if (languagesTeach) {
    fd.append(
      "LanguagesTeach",
      typeof languagesTeach === "string"
        ? languagesTeach
        : JSON.stringify(languagesTeach),
    )
  }

  // File fields
  if (idCardFront instanceof File) fd.append("IdCardFront", idCardFront)
  if (idCardBack instanceof File) fd.append("IdCardBack", idCardBack)

  // Credentials: keep existing URLs + append newly selected files.
  // The backend merges CredentialUrls + Credentials instead of replacing.
  if (Array.isArray(credentials)) {
    let sentUrlCount = 0
    credentials.forEach((item) => {
      if (item instanceof File) fd.append("Credentials", item)
      else if (typeof item === "string" && item) {
        fd.append("CredentialUrls", item)
        sentUrlCount += 1
      }
    })
    // Signal an explicitly-empty list (teacher removed every certificate) so the
    // backend does not fall back to the stored list.
    if (sentUrlCount === 0) fd.append("CredentialUrls", "")
  }

  if (introVideo instanceof File) fd.append("IntroVideo", introVideo)
  else if (typeof introVideo === "string" && introVideo) fd.append("IntroVideoUrl", introVideo)
  else if (typeof introVideoUrl === "string" && introVideoUrl) fd.append("IntroVideoUrl", introVideoUrl)
  if (removeIntroVideo === true) fd.append("RemoveIntroVideo", "true")
  if (otpCode) fd.append("OtpCode", otpCode)

  return fd
}

export const instructorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInstructorProfile: builder.query({
      query: () => ({
        url: "/InstructorProfile/my",
        method: "GET",
      }),
      providesTags: ["InstructorProfile"],
    }),

    applyInstructor: builder.mutation({
      query: (data) => ({
        url: "/InstructorProfile/apply",
        method: "POST",
        body: data instanceof FormData ? data : buildInstructorFormData(data),
        // Let the browser set the Content-Type with boundary
        formData: true,
      }),
      invalidatesTags: ["InstructorProfile"],
    }),

    updateInstructorProfile: builder.mutation({
      query: (data) => ({
        url: "/InstructorProfile/my",
        method: "PUT",
        body: data instanceof FormData ? data : buildInstructorFormData(data),
        formData: true,
      }),
      invalidatesTags: ["InstructorProfile"],
    }),

    updateInstructorBasicInfo: builder.mutation({
      query: (body) => ({
        url: "/InstructorProfile/my/basic-info",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["InstructorProfile"],
    }),

    updateInstructorIdCard: builder.mutation({
      query: (formData) => ({
        url: "/InstructorProfile/my/id-card",
        method: "PUT",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["InstructorProfile"],
    }),

    replaceInstructorIntroVideo: builder.mutation({
      query: (formData) => ({
        url: "/InstructorProfile/my/intro-video",
        method: "PUT",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["InstructorProfile"],
    }),

    removeInstructorIntroVideo: builder.mutation({
      query: () => ({
        url: "/InstructorProfile/my/intro-video",
        method: "DELETE",
      }),
      invalidatesTags: ["InstructorProfile"],
    }),

    getLanguageRequests: builder.query({
      query: () => ({
        url: "/InstructorProfile/language-requests",
        method: "GET",
      }),
      providesTags: ["LanguageRequests"],
    }),

    getLanguageRequestDetail: builder.query({
      query: (id) => ({
        url: `/InstructorProfile/language-requests/${id}`,
        method: "GET",
      }),
      providesTags: ["LanguageRequests"],
    }),

    deleteLanguageRequest: builder.mutation({
      query: (id) => ({
        url: `/InstructorProfile/language-requests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LanguageRequests"],
    }),

    getInstructorLanguages: builder.query({
      query: () => ({
        url: "/InstructorProfile/languages",
        method: "GET",
      }),
    }),

    getInstructorLanguageLevels: builder.query({
      query: (languageId) => ({
        url: `/InstructorProfile/languages/${languageId}/levels`,
        method: "GET",
      }),
    }),

    submitLanguageRequest: builder.mutation({
      query: (formData) => ({
        url: "/InstructorProfile/language-requests",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["LanguageRequests"],
    }),

    getHonoredInstructors: builder.query({
      query: (params) => {
        const limit = typeof params === "number" ? params : params?.limit
        return {
          url: "/v1/Instructors/honored",
          method: "GET",
          params: limit ? { limit } : undefined,
          extraOptions: { skipAuthHeader: true },
        }
      },
      providesTags: ["HonoredInstructors"],
    }),

    getInstructorCompetency: builder.query({
      query: () => ({
        url: "/InstructorProfile/my/competency",
        method: "GET",
      }),
      providesTags: ["InstructorCompetency"],
    }),

    updateInstructorCompetency: builder.mutation({
      query: (body) => ({
        url: "/InstructorProfile/my/competency",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["InstructorCompetency", "InstructorProfile"],
    }),
  }),
})

export const {
  useGetInstructorProfileQuery,
  useApplyInstructorMutation,
  useUpdateInstructorProfileMutation,
  useUpdateInstructorBasicInfoMutation,
  useUpdateInstructorIdCardMutation,
  useReplaceInstructorIntroVideoMutation,
  useRemoveInstructorIntroVideoMutation,
  useGetLanguageRequestsQuery,
  useGetLanguageRequestDetailQuery,
  useDeleteLanguageRequestMutation,
  useGetInstructorLanguagesQuery,
  useGetInstructorLanguageLevelsQuery,
  useSubmitLanguageRequestMutation,
  useGetHonoredInstructorsQuery,
  useGetInstructorCompetencyQuery,
  useUpdateInstructorCompetencyMutation,
} = instructorApi
