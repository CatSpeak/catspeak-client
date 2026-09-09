import { baseApi } from "@/store/api/baseApi"

export const refundsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkRefundEligibility: builder.query({
      query: (paymentId) => `/payment/refunds/eligibility/${paymentId}`,
    }),

    requestRefund: builder.mutation({
      query: (data) => ({
        url: "/payment/refunds/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RefundHistory", "PaymentHistory"],
    }),

    getRefundHistory: builder.query({
      query: () => "/payment/refunds/history",
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
