import { baseApi } from "./baseApi"

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query({
      query: () => ({
        url: "/user-profile",
        method: "GET",
      }),
      providesTags: ["UserProfile"],
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: "/user-profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserProfile"],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/user-profile/change-password",
        method: "PUT",
        body: data,
      }),
    }),
    requestUserProfileOtp: builder.mutation({
      query: () => ({
        url: "/user-profile/request-otp",
        method: "POST",
      }),
    }),
    requestPhoneUpdateOtp: builder.mutation({
      query: (body) => ({
        url: "/user-profile/phone/request-otp",
        method: "POST",
        body,
      }),
    }),
    updatePhoneNumber: builder.mutation({
      query: (body) => ({
        url: "/user-profile/phone",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["UserProfile"],
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
  }),
})

export const {
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useRequestUserProfileOtpMutation,
  useRequestPhoneUpdateOtpMutation,
  useUpdatePhoneNumberMutation,
  useUpdateMeetingAvatarMutation,
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
} = userApi
