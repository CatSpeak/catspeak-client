import { baseApi } from "./baseApi"

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: (body) => ({
        url: "/payment/checkout",
        method: "POST",
        body,
      }),
    }),
    repay: builder.mutation({
      query: ({ paymentId, ...body }) => ({
        url: `/payment/repay/${paymentId}`,
        method: "POST",
        body,
      }),
    }),
    cancelPayment: builder.mutation({
      query: (paymentId) => ({
        url: `/payment/cancel/${paymentId}`,
        method: "POST",
      }),
      invalidatesTags: ["PaymentHistory"],
    }),
    getPaymentHistory: builder.query({
      query: () => "/payment/history",
      // Provide tags so we can invalidate this query after a successful checkout/repay/report
      providesTags: ["PaymentHistory"],
    }),
    reportPaymentIssue: builder.mutation({
      query: (formData) => ({
        url: "/payment/report",
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
          url: `/payment/checkout/lookup-learner?${params.toString()}`,
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
