import { baseApi } from "./baseApi"

export const voucherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/vouchers/class/{classId}
    getVouchersForClass: builder.query({
      query: ({ classId, learnersCount = 1, orderAmount }) => {
        const params = new URLSearchParams()
        params.append("learnersCount", String(learnersCount))
        return `/vouchers/class/${classId}?${params.toString()}`
      },
      transformResponse: (response) => {
        // Normalize: response may already be unwrapped by baseApi
        const data = response?.data ?? response
        return {
          availableVouchers: data?.availableVouchers ?? [],
          suggestedTags: data?.suggestedTags ?? [],
          notApplicableForClass: data?.notApplicableForClass ?? [],
          notEligible: data?.notEligible ?? [],
          expired: data?.expired ?? [],
          exhausted: data?.exhausted ?? [],
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVouchersForClassQuery,
} = voucherApi
