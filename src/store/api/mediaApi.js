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
    searchMedia: builder.query({
      query: ({ sessionId, q, pageToken }) => ({
        url: "/livekit/media/search",
        method: "GET",
        params: { sessionId, q, pageToken },
      }),
      transformResponse: (response) => ({
        items: (response?.items || []).map((item) => ({
          videoId: item.videoId,
          watchUrl: item.watchUrl,
          title: item.title,
          channelTitle: item.channelTitle,
          thumbnailUrl: item.thumbnailUrl,
          duration: item.duration,
          durationSeconds: item.durationSeconds,
          publishedAt: item.publishedAt,
        })),
        nextPageToken: response?.nextPageToken || null,
        fromCache: Boolean(response?.fromCache),
      }),
    }),
  }),
})

export const {
  useStartMediaMutation,
  useStopMediaMutation,
  useGetMediaStatusQuery,
  useLazySearchMediaQuery,
} = mediaApi
