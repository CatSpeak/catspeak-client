export const PAUSE_BUDGET_MS = 30 * 60 * 1000
export const RECONNECT_INTERVAL_MS = 15000
export const MAX_RECONNECT_ATTEMPTS = 3
export const CONNECTION_LOST_EVENT = "catspeak:placement-connection-lost"

export const RETAKE_COOLDOWN_DAYS = 14
export const RETAKE_COOLDOWN_MS = RETAKE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000

export const RESUME_WINDOW_MS = 24 * 60 * 60 * 1000

export const TAKEOVER_SETTLE_MS = 600
export const TAKEOVER_PING_INTERVAL_MS = 200

export const SESSION_BROADCAST_CHANNEL = "catspeak_placement_test_channel"
export const SESSION_BROADCAST_TYPES = {
  PING: "PT_SESSION_PING",
  PONG: "PT_SESSION_PONG",
  TAKEOVER: "PT_SESSION_TAKEOVER",
}
