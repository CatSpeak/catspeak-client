import { baseApi } from "@/store/api/baseApi"

export const instructorBankAccountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /payment/bank-accounts/banks - Get list of supported banks
    getBanks: builder.query({
      query: (searchQuery) => ({
        url: "/payment/bank-accounts/banks",
        params: searchQuery
          ? { search: searchQuery, query: searchQuery }
          : undefined,
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: [{ type: "InstructorBankAccounts", id: "BANKS" }],
    }),

    // 2. POST /payment/bank-accounts/verify - Verify bank account details
    verifyBankAccount: builder.mutation({
      query: (data) => ({
        url: "/payment/bank-accounts/verify",
        method: "POST",
        body: data,
      }),
    }),

    // 3. GET /payment/bank-accounts - Get list of instructor bank accounts
    getInstructorBankAccounts: builder.query({
      query: () => "/payment/bank-accounts",
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: (result) => {
        const list = Array.isArray(result) ? result : []
        return [
          ...list.map(({ id }) => ({ type: "InstructorBankAccounts", id })),
          { type: "InstructorBankAccounts", id: "LIST" },
        ]
      },
    }),

    // 4. POST /payment/bank-accounts - Add a new bank account
    addInstructorBankAccount: builder.mutation({
      query: (data) => ({
        url: "/payment/bank-accounts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "InstructorBankAccounts", id: "LIST" }],
    }),

    // 5. GET /payment/bank-accounts/{id} - Get bank account by ID
    getInstructorBankAccountById: builder.query({
      query: (id) => `/payment/bank-accounts/${id}`,
      providesTags: (result, error, id) => [
        { type: "InstructorBankAccounts", id },
      ],
    }),

    // 6. DELETE /payment/bank-accounts/{id} - Delete bank account by ID
    deleteInstructorBankAccount: builder.mutation({
      query: (id) => ({
        url: `/payment/bank-accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "InstructorBankAccounts", id: "LIST" },
        { type: "InstructorBankAccounts", id },
      ],
    }),

    // 7. PUT /payment/bank-accounts/{id}/default - Set bank account as default
    setDefaultInstructorBankAccount: builder.mutation({
      query: (id) => ({
        url: `/payment/bank-accounts/${id}/default`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "InstructorBankAccounts", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBanksQuery,
  useVerifyBankAccountMutation,
  useGetInstructorBankAccountsQuery,
  useAddInstructorBankAccountMutation,
  useGetInstructorBankAccountByIdQuery,
  useDeleteInstructorBankAccountMutation,
  useSetDefaultInstructorBankAccountMutation,
} = instructorBankAccountsApi
