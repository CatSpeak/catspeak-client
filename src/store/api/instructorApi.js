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

  if (Array.isArray(credentials)) {
    credentials.forEach((file) => {
      if (file instanceof File) fd.append("Credentials", file)
    })
  }

  if (introVideo instanceof File) fd.append("IntroVideo", introVideo)
  else if (typeof introVideo === "string" && introVideo) fd.append("IntroVideoUrl", introVideo)
  else if (typeof introVideoUrl === "string" && introVideoUrl) fd.append("IntroVideoUrl", introVideoUrl)
  if (removeIntroVideo === true) fd.append("RemoveIntroVideo", "true")
  if (otpCode) fd.append("OtpCode", otpCode)

  return fd
}

/**
 * Build a FormData object with teaching-only fields (Approved-teacher updates).
 * No personal fields, no OTP — the live profile keeps serving meanwhile.
 */
export function buildTeachingFormData({
  languagesTeach,
  nativeLanguage,
  introduction,
  credentials,
  introVideo,
  introVideoUrl,
  removeIntroVideo,
}) {
  const fd = new FormData()

  if (nativeLanguage) fd.append("NativeLanguage", nativeLanguage)
  if (introduction) fd.append("Introduction", introduction)

  if (languagesTeach) {
    fd.append(
      "LanguagesTeach",
      typeof languagesTeach === "string"
        ? languagesTeach
        : JSON.stringify(languagesTeach),
    )
  }

  if (Array.isArray(credentials)) {
    credentials.forEach((file) => {
      if (file instanceof File) fd.append("Credentials", file)
    })
  }

  if (introVideo instanceof File) fd.append("IntroVideo", introVideo)
  else if (typeof introVideo === "string" && introVideo) fd.append("IntroVideoUrl", introVideo)
  else if (typeof introVideoUrl === "string" && introVideoUrl) fd.append("IntroVideoUrl", introVideoUrl)
  if (removeIntroVideo === true) fd.append("RemoveIntroVideo", "true")

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

    getPendingTeachingUpdate: builder.query({
      query: () => ({
        url: "/InstructorProfile/my/teaching-update",
        method: "GET",
      }),
      providesTags: ["TeachingUpdate"],
    }),

    submitTeachingUpdate: builder.mutation({
      query: (data) => ({
        url: "/InstructorProfile/my/teaching",
        method: "PUT",
        body: data instanceof FormData ? data : buildTeachingFormData(data),
        formData: true,
      }),
      invalidatesTags: ["TeachingUpdate"],
    }),

    cancelTeachingUpdate: builder.mutation({
      query: () => ({
        url: "/InstructorProfile/my/teaching-update",
        method: "DELETE",
      }),
      invalidatesTags: ["TeachingUpdate"],
    }),

    updateIdentityDocuments: builder.mutation({
      query: (data) => {
        const body = data instanceof FormData ? data : (() => {
          const fd = new FormData()
          if (data?.idCardFront instanceof File) fd.append("IdCardFront", data.idCardFront)
          if (data?.idCardBack instanceof File) fd.append("IdCardBack", data.idCardBack)
          if (data?.otpCode) fd.append("OtpCode", data.otpCode)
          return fd
        })()
        return {
          url: "/InstructorProfile/my/identity",
          method: "PUT",
          body,
          formData: true,
        }
      },
      invalidatesTags: ["InstructorProfile"],
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
  }),
})

export const {
  useGetInstructorProfileQuery,
  useApplyInstructorMutation,
  useUpdateInstructorProfileMutation,
  useGetPendingTeachingUpdateQuery,
  useSubmitTeachingUpdateMutation,
  useCancelTeachingUpdateMutation,
  useUpdateIdentityDocumentsMutation,
  useGetHonoredInstructorsQuery,
} = instructorApi
