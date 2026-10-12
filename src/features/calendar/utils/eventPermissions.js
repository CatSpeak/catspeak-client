// Shared identity helpers for calendar event surfaces.

export const getIsCreator = (user, event, override) => {
  if (override !== undefined) return override
  return Boolean(
    user &&
      event &&
      ((user.id != null && event.creatorId != null && user.id === event.creatorId) ||
        (user.accountId != null &&
          event.creatorId != null &&
          user.accountId === event.creatorId) ||
        (user.username != null &&
          event.creatorName != null &&
          user.username === event.creatorName) ||
        (user.fullName != null &&
          event.creatorName != null &&
          user.fullName === event.creatorName)),
  )
}

export const getEventId = (event) =>
  event?.eventId ?? event?.recurringEventId ?? event?.id

export const getWorkspaceOccurrenceId = (event) =>
  event?.occurrenceId ?? event?.id ?? null
