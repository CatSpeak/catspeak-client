import React, { useEffect, useState, useMemo, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { QueueStatusCard } from "@/features/queue"
import PillButton from "@/shared/components/ui/buttons/PillButton"

import { MainLogo, MainLogoDark } from "@/shared/assets/icons/logo"

import { useQueueSignaling } from "@/features/queue"
const QueuePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()

  // Queue preferences passed from QueueModal via route state
  const queuePreferences = location.state
  const roomType = queuePreferences?.roomType || "OneToOne"
  // ISS-88: direct navigation / F5 has no route state — never join(null).
  const hasQueueParams = Boolean(
    location.state &&
      (location.state.roomType ||
        location.state.language ||
        location.state.targetLanguage),
  )
  const communityLang =
    (typeof window !== "undefined" &&
      localStorage.getItem("communityLanguage")) ||
    "en"

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
            navigate(`/${communityLang}/meet/${data.roomId}`, {
              state: { fromQueue: true },
            })
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
    [navigate],
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
    if (!hasQueueParams) return
    if (isConnected && !hasJoinedSignalR && !joinAttemptedRef.current) {
      // eslint-disable-next-line react-hooks/immutability -- one-shot guard for the join attempt
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
  }, [isConnected, hasJoinedSignalR, joinQueue, queuePreferences, hasQueueParams])

  const handleCancel = async () => {
    try {
      await leaveQueue() // SignalR leave
    } catch (err) {
      console.error("Failed to leave queue", err)
    }
    if (typeof window !== "undefined" && window.history.length <= 1) {
      navigate(`/${communityLang}/community`)
    } else {
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
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-white to-[#FFBBC3] dark:from-[#0F0F0F] dark:to-[#241014] text-textColor dark:text-white px-4">
      {/* Logo */}
      <div className="absolute top-4 left-5 z-10">
        {/* <div className="bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-white/50"> */}
        <img
          src={MainLogo}
          alt="Cat Speak Logo"
          className="sm:h-12 h-9 w-auto object-contain dark:hidden"
        />
        <img
          src={MainLogoDark}
          alt="Cat Speak Logo"
          className="sm:h-12 h-9 w-auto object-contain hidden dark:block"
        />
        {/* </div> */}
      </div>

      {hasQueueParams ? (
        <QueueStatusCard
          statusText={statusText}
          isConnected={isConnected}
          position={position}
          onCancel={handleCancel}
          roomType={roomType}
        />
      ) : (
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] shadow-xl p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.rooms?.queue?.missingParamsTitle ||
              "Bạn chưa chọn tiêu chí ghép cặp"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#AAAAAA]">
            {t.rooms?.queue?.missingParamsDesc ||
              "Bạn cần chọn ngôn ngữ và chủ đề từ trang Cộng đồng để bắt đầu ghép cặp."}
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <PillButton
              onClick={() => navigate(`/${communityLang}/community`)}
            >
              {t.rooms?.queue?.chooseInCommunity || "Chọn phòng ở Cộng đồng"}
            </PillButton>
            <PillButton variant="secondary" onClick={handleCancel}>
              {t.rooms?.queue?.cancel || "Hủy"}
            </PillButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default QueuePage
