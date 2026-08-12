import { baseApi } from "@/store/api/baseApi"

export const refundsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkRefundEligibility: builder.query({
      query: (paymentId) => `v1/refunds/eligibility/${paymentId}`,
    }),

    requestRefund: builder.mutation({
      query: (data) => ({
        url: "v1/refunds/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RefundHistory", "PaymentHistory"],
    }),

    getRefundHistory: builder.query({
      query: () => "v1/refunds/history",
      providesTags: ["RefundHistory"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCheckRefundEligibilityQuery,
  useLazyCheckRefundEligibilityQuery,
  useRequestRefundMutation,
  useGetRefundHistoryQuery,
} = refundsApi
