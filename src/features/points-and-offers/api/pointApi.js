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
      query: (params = {}) => ({
        url: "/points/history",
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 10,
        },
      }),
      providesTags: ["PointsHistory"],
    }),

    // 3. GET /api/vouchers/templates - Lấy danh mục Voucher có thể đổi
    getVoucherTemplates: builder.query({
      query: () => "/vouchers/templates",
      providesTags: ["VoucherTemplates"],
    }),

    // 4. POST /api/vouchers/redeem/{templateId} - Thực hiện đổi Voucher bằng điểm
    redeemVoucher: builder.mutation({
      query: (templateId) => ({
        url: `/vouchers/redeem/${templateId}`,
        method: "POST",
      }),
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

    // 6. POST /api/points/earn - Cộng điểm cho học viên (Admin/Trigger)
    earnPoints: builder.mutation({
      query: ({
        accountId,
        amount,
        description,
        validityMonths = 12,
        validityDays = 0,
      }) => ({
        url: "/points/earn",
        method: "POST",
        params: {
          accountId,
          amount,
          description,
          validityMonths,
          validityDays,
        },
      }),
      invalidatesTags: ["PointsOverview", "PointsHistory"],
    }),

    // 7. POST /api/internal/jobs/points/expire - Cron job: Xử lý lô điểm hết hạn (Admin)
    triggerExpirePointsJob: builder.mutation({
      query: () => ({
        url: "/internal/jobs/points/expire",
        method: "POST",
      }),
      invalidatesTags: ["PointsOverview", "PointsHistory"],
    }),

    // 8. POST /api/internal/jobs/points/birthday - Cron job: Tặng điểm sinh nhật (Admin)
    triggerBirthdayPointsJob: builder.mutation({
      query: () => ({
        url: "/internal/jobs/points/birthday",
        method: "POST",
      }),
      invalidatesTags: ["PointsOverview", "PointsHistory"],
    }),

    // 9. POST /api/internal/jobs/vouchers/expire - Cron job: Xử lý Voucher hết hạn (Admin)
    triggerExpireVouchersJob: builder.mutation({
      query: () => ({
        url: "/internal/jobs/vouchers/expire",
        method: "POST",
      }),
      invalidatesTags: ["VoucherInventory", "VoucherTemplates"],
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
  useEarnPointsMutation,
  useTriggerExpirePointsJobMutation,
  useTriggerBirthdayPointsJobMutation,
  useTriggerExpireVouchersJobMutation,
} = pointApi
