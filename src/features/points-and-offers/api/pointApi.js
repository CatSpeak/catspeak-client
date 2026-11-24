import { baseApi } from "@/store/api/baseApi"

export const pointApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /api/points/overview - Lấy tổng quan điểm thưởng học viên
    getPointsOverview: builder.query({
      query: () => "/points/overview",
      providesTags: ["PointsOverview"],
    }),

    // 2. GET /api/points/history - Lấy lịch sử biến động điểm (phân trang)
    getPointsHistory: builder.query({
      query: (params = {}) => {
        const queryParams = {
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        }
        if (params.type && params.type !== "all") {
          queryParams.type = params.type
        }
        return {
          url: "/points/history",
          params: queryParams,
        }
      },
      providesTags: ["PointsHistory"],
    }),

    // 3. GET /api/vouchers/templates - Lấy danh mục Voucher có thể đổi
    getVoucherTemplates: builder.query({
      query: (params = {}) => {
        const queryParams = {}
        if (params?.category && params.category !== "all") {
          queryParams.category = params.category
        }
        if (params?.search) {
          queryParams.search = params.search
        }
        return {
          url: "/vouchers/templates",
          params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
        }
      },
      providesTags: ["VoucherTemplates"],
    }),

    // 4. POST /api/vouchers/redeem/{templateId} - Thực hiện đổi Voucher bằng điểm
    redeemVoucher: builder.mutation({
      query: (arg) => {
        const isObj = arg && typeof arg === "object"
        const templateId = isObj ? arg.templateId : arg
        const idempotencyKey =
          (isObj && arg.idempotencyKey) ||
          (typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`)
        return {
          url: `/vouchers/redeem/${encodeURIComponent(String(templateId))}`,
          method: "POST",
          headers: {
            "X-Idempotency-Key": idempotencyKey,
          },
        }
      },
      invalidatesTags: [
        "PointsOverview",
        "PointsHistory",
        "VoucherTemplates",
        "VoucherInventory",
      ],
    }),

    // 5. GET /api/vouchers/inventory - Lấy danh sách kho Voucher của học viên
    getVoucherInventory: builder.query({
      query: (params = {}) => {
        const status = typeof params === "string" ? params : params?.status
        return {
          url: "/vouchers/inventory",
          params: {
            status: status && status !== "all" ? status : undefined,
          },
        }
      },
      providesTags: ["VoucherInventory"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPointsOverviewQuery,
  useLazyGetPointsOverviewQuery,
  useGetPointsHistoryQuery,
  useLazyGetPointsHistoryQuery,
  useGetVoucherTemplatesQuery,
  useLazyGetVoucherTemplatesQuery,
  useRedeemVoucherMutation,
  useGetVoucherInventoryQuery,
  useLazyGetVoucherInventoryQuery,
} = pointApi
