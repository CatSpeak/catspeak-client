import { baseApi } from "@/store/api/baseApi"
import { createSessionMock, scoreSessionMock, submitTurnMock } from "./mockAdapter"

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
    scoreSession: builder.mutation({
      queryFn: (args) => scoreSessionMock(args),
      invalidatesTags: ["PlacementSession", "PlacementResult"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateSessionMutation,
  useSubmitTurnMutation,
  useScoreSessionMutation,
} = placementTestApi
