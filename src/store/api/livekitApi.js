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
        egressProfile: response.egress_profile,
        highQuality: response.high_quality,
        sessionId: response.cathspeak?.session_id,
        activeSubSessionId: response.cathspeak?.active_sub_session_id,
        activeSubSessionName: response.cathspeak?.active_sub_session_name,
        // Ticket 01: governance snapshot embedded in the join response.
        roomState: response.cathspeak?.room_state,
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
