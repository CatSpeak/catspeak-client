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
  }),
  overrideExisting: false,
})

export const { useGetPlansQuery, useGetMyUsageQuery } = plansApi
