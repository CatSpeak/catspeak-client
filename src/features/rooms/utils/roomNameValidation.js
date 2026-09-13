export const ROOM_NAME_MAX_LENGTH = 50

export const validateRoomName = (
  name,
  { required = false, messages = {} } = {},
) => {
  const trimmed = (name || "").trim()
  if (required && !trimmed) {
    return messages.required || "Room name is required"
  }
  if (trimmed.length > ROOM_NAME_MAX_LENGTH) {
    return messages.tooLong || "Room name must be 50 characters or fewer"
  }
  return ""
}
