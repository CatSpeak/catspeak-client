import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => ({
        url: "/user-profile",
        method: "GET",
      }),
      providesTags: ["UserProfile"],
    }),
    getUserProfileHaveAccountType: builder.query({
      query: () => ({
        url: "/Account/profile",
        method: "GET",
      }),
      providesTags: ["UserProfile"],
    }),
    getPublicProfile: builder.query({
      query: (accountId) => ({
        url: `/Account/${accountId}`,
        method: "GET",
      }),
      providesTags: (result, error, accountId) => [
        { type: "PublicProfile", id: accountId },
      ],
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: "/user-profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserProfile", "User", "PublicProfile"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/user-profile/change-password",
        method: "PUT",
        body: data,
      }),
    }),
    requestUserProfileOtp: builder.mutation({
      query: (body) => ({
        url: "/user-profile/request-otp",
        method: "POST",
        body,
      }),
    }),
    updateSecurityProfile: builder.mutation({
      query: (data) => {
        const body = data instanceof FormData ? data : (() => {
          const fd = new FormData()
          if (data?.email) fd.append("Email", data.email)
          if (data?.phoneNumber) fd.append("PhoneNumber", data.phoneNumber)
          if (data?.idCardFront instanceof File) fd.append("IdCardFront", data.idCardFront)
          if (data?.idCardBack instanceof File) fd.append("IdCardBack", data.idCardBack)
          if (data?.otpCode) fd.append("OtpCode", data.otpCode)
          return fd
        })()
        return {
          url: "/user-profile/security",
          method: "PUT",
          body,
          formData: true,
        }
      },
      invalidatesTags: ["UserProfile", "User", "PublicProfile", "InstructorProfile"],
    }),
    getCurrentBackground: builder.query({
      query: () => ({
        url: "/user-profile/backgrounds/current",
        method: "GET",
      }),
      providesTags: ["Background"],
    }),
    getSampleBackgrounds: builder.query({
      query: () => ({
        url: "/user-profile/backgrounds/samples",
        method: "GET",
      }),
      providesTags: ["Background"],
    }),
    uploadCustomBackground: builder.mutation({
      query: (formData) => ({
        url: "/user-profile/backgrounds/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Background"],
    }),
    setActiveBackground: builder.mutation({
      query: (body) => ({
        url: "/user-profile/backgrounds/active",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["UserProfile", "Background"],
    }),
    updateMeetingAvatar: builder.mutation({
      query: (data) => ({
        url: "/user-profile/meeting-avatar",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserProfile"],
    }),
    updateAvatar: builder.mutation({
      query: (formData) => ({
        url: "/user-profile/avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["UserProfile", "User", "PublicProfile"],
    }),
    updateCover: builder.mutation({
      query: (formData) => ({
        url: "/user-profile/cover",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["UserProfile", "User", "PublicProfile"],
    }),
    uploadMeetingAvatar: builder.mutation({
      query: (formData) => ({
        url: "/user-profile/meeting-avatar",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["UserProfile", "PublicProfile"],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useGetUserProfileHaveAccountTypeQuery,
  useLazyGetUserProfileQuery,
  useGetPublicProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useRequestUserProfileOtpMutation,
  useUpdateSecurityProfileMutation,
  useUpdateMeetingAvatarMutation,
  useUpdateAvatarMutation,
  useUpdateCoverMutation,
  useUploadMeetingAvatarMutation,
  useVerifyChangePasswordOtpMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetCurrentBackgroundQuery,
  useLazyGetCurrentBackgroundQuery,
  useGetSampleBackgroundsQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
} = userApi;
