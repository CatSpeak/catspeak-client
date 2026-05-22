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
        sessionId: response.cathspeak?.session_id,
      }),
    }),
    raiseHand: builder.mutation({
      query: (body) => ({
        url: "/livekit/hand-raise",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const { useGetLivekitTokenMutation, useRaiseHandMutation } = livekitApi
