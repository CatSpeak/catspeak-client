/**
 * REST API Endpoints cho bài kiểm tra đầu vào (Placement Test Subsystem).
 *
 * Hỗ trợ chuyển đổi mượt mà giữa REST Backend thật (`catspeak-ai` v2.0)
 * và Mock Adapter (`localStorage`) qua cờ `VITE_PLACEMENT_USE_REAL_ENGINE`.
 */
import { baseApi } from "@/store/api/baseApi"
import {
  adjustLevelMock,
  cancelSessionMock,
  createSessionMock,
  getActiveSessionMock,
  getQuestionMock,
  getRetakeStatusMock,
  resumeSessionMock,
  scoreSessionMock,
  submitTurnMock,
} from "./mockAdapter"
import {
  USE_REAL_ENGINE,
  adjustLevelReal,
  cancelSessionReal,
  createSessionReal,
  getActiveSessionReal,
  getQuestionReal,
  getRetakeStatusReal,
  scoreSessionReal,
  submitTurnReal,
} from "./realAdapter"

export const placementTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation({
      queryFn: (args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? createSessionReal(args, { baseQuery, api, extraOptions })
          : createSessionMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
    getActiveSession: builder.query({
      queryFn: (_args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? getActiveSessionReal({ baseQuery, api, extraOptions })
          : getActiveSessionMock(),
      providesTags: ["PlacementSession"],
    }),
    getQuestion: builder.query({
      queryFn: (args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? getQuestionReal(args, { baseQuery, api, extraOptions })
          : getQuestionMock(args),
      providesTags: ["PlacementSession"],
    }),
    resumeSession: builder.mutation({
      queryFn: (args) => resumeSessionMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
    cancelSession: builder.mutation({
      queryFn: (args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? cancelSessionReal(args, { baseQuery, api, extraOptions })
          : cancelSessionMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
    getRetakeStatus: builder.query({
      queryFn: (_args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? getRetakeStatusReal({ baseQuery, api, extraOptions })
          : getRetakeStatusMock(),
      providesTags: ["PlacementResult"],
    }),
    getProfile: builder.query({
      queryFn: (_args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? getRetakeStatusReal({ baseQuery, api, extraOptions })
          : getRetakeStatusMock(),
      providesTags: ["PlacementResult"],
    }),

    submitTurn: builder.mutation({
      queryFn: (args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? submitTurnReal(args, { baseQuery, api, extraOptions })
          : submitTurnMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
    scoreSession: builder.mutation({
      queryFn: (args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? scoreSessionReal(args, { baseQuery, api, extraOptions })
          : scoreSessionMock(args),
      invalidatesTags: ["PlacementSession", "PlacementResult"],
    }),

    adjustLevel: builder.mutation({
      queryFn: (args, api, extraOptions, baseQuery) =>
        USE_REAL_ENGINE
          ? adjustLevelReal(args, { baseQuery, api, extraOptions })
          : adjustLevelMock(args),
      invalidatesTags: ["PlacementSession", "PlacementResult"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateSessionMutation,
  useGetActiveSessionQuery,
  useGetQuestionQuery,
  useResumeSessionMutation,
  useCancelSessionMutation,
  useGetRetakeStatusQuery,
  useGetProfileQuery,
  useSubmitTurnMutation,
  useScoreSessionMutation,
  useAdjustLevelMutation,
} = placementTestApi

