import { useEffect, useRef, useState } from "react"
import * as signalR from "@microsoft/signalr"

/**
 * useVideoChatSignalR — custom hook to establish real-time connection specifically
 * to the CatSpeak VideoChatHub. Handlers are dynamically registered to stream
 * recording events and other room actions.
 *
 * @param {number|string|null} sessionId - CatSpeak session ID.
 * @param {string|null} token - JWT bearer access token.
 * @param {function} onEventReceived - Callback fired when high-priority SignalR event is parsed.
 * @returns {boolean} connection status
 */
export const useVideoChatSignalR = (sessionId, token, onEventReceived) => {
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef(null)
  const onEventReceivedRef = useRef(onEventReceived)

  useEffect(() => {
    onEventReceivedRef.current = onEventReceived
  }, [onEventReceived])

  useEffect(() => {
    if (!sessionId || !token) {
      console.warn(
        "[VideoChatSignalR] Missing sessionId or token — skipping hub instantiation.",
      )
      return
    }

    const apiUrl = import.meta.env.VITE_API_BASE_URL || "/api"
    const baseUrl = apiUrl.replace(/\/api\/?$/, "")
    const hubUrl = `${baseUrl}/hubs/videochat`

    console.info("[VideoChatSignalR] Connecting to VideoChatHub at:", hubUrl)

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build()

    connection.on(
      "RecordingStatusChanged",
      (sessId, status, egressId, startedByAccountId, reason) => {
        console.log("[VideoChatSignalR] Received RecordingStatusChanged:", {
          sessId,
          status,
          egressId,
          startedByAccountId,
          reason,
        })
        if (Number(sessId) === Number(sessionId)) {
          if (onEventReceivedRef.current) {
            onEventReceivedRef.current("RecordingStatusChanged", {
              status,
              egressId,
              startedByAccountId,
              reason,
            })
          }
        }
      },
    )

    connection.on("RecordingWarning", (sessId, message) => {
      console.log("[VideoChatSignalR] Received RecordingWarning:", {
        sessId,
        message,
      })
      if (Number(sessId) === Number(sessionId)) {
        if (onEventReceivedRef.current) {
          onEventReceivedRef.current("RecordingWarning", { message })
        }
      }
    })

    connection.on("MediaEnded", (sessId) => {
      console.log("[VideoChatSignalR] Received MediaEnded:", { sessId })
      if (Number(sessId) === Number(sessionId)) {
        if (onEventReceivedRef.current) {
          onEventReceivedRef.current("MediaEnded", {})
        }
      }
    })

    // Picture IT Events
    connection.on("OnSyncGameState", (sessId, senderId, statePayload) => {
      if (Number(sessId) === Number(sessionId) && onEventReceivedRef.current) {
        onEventReceivedRef.current("OnSyncGameState", {
          senderId,
          statePayload,
        })
      }
    })

    connection.on("OnGameAction", (sessId, senderId, actionType, payload) => {
      if (Number(sessId) === Number(sessionId) && onEventReceivedRef.current) {
        onEventReceivedRef.current("OnGameAction", {
          senderId,
          actionType,
          payload,
        })
      }
    })

    connection
      .start()
      .then(() => {
        setIsConnected(true)
        console.log(
          "[VideoChatSignalR] Connected successfully. Joining SignalR session:",
          sessionId,
        )
        connection.invoke("JoinSession", Number(sessionId)).catch((err) => {
          console.error("[VideoChatSignalR] Failed to invoke JoinSession:", err)
        })
      })
      .catch((err) => {
        console.error("[VideoChatSignalR] Connection failed:", err)
      })

    connection.onreconnected((connectionId) => {
      console.log(
        "[VideoChatSignalR] Automatically reconnected. Re-joining SignalR session:",
        sessionId,
      )
      connection.invoke("JoinSession", Number(sessionId)).catch((err) => {
        console.error(
          "[VideoChatSignalR] Failed to re-invoke JoinSession after reconnect:",
          err,
        )
      })
    })

    connectionRef.current = connection

    return () => {
      if (connectionRef.current) {
        console.log("[VideoChatSignalR] Stopping connection...")
        connectionRef.current.stop()
      }
    }
  }, [sessionId, token])

  return { isConnected, connection: connectionRef.current }
}

export default useVideoChatSignalR
