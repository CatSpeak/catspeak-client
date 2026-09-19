import { baseApi } from "@/store/api/baseApi"
import { createSessionMock } from "./mockAdapter"

export const placementTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation({
      queryFn: (args) => createSessionMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
  }),
  overrideExisting: false,
})

export const { useCreateSessionMutation } = placementTestApi
