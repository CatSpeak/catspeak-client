import { baseApi } from "./baseApi"

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
      invalidatesTags: (result, error, eventId) => [
        { type: "Events", id: eventId },
        "Events",
      ],
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
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Events", id: eventId },
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
      providesTags: ["Events"],
    }),

    // GET /api/v1/events/mine
    getMyEvents: builder.query({
      query: (params) => ({
        url: "/v1/events/mine",
        params,
      }),
      providesTags: ["Events"],
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
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Events", id: eventId },
        "Events",
      ],
    }),

    // DELETE /api/v1/Events/{eventId}/registration
    cancelRegistration: builder.mutation({
      query: ({ eventId, ...body }) => ({
        url: `/v1/Events/${eventId}/registration`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: "Events", id: eventId },
        "Events",
      ],
    }),

    // GET /api/v1/Events/occurrence/{occurrenceId}/register
    getOccurrenceRegistrations: builder.query({
      query: (occurrenceId) => `/v1/Events/occurrence/${occurrenceId}/register`,
      providesTags: (result, error, occurrenceId) => [
        { type: "Events", id: `registrations-${occurrenceId}` },
        "Events",
      ],
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
} = eventsApi
