import { baseApi } from "./baseApi"
import { socialApi } from "./social/socialApi"
import { setCredentials, logout } from "../slices/authSlice"
import {
  clearRegistrationCorrectionToken,
  extractRegistrationCorrectionToken,
  setRegistrationCorrectionToken,
} from "@/features/auth/utils/registrationCorrectionToken"

/**
 * CS-10: keep the short-lived `registrationCorrectionToken` returned by the
 * Core API (register success, or login of an unactivated account) in memory.
 */
function rememberRegistrationCorrectionToken(payload) {
  const token = extractRegistrationCorrectionToken(payload)
  if (token) setRegistrationCorrectionToken(token)
}

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
        } catch (error) {
          // CS-10: RTK Query rejects with `{ error: FetchBaseQueryError }`;
          // Track 1 nests the token in `body.data.registrationCorrectionToken`.
          rememberRegistrationCorrectionToken(
            error?.error?.data ?? error?.data,
          )
          // Handled by UI component
        }
      },
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/Auth/register",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          rememberRegistrationCorrectionToken(data)
        } catch {
          // Handled by UI component
        }
      },
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
        } catch {
          // Handled by refresh handler / component
        }
      },
    }),
    switchAccountType: builder.mutation({
      query: (body) => ({
        url: "/Auth/switch-account-type",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled
          const { user } = getState().auth
          dispatch(
            setCredentials({
              ...data,
              user: data.user || user,
            }),
          )
          // Reset the whole API cache so every query refetches under the new
          // account instead of serving stale data from the previous account.
          dispatch(baseApi.util.resetApiState())
          dispatch(socialApi.util.resetApiState())
        } catch (error) {
          console.error(error)
        }
      },
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
        clearRegistrationCorrectionToken()
        try {
          await queryFulfilled
        } catch (err) {
          console.error("Logout API call failed:", err)
        }
        dispatch(baseApi.util.resetApiState())
        dispatch(socialApi.util.resetApiState())
      },
    }),
    getProfile: builder.query({
      query: () => ({
        url: "/Account/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    verifyEmailOtp: builder.mutation({
      query: (body) => ({
        url: "/Auth/verify-email-otp",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          // Account is now activated: the correction token is no longer needed.
          clearRegistrationCorrectionToken()
          if (data?.auth) {
            dispatch(setCredentials(data.auth))
          }
        } catch {
          // Error handled by the component
        }
      },
    }),
    resendEmailOtp: builder.mutation({
      query: (body) => ({
        url: "/Auth/resend-email-otp",
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
  useRefreshTokenMutation,
  useSwitchAccountTypeMutation,

  useLogoutMutation,
  useGetProfileQuery,

  useVerifyEmailOtpMutation,
  useResendEmailOtpMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} = authApi
