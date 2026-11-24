import { baseApi } from "./baseApi"

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: ({ idempotencyKey, ...body }) => ({
        url: "v1/Payments/checkout",
        method: "POST",
        body,
        headers: {
          "X-Idempotency-Key":
            idempotencyKey ||
            (typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
        },
      }),
    }),
    repay: builder.mutation({
      query: ({ paymentId, idempotencyKey, ...body }) => ({
        url: `v1/Payments/repay/${paymentId}`,
        method: "POST",
        body,
        headers: {
          "X-Idempotency-Key":
            idempotencyKey ||
            (typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
        },
      }),
    }),
    cancelPayment: builder.mutation({
      query: (paymentId) => ({
        url: `v1/Payments/cancel/${paymentId}`,
        method: "POST",
      }),
      invalidatesTags: ["PaymentHistory"],
    }),
    getPaymentHistory: builder.query({
      query: () => "v1/Payments/history",
      // Provide tags so we can invalidate this query after a successful checkout/repay/report
      providesTags: ["PaymentHistory"],
    }),
    reportPaymentIssue: builder.mutation({
      query: (formData) => ({
        url: "v1/Payments/report",
        method: "POST",
        // When sending FormData, DO NOT set the Content-Type header manually.
        // The browser will automatically set it with the correct boundary.
        body: formData,
      }),
      invalidatesTags: ["PaymentHistory"],
    }),
    lookupLearner: builder.query({
      query: ({ email, classId, currentAccountIds }) => {
        const params = new URLSearchParams()
        if (email) params.append("email", email)
        if (classId) params.append("classId", classId)
        if (currentAccountIds?.length > 0) params.append("currentAccountIds", currentAccountIds.join(","))
        
        return {
          url: `v1/Payments/checkout/lookup-learner?${params.toString()}`,
          method: "GET",
        }
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useCheckoutMutation,
  useRepayMutation,
  useCancelPaymentMutation,
  useGetPaymentHistoryQuery,
  useReportPaymentIssueMutation,
  useLookupLearnerQuery,
  useLazyLookupLearnerQuery,
} = paymentsApi
