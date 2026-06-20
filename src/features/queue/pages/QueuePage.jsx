import React, { useEffect, useState, useMemo, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { QueueStatusCard } from "@/features/queue"

import Logo from "@/shared/assets/icons/logo/logo.svg"

import { useQueueSignaling } from "@/features/queue"
const QueuePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()

  // Queue preferences passed from QueueModal via route state
  const queuePreferences = location.state
  const roomType = queuePreferences?.roomType || "OneToOne"

  const [queueState, setQueueState] = useState({ type: "CONNECTING" })
  const [position, setPosition] = useState(0)
  const [hasJoinedSignalR, setHasJoinedSignalR] = useState(false)
  const handlers = useMemo(
    () => ({
      MatchFound: (data) => {
        setQueueState({ type: "MATCHED" })
        if (data.roomId) {
          // Play notification sound?
          setTimeout(() => {
            const communityLang =
              localStorage.getItem("communityLanguage") || "en"
            navigate(`/${communityLang}/meet/${data.roomId}`, { state: { fromQueue: true } })
          }, 1000)
        }
      },
      QueueJoined: (data) => {
        setQueueState({ type: "WAITING" })
        if (data && data.position) setPosition(data.position)
        setHasJoinedSignalR(true)
      },
      QueueStatus: (data) => {
        // Handle periodic updates if manually invoked or pushed
        // console.log("queue status update:", data)
        if (data) {
          if (data.position) setPosition(data.position)
        }
      },
      QueueError: (msg) => {
        console.error("Queue Error:", msg)
        setQueueState({ type: "ERROR", message: msg })
      },
      OnReconnected: () => {
        // Explicitly re-join because server removes user on disconnect
        // We can't call joinQueue() directly here because it's not in scope of useMemo
        // But we can trigger a state change or dependency.
        setHasJoinedSignalR(false)
      },
    }),
    [navigate, t],
  )

  const { isConnected, joinQueue, leaveQueue } = useQueueSignaling(handlers)

  // Reset join attempt ref if disconnected
  useEffect(() => {
    if (!isConnected) {
      joinAttemptedRef.current = false
      setHasJoinedSignalR(false)
    }
  }, [isConnected])

  const joinAttemptedRef = useRef(false)

  useEffect(() => {
    // Connect first (handled by hook mount)
    if (isConnected && !hasJoinedSignalR && !joinAttemptedRef.current) {
      joinAttemptedRef.current = true // Mark as attempted immediately

      const initQueue = async () => {
        try {
          await joinQueue(queuePreferences)
          // Success handled in 'QueueJoined' event
        } catch (err) {
          console.error("Failed to join queue:", err)
          joinAttemptedRef.current = false
        }
      }
      initQueue()
    }
  }, [isConnected, hasJoinedSignalR, joinQueue])

  const handleCancel = async () => {
    try {
      await leaveQueue() // SignalR leave
      navigate(-1)
    } catch (err) {
      console.error("Failed to leave queue", err)
      navigate(-1)
    }
  }

  const getStatusText = () => {
    switch (queueState.type) {
      case "WAITING":
        return t.rooms.queue.waitingForPairing
      case "MATCHED":
        return t.rooms.queue.matchFound
      case "ERROR":
        return t.rooms.queue.error.replace("{{msg}}", queueState.message)
      case "CONNECTING":
      default:
        return t.rooms.queue.connectingToQueue
    }
  }

  const statusText = getStatusText()

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-cath-red-500 via-cath-red-700 to-[#f08d1d] text-textColor px-4">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/50">
          <img
            src={Logo}
            alt="Cat Speak Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>

      <QueueStatusCard
        statusText={statusText}
        isConnected={isConnected}
        position={position}
        onCancel={handleCancel}
        roomType={roomType}
      />
    </div>
  )
}

export default QueuePage
