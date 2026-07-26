const CHANNEL_NAME = "catspeak_video_call_channel"

let channel = null

function getChannel() {
  if (typeof window === "undefined") return null
  if (!channel && "BroadcastChannel" in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME)
    } catch (e) {
      console.error("[CallBroadcastChannel] Failed to create BroadcastChannel:", e)
    }
  }
  return channel
}

export const BROADCAST_EVENT_TYPES = {
  PING_ACTIVE_CALL: "PING_ACTIVE_CALL",
  PONG_ACTIVE_CALL: "PONG_ACTIVE_CALL",
  REQUEST_LEAVE_CALL: "REQUEST_LEAVE_CALL",
  CALL_JOINED: "CALL_JOINED",
  CALL_LEFT: "CALL_LEFT",
}

/**
 * Broadcast an event to all other tabs
 */
export function broadcastCallEvent(type, payload = {}) {
  const ch = getChannel()
  if (ch) {
    try {
      ch.postMessage({ type, payload, timestamp: Date.now() })
    } catch (e) {
      console.error("[CallBroadcastChannel] postMessage error:", e)
    }
  }
}

/**
 * Ping other tabs to check if any tab is in an active call.
 * Returns a promise resolving to call payload if an active call tab responds within timeout,
 * or null if no tab is in a call.
 */
export function pingActiveCall(timeoutMs = 300) {
  return new Promise((resolve) => {
    const ch = getChannel()
    if (!ch) {
      resolve(null)
      return
    }

    let resolved = false
    const handleMessage = (event) => {
      if (resolved) return
      const { type, payload } = event.data || {}
      if (type === BROADCAST_EVENT_TYPES.PONG_ACTIVE_CALL && payload?.isInCall) {
        resolved = true
        ch.removeEventListener("message", handleMessage)
        clearTimeout(timer)
        resolve(payload)
      }
    }

    ch.addEventListener("message", handleMessage)

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        ch.removeEventListener("message", handleMessage)
        resolve(null)
      }
    }, timeoutMs)

    broadcastCallEvent(BROADCAST_EVENT_TYPES.PING_ACTIVE_CALL)
  })
}

/**
 * Broadcast a request for any active call in another tab to leave.
 */
export function requestLeaveActiveCall() {
  broadcastCallEvent(BROADCAST_EVENT_TYPES.REQUEST_LEAVE_CALL)
}

/**
 * Subscribe to broadcast messages on the video call channel.
 * Returns an unsubscribe function.
 */
export function subscribeToCallBroadcast(onMessage) {
  const ch = getChannel()
  if (!ch) return () => {}

  const handleMessage = (event) => {
    if (event.data) {
      onMessage(event.data)
    }
  }

  ch.addEventListener("message", handleMessage)
  return () => {
    ch.removeEventListener("message", handleMessage)
  }
}
