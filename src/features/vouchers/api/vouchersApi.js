import { baseApi } from "@/store/api/baseApi"

export const vouchersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /api/vouchers/stats - Voucher status statistics for dashboard KPI cards
    getVoucherStats: builder.query({
      query: () => "/vouchers/stats",
      providesTags: ["VoucherStats"],
    }),

    // 2. GET /api/vouchers - List vouchers with search, filters & pagination
    getVouchers: builder.query({
      query: (params = {}) => ({
        url: "/vouchers",
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          search: params.search?.trim() || undefined,
          status: params.status && params.status !== "all" ? params.status : undefined,
          discountType: params.discountType && params.discountType !== "all" ? params.discountType : undefined,
          sponsorType: params.sponsorType || "Instructor",
          classId: params.classId || undefined,
          courseId: params.courseId || undefined,
          scopeType: params.scopeType || undefined,
        },
      }),
      providesTags: (result) => {
        const list = Array.isArray(result?.data) ? result.data : []
        return [
          ...list.map(({ id }) => ({ type: "Vouchers", id })),
          { type: "Vouchers", id: "LIST" },
        ]
      },
    }),

    // 3. GET /api/vouchers/{id} - Voucher detail by ID
    getVoucherById: builder.query({
      query: (id) => `/vouchers/${id}`,
      providesTags: (result, error, id) => [{ type: "VoucherDetail", id }],
    }),

    // 4. POST /api/vouchers - Create new voucher or save as Draft
    createVoucher: builder.mutation({
      query: (data) => ({
        url: "/vouchers",
        method: "POST",
        body: {
          sponsorType: 2, // Always Instructor for teacher workspace
          ...data,
        },
      }),
      invalidatesTags: [{ type: "Vouchers", id: "LIST" }, "VoucherStats"],
    }),

    // 5. PUT /api/vouchers/{id} - Update voucher (Draft status only)
    updateVoucher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/vouchers/${id}`,
        method: "PUT",
        body: {
          sponsorType: 2,
          ...data,
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Vouchers", id: "LIST" },
        { type: "Vouchers", id },
        { type: "VoucherDetail", id },
        "VoucherStats",
      ],
    }),

    // 6. GET /api/vouchers/{id}/usages - Voucher student usage history
    getVoucherUsages: builder.query({
      query: ({ id, page = 1, pageSize = 10, search = "", status = "" }) => ({
        url: `/vouchers/${id}/usages`,
        params: {
          page,
          pageSize,
          search: search?.trim() || undefined,
          status: status && status !== "all" ? status : undefined,
        },
      }),
      providesTags: (result, error, { id }) => [{ type: "VoucherUsages", id }],
    }),

    // 7. GET /api/vouchers/generate-code - Generate random voucher code (e.g. GV-XXXXXX)
    generateVoucherCode: builder.query({
      query: () => "/vouchers/generate-code",
    }),

    // 8. GET /api/vouchers/class/{classId} - Get vouchers for class checkout
    getVouchersByClassId: builder.query({
      query: (classId) => `/vouchers/class/${classId}`,
      providesTags: (result, error, classId) => [
        { type: "Vouchers", id: `CLASS_${classId}` },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetVoucherStatsQuery,
  useGetVouchersQuery,
  useGetVoucherByIdQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useGetVoucherUsagesQuery,
  useLazyGenerateVoucherCodeQuery,
  useGenerateVoucherCodeQuery,
  useGetVouchersByClassIdQuery,
} = vouchersApi



