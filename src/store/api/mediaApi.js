import { baseApi } from "./baseApi"

const mapMediaDto = (response) => ({
  sessionId: response.sessionId,
  liveKitRoomName: response.liveKitRoomName,
  ingressId: response.ingressId,
  videoId: response.videoId,
  watchUrl: response.watchUrl,
  title: response.title,
  status: response.status,
  startedByAccountId: response.startedByAccountId,
})

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startMedia: builder.mutation({
      query: (body) => ({
        url: "/livekit/media/start",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Media"],
      transformResponse: mapMediaDto,
    }),
    stopMedia: builder.mutation({
      query: (body) => ({
        url: "/livekit/media/stop",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Media"],
      transformResponse: (response) => ({
        sessionId: response.sessionId,
        status: response.status,
      }),
    }),
    getMediaStatus: builder.query({
      query: (sessionId) => ({
        url: `/livekit/media/status/${sessionId}`,
        method: "GET",
      }),
      providesTags: ["Media"],
      transformResponse: (response) => (response ? mapMediaDto(response) : null),
    }),
  }),
})

export const {
  useStartMediaMutation,
  useStopMediaMutation,
  useGetMediaStatusQuery,
} = mediaApi
