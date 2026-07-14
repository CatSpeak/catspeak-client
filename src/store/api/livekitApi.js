import { baseApi } from "./baseApi"

export const livekitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLivekitToken: builder.mutation({
      query: ({ roomId, roomName }) => ({
        url: "/livekit/token",
        method: "POST",
        body: { roomId, roomName },
      }),
      transformResponse: (response) => ({
        serverUrl: response.server_url,
        participantToken: response.participant_token,
        sessionId: response.cathspeak?.session_id,
        activeSubSessionId: response.cathspeak?.active_sub_session_id,
        activeSubSessionName: response.cathspeak?.active_sub_session_name,
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
