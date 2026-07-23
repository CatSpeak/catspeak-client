import { baseApi } from "./baseApi"

export const taskProgressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveUserTasks: builder.query({
      query: () => "/TaskProgress/active",
      providesTags: ["TaskProgress"],
    }),
  }),
})

export const {
  useGetActiveUserTasksQuery,
} = taskProgressApi
