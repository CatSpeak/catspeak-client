export const PAUSE_BUDGET_MS = 30 * 60 * 1000
export const RECONNECT_INTERVAL_MS = 15000
export const MAX_RECONNECT_ATTEMPTS = 3
export const CONNECTION_LOST_EVENT = "catspeak:placement-connection-lost"

export const RETAKE_COOLDOWN_DAYS = 14
export const RETAKE_COOLDOWN_MS = RETAKE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000

// Unfinished sessions can be resumed for up to 24h after the last activity.
export const RESUME_WINDOW_MS = 24 * 60 * 60 * 1000

// How long a freshly opened tab waits for another active tab to answer a
// session ping before assuming it is the only one holding the session.
export const TAKEOVER_SETTLE_MS = 600

export const SESSION_BROADCAST_CHANNEL = "catspeak_placement_test_channel"
export const SESSION_BROADCAST_TYPES = {
  PING: "PT_SESSION_PING",
  PONG: "PT_SESSION_PONG",
  TAKEOVER: "PT_SESSION_TAKEOVER",
}
