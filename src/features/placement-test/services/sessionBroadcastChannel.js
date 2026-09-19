import { SESSION_BROADCAST_CHANNEL } from "../constants/lifecycle"

const defaultChannelFactory = () => {
  if (typeof window === "undefined") return null
  if (typeof window.BroadcastChannel === "undefined") return null
  try {
    return new window.BroadcastChannel(SESSION_BROADCAST_CHANNEL)
  } catch {
    return null
  }
}

/**
 * Injectable transport over BroadcastChannel so the cross-tab session
 * takeover logic can be driven by a fake channel in tests.
 */
export const createSessionBroadcast = ({
  createChannel = defaultChannelFactory,
  now = Date.now,
} = {}) => {
  let channel = null

  const ensure = () => {
    if (!channel) channel = createChannel()
    return channel
  }

  return {
    post(type, payload = {}) {
      const target = ensure()
      if (!target) return false
      try {
        target.postMessage({ type, payload, timestamp: now() })
        return true
      } catch {
        return false
      }
    },
    subscribe(handler) {
      const target = ensure()
      if (!target || typeof handler !== "function") return () => {}
      const onMessage = (event) => {
        if (event?.data) handler(event.data)
      }
      target.addEventListener("message", onMessage)
      return () => {
        try {
          target.removeEventListener("message", onMessage)
        } catch {
          // ignore teardown errors
        }
      }
    },
    close() {
      try {
        channel?.close()
      } catch {
        // ignore teardown errors
      }
      channel = null
    },
  }
}
