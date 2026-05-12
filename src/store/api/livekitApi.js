import { baseApi } from "./baseApi"

export const livekitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLivekitToken: builder.mutation({
      query: ({ roomId, roomName, participantName }) => ({
        url: "/livekit/token",
        method: "POST",
        body: { roomId, roomName, participantName },
      }),
      transformResponse: (response) => ({
        serverUrl: response.server_url,
        participantToken: response.participant_token,
      }),
    }),
  }),
})

export const { useGetLivekitTokenMutation } = livekitApi
