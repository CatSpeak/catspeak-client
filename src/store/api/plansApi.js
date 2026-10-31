import { baseApi } from "./baseApi"

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query({
      query: () => "v1/Plans",
      providesTags: ["Plans"],
    }),
    getMyUsage: builder.query({
      query: () => "v1/Plans/my-usage",
      providesTags: ["PlanUsage"],
    }),
    // Same source the AI API enforces before starting a placement session
    // (GET /api/v1/Plans/placement-permission). my-usage derives features
    // differently and can disagree for Pro-tier accounts without an active
    // subscription.
    getPlacementPermission: builder.query({
      query: () => "v1/Plans/placement-permission",
      providesTags: ["PlanUsage"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPlansQuery,
  useGetMyUsageQuery,
  useGetPlacementPermissionQuery,
} = plansApi
