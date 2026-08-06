import { baseApi } from "@/store/api/baseApi"

export const instructorBankAccountsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /api/v1/instructor/bank-accounts/banks - Get list of supported banks
    getBanks: builder.query({
      query: () => "v1/instructor/bank-accounts/banks",
      providesTags: [{ type: "InstructorBankAccounts", id: "BANKS" }],
    }),

    // 2. POST /api/v1/instructor/bank-accounts/verify - Verify bank account details
    verifyBankAccount: builder.mutation({
      query: (data) => ({
        url: "v1/instructor/bank-accounts/verify",
        method: "POST",
        body: data,
      }),
    }),

    // 3. GET /api/v1/instructor/bank-accounts - Get list of instructor bank accounts
    getInstructorBankAccounts: builder.query({
      query: () => "v1/instructor/bank-accounts",
      providesTags: (result) => {
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : []
        return [
          ...list.map(({ id }) => ({ type: "InstructorBankAccounts", id })),
          { type: "InstructorBankAccounts", id: "LIST" },
        ]
      },
    }),

    // 4. POST /api/v1/instructor/bank-accounts - Add a new bank account
    addInstructorBankAccount: builder.mutation({
      query: (data) => ({
        url: "v1/instructor/bank-accounts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "InstructorBankAccounts", id: "LIST" }],
    }),

    // 5. GET /api/v1/instructor/bank-accounts/{id} - Get bank account by ID
    getInstructorBankAccountById: builder.query({
      query: (id) => `v1/instructor/bank-accounts/${id}`,
      providesTags: (result, error, id) => [
        { type: "InstructorBankAccounts", id },
      ],
    }),

    // 6. DELETE /api/v1/instructor/bank-accounts/{id} - Delete bank account by ID
    deleteInstructorBankAccount: builder.mutation({
      query: (id) => ({
        url: `v1/instructor/bank-accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "InstructorBankAccounts", id: "LIST" },
        { type: "InstructorBankAccounts", id },
      ],
    }),

    // 7. PUT /api/v1/instructor/bank-accounts/{id}/default - Set bank account as default
    setDefaultInstructorBankAccount: builder.mutation({
      query: (id) => ({
        url: `v1/instructor/bank-accounts/${id}/default`,
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
