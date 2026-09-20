/**
 * Bảy endpoint của bài kiểm tra đầu vào.
 *
 * Hai trong số đó — `submitTurn` và `scoreSession` — nay đi tới động cơ chấm
 * điểm thật ở `catspeak-ai`. Năm cái còn lại vẫn là mock trên localStorage, vì
 * chúng cần bảng vòng đời phía máy chủ mà `PlacementController` chưa tồn tại.
 *
 *     createSession     mock   cần bảng ai.placement_sessions
 *     getActiveSession  mock   nt
 *     resumeSession     mock   nt
 *     getRetakeStatus   mock   cần lịch sử bài thi trong database
 *     submitTurn        THẬT   POST /placement/score-turn
 *     scoreSession      THẬT   POST /placement/finalize
 *     adjustLevel       mock   cần cột self_adjusted phía máy chủ
 *
 * Tham số thứ tư của `queryFn` là `baseQuery` — dùng nó thay vì `fetch` trần thì
 * được cả ba thứ của baseApi: header Authorization, luồng làm mới token, và
 * việc định tuyến sang `VITE_AI_API_BASE_URL`. Xem `isAiRoute` trong
 * `store/api/baseApi.js`, `/placement/*` đã được thêm vào đó.
 *
 * Đặt `VITE_PLACEMENT_USE_REAL_ENGINE=0` để quay lại mock hoàn toàn — dùng khi
 * làm giao diện mà không muốn dựng backend.
 */
import { baseApi } from "@/store/api/baseApi"
import {
  adjustLevelMock,
  createSessionMock,
  getActiveSessionMock,
  getRetakeStatusMock,
  resumeSessionMock,
  scoreSessionMock,
  submitTurnMock,
} from "./mockAdapter"
import { USE_REAL_ENGINE, scoreSessionReal, submitTurnReal } from "./realAdapter"

export const placementTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSession: builder.mutation({
      queryFn: (args) => createSessionMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
    getActiveSession: builder.query({
      queryFn: () => getActiveSessionMock(),
      providesTags: ["PlacementSession"],
    }),
    resumeSession: builder.mutation({
      queryFn: (args) => resumeSessionMock(args),
      invalidatesTags: ["PlacementSession"],
    }),
    getRetakeStatus: builder.query({
      queryFn: () => getRetakeStatusMock(),
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
      queryFn: (args) => adjustLevelMock(args),
      invalidatesTags: ["PlacementSession", "PlacementResult"],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateSessionMutation,
  useGetActiveSessionQuery,
  useResumeSessionMutation,
  useGetRetakeStatusQuery,
  useSubmitTurnMutation,
  useScoreSessionMutation,
  useAdjustLevelMutation,
} = placementTestApi
