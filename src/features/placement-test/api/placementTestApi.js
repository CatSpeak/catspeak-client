import { baseApi } from "@/store/api/baseApi"
import { createSessionMock, submitTurnMock } from "./mockAdapter"

export const placementTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation({
      queryFn: (args) => createSessionMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
    submitTurn: builder.mutation({
      queryFn: (args) => submitTurnMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
  }),
  overrideExisting: false,
})

export const { useCreateSessionMutation, useSubmitTurnMutation } = placementTestApi
