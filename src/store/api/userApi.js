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
  }),
})

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useRequestUserProfileOtpMutation,
} = userApi
