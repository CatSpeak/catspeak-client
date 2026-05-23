import { baseApi } from "./baseApi"

const getOccurrenceTags = (result) => {
  const tags = ["Events"]
  if (result?.occurrences) {
    result.occurrences.forEach((occ) => {
      if (occ.id != null)
        tags.push({ type: "Events", id: `occurrence-${occ.id}` })
      if (occ.recurringEventId != null)
        tags.push({ type: "Events", id: occ.recurringEventId })
      if (occ.eventId != null) tags.push({ type: "Events", id: occ.eventId })
      if (occ.subOccurrences) {
        occ.subOccurrences.forEach((sub) => {
          if (sub.id != null)
            tags.push({ type: "Events", id: `occurrence-${sub.id}` })
        })
      }
    })
  }
  return tags
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/Events/{eventId}
    getEventById: builder.query({
      query: (eventId) => `/v1/Events/${eventId}`,
      providesTags: (result, error, eventId) => [
        { type: "Events", id: eventId },
      ],
    }),

    // GET /api/v1/Events/occurrences/{occurrenceId}
    getEventOccurrenceById: builder.query({
      query: (occurrenceId) => `/v1/Events/occurrences/${occurrenceId}`,
      providesTags: (result, error, occurrenceId) => [
        { type: "Events", id: `occurrence-${occurrenceId}` },
      ],
    }),

    // PUT /api/v1/Events/{eventId}
    updateEvent: builder.mutation({
      query: ({ eventId, ...data }) => ({
        url: `/v1/Events/${eventId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Events", id: eventId },
        "Events",
      ],
    }),

    // DELETE /api/v1/Events/{eventId}
    deleteEvent: builder.mutation({
      query: (eventId) => ({
        url: `/v1/Events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Events"], // Only invalidate lists, not the specific ID to prevent 404 refetch
    }),

    // POST /api/v1/Events
    createEvent: builder.mutation({
      query: (data) => ({
        url: "/v1/Events",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Events"],
    }),

    // PUT /api/v1/Events/{eventId}/occurrences/{occurrenceId}
    updateEventOccurrence: builder.mutation({
      query: ({ eventId, occurrenceId, ...data }) => ({
        url: `/v1/Events/${eventId}/occurrences/${occurrenceId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { eventId, occurrenceId }) => [
        { type: "Events", id: eventId },
        { type: "Events", id: `occurrence-${occurrenceId}` },
        "Events",
      ],
    }),

    // PUT /api/v1/Events/{eventId}/series
    updateEventSeries: builder.mutation({
      query: ({ eventId, ...data }) => ({
        url: `/v1/Events/${eventId}/series`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Events", id: eventId },
        "Events",
      ],
    }),

    // DELETE /api/v1/Events/{eventId}/occurrences/{occurrenceId}
    cancelEventOccurrence: builder.mutation({
      query: ({ eventId, occurrenceId, reason }) => ({
        url: `/v1/Events/${eventId}/occurrences/${occurrenceId}`,
        method: "DELETE",
        params: reason ? { reason } : undefined,
      }),
      invalidatesTags: (result, error, { eventId, occurrenceId }) => [
        { type: "Events", id: eventId },
        { type: "Events", id: `occurrence-${occurrenceId}` },
        "Events",
      ],
    }),

    // GET /api/v1/Events/counts
    getEventCounts: builder.query({
      query: (params) => ({
        url: "/v1/Events/counts",
        params,
      }),
      providesTags: ["Events"],
    }),

    // GET /api/v1/Events/by-date
    getEventsByDate: builder.query({
      query: (params) => ({
        url: "/v1/Events/by-date",
        params,
      }),
      providesTags: ["Events"],
    }),

    // GET /api/v1/Events/registered
    getRegisteredEvents: builder.query({
      query: (params) => ({
        url: "/v1/Events/registered",
        params,
      }),
      providesTags: getOccurrenceTags,
    }),

    // GET /api/v1/Events/mine
    getMyEvents: builder.query({
      query: (params) => ({
        url: "/v1/Events/mine",
        params,
      }),
      providesTags: getOccurrenceTags,
    }),

    // POST /api/v1/events/{eventId}/shared-links
    createSharedLink: builder.mutation({
      query: ({ eventId, ...body }) => ({
        url: `/v1/events/${eventId}/shared-links`,
        method: "POST",
        body,
      }),
    }),

    // GET /api/v1/events/shared/{token}
    getSharedEvent: builder.query({
      query: (token) => `/v1/events/shared/${token}`,
    }),

    // POST /api/v1/registrations
    registerForEvent: builder.mutation({
      query: (body) => ({
        url: "/v1/registrations",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { eventId, occurrenceId }) => {
        const tags = [{ type: "Events", id: eventId }, "Events"]
        if (occurrenceId) {
          tags.push({ type: "Events", id: `occurrence-${occurrenceId}` })
        }
        return tags
      },
    }),

    // DELETE /api/v1/Events/{eventId}/registration
    cancelRegistration: builder.mutation({
      query: ({ eventId, ...body }) => ({
        url: `/v1/Events/${eventId}/registration`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: (result, error, { eventId, occurrenceId }) => {
        const tags = [{ type: "Events", id: eventId }, "Events"]
        if (occurrenceId) {
          tags.push({ type: "Events", id: `occurrence-${occurrenceId}` })
        }
        return tags
      },
    }),

    // GET /api/v1/Events/occurrence/{occurrenceId}/register
    getOccurrenceRegistrations: builder.query({
      query: (occurrenceId) => `/v1/Events/occurrence/${occurrenceId}/register`,
      providesTags: (result, error, occurrenceId) => [
        { type: "Events", id: `registrations-${occurrenceId}` },
        "Events",
      ],
    }),

    // DELETE /api/v1/registrations/{registrationId}
    deleteRegistration: builder.mutation({
      query: ({ registrationId, ...body }) => ({
        url: `/v1/registrations/${registrationId}`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Events"],
    }),
  }),
})

export const {
  useGetEventByIdQuery,
  useGetEventOccurrenceByIdQuery,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useCreateEventMutation,
  useUpdateEventOccurrenceMutation,
  useGetEventCountsQuery,
  useGetEventsByDateQuery,
  useGetRegisteredEventsQuery,
  useGetMyEventsQuery,
  useCreateSharedLinkMutation,
  useGetSharedEventQuery,
  useRegisterForEventMutation,
  useCancelRegistrationMutation,
  useGetOccurrenceRegistrationsQuery,
  useUpdateEventSeriesMutation,
  useCancelEventOccurrenceMutation,
  useDeleteRegistrationMutation,
} = eventsApi
