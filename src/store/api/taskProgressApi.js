import { baseApi } from "./baseApi"

export const taskProgressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveUserTasks: builder.query({
      query: () => "/TaskProgress/active",
      providesTags: ["TaskProgress"],
    }),
    cancelTaskProgress: builder.mutation({
      query: (taskId) => ({
        url: `/TaskProgress/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TaskProgress"],
    }),
  }),
})

export const {
  useGetActiveUserTasksQuery,
  useCancelTaskProgressMutation,
} = taskProgressApi
