// Tracks whether THIS client is the one that ended the live session.
//
// When a host/co-host ends the live, the backend tears the LiveKit room down,
// so every client (including the one that tapped "End live") receives a
// RoomEvent.Disconnected with DisconnectReason.ROOM_DELETED. The actor already
// gets its own success toast, so it must be excluded from the participant-facing
// "host ended the session" toast driven by that disconnect.
let endedLocally = false

export const markLocalEndLive = () => {
  endedLocally = true
}

export const resetLocalEndLive = () => {
  endedLocally = false
}

export const consumeLocalEndLive = () => {
  const value = endedLocally
  endedLocally = false
  return value
}
