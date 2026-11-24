import { baseApi } from "@/store/api/baseApi"

export const refundsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkRefundEligibility: builder.query({
      query: (paymentId) => `v1/refunds/eligibility/${paymentId}`,
    }),

    requestRefund: builder.mutation({
      query: ({ idempotencyKey, ...data }) => ({
        url: "v1/refunds/request",
        method: "POST",
        body: data,
        headers: {
          "X-Idempotency-Key":
            idempotencyKey ||
            (typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
        },
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
