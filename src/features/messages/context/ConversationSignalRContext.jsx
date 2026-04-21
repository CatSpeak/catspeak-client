import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react"
import * as signalR from "@microsoft/signalr"
import { useAuth } from "@/features/auth"
import { store } from "@store"
import { getRefreshPromise } from "@store/api/baseApi"

const MAX_START_RETRIES = 3
const RETRY_DELAY_MS = 3000

const HUB_EVENTS = [
  "NewMessage",
  "NewConversation",
  "ConversationCreated",
  "FriendStatusChange",
  "ChatUpdated",
]

const ConversationSignalRContext = createContext(null)

export const useConversationSignalRContext = () => {
  return useContext(ConversationSignalRContext)
}

export const ConversationSignalRProvider = ({ children }) => {
  const { token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionId, setConnectionId] = useState(null)
  const connectionRef = useRef(null)

  // Map<EventName, Set<Callback>>
  const subscribersRef = useRef(new Map())

  const on = useCallback((eventName, callback) => {
    if (!subscribersRef.current.has(eventName)) {
      subscribersRef.current.set(eventName, new Set())
    }
    subscribersRef.current.get(eventName).add(callback)

    return () => {
      const callbacks = subscribersRef.current.get(eventName)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }, [])

  const off = useCallback((eventName, callback) => {
    const callbacks = subscribersRef.current.get(eventName)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }, [])

  const notifySubscribers = useCallback((eventName, ...args) => {
    // Helpful console log to trace if SignalR events are actually arriving
    console.debug(`[SignalR:Received] ${eventName}`, args)

    const callbacks = subscribersRef.current.get(eventName)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args)
        } catch (err) {
          console.error(
            `[ConversationSignalR] Error in handler for ${eventName}:`,
            err,
          )
        }
      })
    }
  }, [])

  // ── Connection lifecycle ──────────────────────────────────────────
  // Depend on `!!token` (boolean) rather than the raw token string.
  // This prevents the effect from re-running when the token is silently
  // refreshed — the accessTokenFactory already reads the latest token
  // from the Redux store at negotiate-time, so a reconnect isn't needed.
  const hasToken = !!token

  useEffect(() => {
    if (!hasToken) return

    const abortController = new AbortController()
    const { signal } = abortController

    const apiUrl = import.meta.env.VITE_API_BASE_URL
    const baseUrl = apiUrl.replace(/\/api\/?$/, "")
    const hubUrl = `${baseUrl}/hubs/chat`

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => store.getState().auth.token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Critical)
      .build()

    connectionRef.current = connection

    // Bind server → client events
    HUB_EVENTS.forEach((event) => {
      connection.on(event, (...args) => notifySubscribers(event, ...args))
    })

    // Lifecycle handlers
    connection.onreconnecting(() => {
      setIsConnected(false)
    })

    connection.onreconnected((id) => {
      console.info("[ConversationSignalR] Reconnected, id:", id)
      setIsConnected(true)
      setConnectionId(id)
      notifySubscribers("OnReconnected", id)
    })

    connection.onclose(() => {
      setIsConnected(false)
      setConnectionId(null)
    })

    // Start with retries, respecting abort signal
    const start = async (attempt = 1) => {
      if (signal.aborted) return
      try {
        await connection.start()
        if (signal.aborted) return // effect was cleaned up while awaiting

        console.info(
          "[ConversationSignalR] Connected, id:",
          connection.connectionId,
        )
        setIsConnected(true)
        setConnectionId(connection.connectionId)
        notifySubscribers("OnConnected", connection)
      } catch (err) {
        if (signal.aborted) return // cleanup interrupted the negotiation

        if (attempt < MAX_START_RETRIES) {
          console.debug(
            `[ConversationSignalR] Attempt ${attempt}/${MAX_START_RETRIES} failed, retrying…`,
          )

          // If a token refresh is in progress, wait for it to finish so the
          // next attempt uses a fresh access token instead of the expired one.
          const pending = getRefreshPromise()
          if (pending) {
            console.debug("[ConversationSignalR] Waiting for token refresh before retry…")
            await pending
          }

          await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, RETRY_DELAY_MS)
            // If aborted during the wait, clean up and bail out
            signal.addEventListener("abort", () => {
              clearTimeout(timer)
              reject(new DOMException("Aborted", "AbortError"))
            }, { once: true })
          }).catch(() => {})
          return start(attempt + 1)
        }

        console.warn(
          "[ConversationSignalR] Failed to connect after",
          MAX_START_RETRIES,
          "attempts:",
          err.message || err,
        )
      }
    }

    start()

    // Cleanup
    return () => {
      abortController.abort()
      connection.stop().catch(() => {})
      connectionRef.current = null
      setIsConnected(false)
      setConnectionId(null)
    }
  }, [hasToken, notifySubscribers])

  const invoke = useCallback(async (methodName, ...args) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return await connectionRef.current.invoke(methodName, ...args)
    }
    return Promise.reject("SignalR not connected")
  }, [])

  const sendMessage = useCallback(
    (conversationId, messageContent, messageType = 0) => {
      return invoke("SendMessage", {
        conversationId,
        messageContent,
        messageType,
      })
    },
    [invoke],
  )

  const reconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop()
        setIsConnected(false)
        setConnectionId(null)
        await connectionRef.current.start()
        setIsConnected(true)
        setConnectionId(connectionRef.current.connectionId)
        console.info("[ConversationSignalR] Force reconnected successfully")
      } catch (err) {
        console.error("[ConversationSignalR] Force reconnect failed:", err)
      }
    }
  }, [])

  const value = {
    isConnected,
    connectionId,
    sendMessage,
    invoke,
    reconnect,
    on,
    off,
  }

  return (
    <ConversationSignalRContext.Provider value={value}>
      {children}
    </ConversationSignalRContext.Provider>
  )
}
