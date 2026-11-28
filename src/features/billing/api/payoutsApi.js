import { baseApi } from "@/store/api/baseApi"

/**
 * Normalizes GET /api/v1/payouts/history responses into a plain array.
 * The endpoint may return a bare array or an envelope ({ data } / { items }).
 */
export const normalizePayoutHistory = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.items)) return response.items
  return []
}

export const payoutsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayoutHistory: builder.query({
      query: () => "v1/payouts/history",
      transformResponse: normalizePayoutHistory,
    }),
  }),
  overrideExisting: false,
})

export const { useGetPayoutHistoryQuery } = payoutsApi
