import { baseApi } from "./baseApi"

export const presenceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPresenceConfig: builder.query({
      query: () => ({
        url: "/v1/Presence/config",
        method: "GET",
      }),
    }),
    sendHeartbeat: builder.mutation({
      query: (data) => ({
        url: "/v1/Presence/heartbeat",
        method: "POST",
        body: data,
      }),
    }),
  }),
})

export const { useGetPresenceConfigQuery, useSendHeartbeatMutation } = presenceApi
