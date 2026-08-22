import { useState, useRef, useEffect, useCallback } from "react"
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr"

import { useAuth } from "@/features/auth"
import { store } from "@store"

export const useVideoCallSignaling = (handlers = {}) => {
  const { token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionId, setConnectionId] = useState(null)
  const connectionRef = useRef(null)

  // Use ref for handlers to avoid effect dependency issues
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  const hasToken = !!token

  useEffect(() => {
    const activeToken = store.getState().auth.token || token || localStorage.getItem("token")
    if (!activeToken) {
      console.warn("[VideoCallSignalR] No token found, cannot connect.")
      return
    }

    const apiUrl = import.meta.env.VITE_API_BASE_URL || "/api"
    const baseUrl = apiUrl.replace(/\/api\/?$/, "")
    const hubUrl = `${baseUrl}/hubs/videochat`

    console.info("[VideoCallSignalR] Connecting to hub at:", hubUrl)

    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => store.getState().auth.token || token || localStorage.getItem("token") || "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build()

    connectionRef.current = newConnection

    const safeHandler =
      (name) =>
      (...args) => {
        console.info(`[VideoCallSignalR] Event received: ${name}`, ...args)
        const handler = handlersRef.current[name]
        if (handler) {
          handler(...args)
        }
      }

    // Bind Hub Events
    const events = [
      "RoomClosingWarning",
      "JoinBreakoutRoom",
      "ReturnToMainRoom",
      "BreakoutStatusChanged",
      "ParticipantLeft",
      "BroadcastNotification",
    ]
    events.forEach((evt) => {
      newConnection.on(evt, safeHandler(evt))
    })

    const start = async () => {
      try {
        await newConnection.start()
        setIsConnected(true)
        setConnectionId(newConnection.connectionId)
        console.info("[VideoCallSignalR] Hub connected successfully. ConnectionId:", newConnection.connectionId)

        // Notify handler of connection if needed
        if (handlersRef.current.OnConnected) {
          handlersRef.current.OnConnected(newConnection)
        }
      } catch (err) {
        console.error("[VideoCallSignalR] Connection Error:", err)
        setIsConnected(false)
      }
    }

    start()

    newConnection.onreconnecting(() => {
      console.warn("[VideoCallSignalR] Reconnecting...")
    })

    newConnection.onreconnected((connectionId) => {
      setIsConnected(true)
      setConnectionId(connectionId)
      if (handlersRef.current.OnReconnected) {
        handlersRef.current.OnReconnected(connectionId)
      }
    })

    newConnection.onclose(() => {
      console.warn("[VideoCallSignalR] Disconnected")
      setIsConnected(false)
      setConnectionId(null)
    })

    return () => {
      newConnection.stop().catch(() => {})
      setIsConnected(false)
      setConnectionId(null)
      connectionRef.current = null
    }
  }, [hasToken]) // only reconnect when auth status changes

  // Wrappers for specific hub methods - Stabilize with useCallback
  const invoke = useCallback(async (methodName, ...args) => {
    if (connectionRef.current?.state === HubConnectionState.Connected) {
      try {
        const result = await connectionRef.current.invoke(methodName, ...args)
        return result
      } catch (err) {
        console.error(`[VideoCallSignalR] Invoke ${methodName} error:`, err)
        throw err
      }
    }
    console.warn("[VideoCallSignalR] Cannot invoke, not connected.")
    return Promise.reject("Not Connected")
  }, [])

  const joinSession = useCallback(
    async (sessionId) => {
      try {
        const result = await invoke("JoinSession", sessionId)
        return result
      } catch (err) {
        console.error("[VideoCallSignalR] JoinSession failed:", err)
        throw err
      }
    },
    [invoke],
  )

  return {
    isConnected,
    connectionId,
    invoke,
    joinSession,
  }
}
