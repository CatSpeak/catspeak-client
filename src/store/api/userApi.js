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
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useUpdateMeetingAvatarMutation,
} = userApi
