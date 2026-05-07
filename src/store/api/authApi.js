import { baseApi } from "./baseApi"
import { setCredentials, logout } from "../slices/authSlice"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/Auth/login",
        method: "POST",
        body: credentials,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (err) {
          console.error(err)
        }
      },
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/Auth/register",
        method: "POST",
        body: userData,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setCredentials(data))
        } catch (err) {
          console.error(err)
        }
      },
    }),
    registerAdmin: builder.mutation({
      query: (userData) => ({
        url: "/Auth/register-admin",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth"],
    }),
    refreshToken: builder.mutation({
      query: (tokenData) => ({
        url: "/Auth/refresh-token",
        method: "POST",
        body: tokenData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled
          const { user } = getState().auth
          // Preserve existing user if not returned by refresh
          dispatch(
            setCredentials({
              ...data,
              user: data.user || user,
            }),
          )
        } catch (err) {
          console.error(err)
        }
      },
    }),
    revoke: builder.mutation({
      query: (username) => ({
        url: `/Auth/revoke/${username}`,
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/Auth/logout",
        method: "POST",
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Clear local auth state immediately so localStorage is always cleaned up,
        // even if the API call fails. This ensures other tabs see the logout on refresh.
        dispatch(logout())
        try {
          await queryFulfilled
        } catch (err) {
          console.error("Logout API call failed:", err)
        }
        dispatch(baseApi.util.resetApiState())
      },
    }),
    getProfile: builder.query({
      query: () => ({
        url: "/Account/profile",
        method: "GET",
      }),
      providesTags: ["User"],
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
      invalidatesTags: ["User", "Background"],
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({
        url: "/Auth/verify-email",
        method: "POST",
        body,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/Auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    verifyResetOtp: builder.mutation({
      query: (body) => ({
        url: "/Auth/verify-reset-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/Auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterAdminMutation,
  useRefreshTokenMutation,
  useRevokeMutation,

  useLogoutMutation,
  useGetProfileQuery,
  useGetCurrentBackgroundQuery,
  useLazyGetCurrentBackgroundQuery,
  useGetSampleBackgroundsQuery,
  useUploadCustomBackgroundMutation,
  useSetActiveBackgroundMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} = authApi
