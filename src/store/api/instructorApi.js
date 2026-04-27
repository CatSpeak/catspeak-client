import { baseApi } from "./baseApi"

/**
 * Build a FormData object from text fields and file fields.
 * Skips null/undefined values so only provided fields are sent.
 */
function buildInstructorFormData({
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
}) {
  const fd = new FormData()

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
        body: buildInstructorFormData(data),
        // Let the browser set the Content-Type with boundary
        formData: true,
      }),
      invalidatesTags: ["InstructorProfile"],
    }),

    updateInstructorProfile: builder.mutation({
      query: (data) => ({
        url: "/InstructorProfile/my",
        method: "PUT",
        body: buildInstructorFormData(data),
        formData: true,
      }),
      invalidatesTags: ["InstructorProfile"],
    }),
  }),
})

export const {
  useGetInstructorProfileQuery,
  useApplyInstructorMutation,
  useUpdateInstructorProfileMutation,
} = instructorApi
