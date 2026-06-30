import { baseApi } from "./baseApi"

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: (body) => ({
        url: "v1/Payments/checkout",
        method: "POST",
        body,
      }),
    }),
    repay: builder.mutation({
      query: ({ paymentId, ...body }) => ({
        url: `v1/Payments/repay/${paymentId}`,
        method: "POST",
        body,
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
  }),
  overrideExisting: false,
})

export const {
  useCheckoutMutation,
  useRepayMutation,
  useCancelPaymentMutation,
  useGetPaymentHistoryQuery,
  useReportPaymentIssueMutation,
} = paymentsApi
