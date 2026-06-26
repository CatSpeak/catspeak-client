import { baseApi } from "./baseApi"

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query({
      query: () => "v1/Plans",
      providesTags: ["Plans"],
    }),
  }),
  overrideExisting: false,
})

export const { useGetPlansQuery } = plansApi
