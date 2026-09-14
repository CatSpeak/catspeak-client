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
export const useVideoChatSignalR = (sessionId, token, onEventReceived, roomId) => {
  const [isConnected, setIsConnected] = useState(false)
  const connectionRef = useRef(null)
  const onEventReceivedRef = useRef(onEventReceived)

  useEffect(() => {
    onEventReceivedRef.current = onEventReceived
  }, [onEventReceived])

  useEffect(() => {
    if (!token) {
      console.warn(
        "[VideoChatSignalR] Missing token — skipping hub instantiation.",
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

    // Ticket 01: room governance group + settings event.
    connection.on("RoomSettingsChanged", (changedRoomId, settings) => {
      if (
        Number(changedRoomId) === Number(roomId) &&
        onEventReceivedRef.current
      ) {
        onEventReceivedRef.current("RoomSettingsChanged", {
          roomId: changedRoomId,
          settings,
        })
      }
    })

    // Ticket 03: co-host assignment/permission change (null on revoke).
    connection.on("CoHostChanged", (changedRoomId, coHost) => {
      if (
        Number(changedRoomId) === Number(roomId) &&
        onEventReceivedRef.current
      ) {
        onEventReceivedRef.current("CoHostChanged", {
          roomId: changedRoomId,
          coHost,
        })
      }
    })

    // Ticket 04: host/co-host waiting queue changed in real time.
    connection.on("WaitingQueueChanged", (changedRoomId, queue) => {
      if (
        (String(changedRoomId) === String(roomId) ||
          Number(changedRoomId) === Number(roomId)) &&
        onEventReceivedRef.current
      ) {
        onEventReceivedRef.current("WaitingQueueChanged", {
          roomId: changedRoomId,
          queue,
        })
      }
    })

    // Ticket 04: personal waiting outcomes (user_{accountId}), no room filter —
    // the account can only be waiting in one room at a time.
    connection.on("WaitingAdmitted", (changedRoomId, entry) => {
      onEventReceivedRef.current?.("WaitingAdmitted", {
        roomId: changedRoomId,
        entry,
      })
    })

    connection.on("WaitingRejected", (changedRoomId, entry) => {
      onEventReceivedRef.current?.("WaitingRejected", {
        roomId: changedRoomId,
        entry,
      })
    })

    connection.on("WaitingCancelled", (changedRoomId, entry) => {
      onEventReceivedRef.current?.("WaitingCancelled", {
        roomId: changedRoomId,
        entry,
      })
    })

    const joinGroups = () => {
      if (sessionId) {
        connection.invoke("JoinSession", Number(sessionId)).catch((err) => {
          console.error("[VideoChatSignalR] Failed to invoke JoinSession:", err)
        })
      }
      if (roomId) {
        connection.invoke("JoinRoom", Number(roomId)).catch((err) => {
          console.error("[VideoChatSignalR] Failed to invoke JoinRoom:", err)
        })
      }
    }

    connection
      .start()
      .then(() => {
        setIsConnected(true)
        console.log(
          "[VideoChatSignalR] Connected successfully. Joining session/room:",
          sessionId,
          roomId,
        )
        joinGroups()
      })
      .catch((err) => {
        console.error("[VideoChatSignalR] Connection failed:", err)
      })

    connection.onreconnected((connectionId) => {
      console.log(
        "[VideoChatSignalR] Automatically reconnected. Re-joining session/room:",
        sessionId,
        roomId,
      )
      joinGroups()
    })

    connectionRef.current = connection

    return () => {
      if (connectionRef.current) {
        console.log("[VideoChatSignalR] Stopping connection...")
        connectionRef.current.stop()
      }
    }
  }, [sessionId, token, roomId])

  return { isConnected, connection: connectionRef.current }
}

export default useVideoChatSignalR
