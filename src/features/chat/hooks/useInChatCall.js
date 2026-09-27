import { useState, useMemo, useCallback } from "react"
import {
  useInitiateCallMutation,
  useJoinCallMutation,
  useEndCallMutation,
} from "@/store/api/social/conversationsApi"
import useConversationSignalR from "./useConversationSignalR"
import toast from "react-hot-toast"

/**
 * useInChatCall — Custom hook managing in-chat LiveKit voice & video calls,
 * incoming call prompts, and real-time SignalR call lifecycle events.
 */
export default function useInChatCall(conversationId, currentUser) {
  const [initiateCallMutation] = useInitiateCallMutation()
  const [joinCallMutation] = useJoinCallMutation()
  const [endCallMutation] = useEndCallMutation()

  const [activeCallSession, setActiveCallSession] = useState(null)
  const [incomingCallData, setIncomingCallData] = useState(null)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)

  // Listen to Call events via SignalR
  const signalRHandlers = useMemo(
    () => ({
      CallStarted: (payload) => {
        const cId = Number(payload?.conversationId)
        const callerId = Number(payload?.callerId)
        const myId = Number(currentUser?.id || currentUser?.accountId)

        if (cId === Number(conversationId) && callerId !== myId) {
          setIncomingCallData(payload)
        }
      },
      CallEnded: (payload) => {
        const cId = Number(payload?.conversationId)
        if (cId === Number(conversationId)) {
          setIncomingCallData(null)
          if (isCallModalOpen) {
            toast("Call ended", { icon: "📞" })
            setIsCallModalOpen(false)
            setActiveCallSession(null)
          }
        }
      },
    }),
    [conversationId, currentUser, isCallModalOpen],
  )
  useConversationSignalR(signalRHandlers)

  const handleStartCall = useCallback(
    async (callType = "video") => {
      if (!conversationId) return

      try {
        const res = await initiateCallMutation({
          conversationId,
          callType,
        }).unwrap()

        const session = res?.data || res
        const token = session?.token || session?.livekitToken
        const serverUrl =
          session?.serverUrl ||
          session?.liveKitServerUrl ||
          import.meta.env.VITE_LIVEKIT_URL

        if (!token) {
          toast.error("Failed to acquire call token")
          return
        }

        setActiveCallSession({
          token,
          serverUrl,
          callType,
          roomName: session?.roomName || `conv-${conversationId}`,
          isInitiator: true,
        })
        setIsCallModalOpen(true)
      } catch (err) {
        console.error("Failed to initiate call:", err)
        toast.error(err?.data?.message || "Failed to start call")
      }
    },
    [conversationId, initiateCallMutation],
  )

  const handleJoinCall = useCallback(
    async (activeCallInfo) => {
      if (!conversationId) return

      try {
        const res = await joinCallMutation(conversationId).unwrap()
        const session = res?.data || res
        const token = session?.token || session?.livekitToken
        const serverUrl =
          session?.serverUrl ||
          session?.liveKitServerUrl ||
          import.meta.env.VITE_LIVEKIT_URL

        if (!token) {
          toast.error("Failed to acquire join token")
          return
        }

        const callType =
          activeCallInfo?.callType || activeCallInfo?.type || "video"

        setActiveCallSession({
          token,
          serverUrl,
          callType,
          roomName: session?.roomName || `conv-${conversationId}`,
          isInitiator: false,
        })
        setIncomingCallData(null)
        setIsCallModalOpen(true)
      } catch (err) {
        console.error("Failed to join call:", err)
        toast.error(err?.data?.message || "Failed to join call")
      }
    },
    [conversationId, joinCallMutation],
  )

  const handleAcceptIncomingCall = useCallback(
    async (callData) => {
      await handleJoinCall(callData)
    },
    [handleJoinCall],
  )

  const handleDeclineIncomingCall = useCallback(() => {
    setIncomingCallData(null)
  }, [])

  const handleEndCall = useCallback(async () => {
    try {
      if (conversationId) {
        await endCallMutation({
          conversationId,
          forceEnd: activeCallSession?.isInitiator ?? false,
        }).unwrap()
      }
    } catch (err) {
      console.error("Error notifying end call:", err)
    } finally {
      setIsCallModalOpen(false)
      setActiveCallSession(null)
    }
  }, [conversationId, activeCallSession, endCallMutation])

  return {
    activeCallSession,
    incomingCallData,
    isCallModalOpen,
    startCall: handleStartCall,
    joinCall: handleJoinCall,
    acceptIncomingCall: handleAcceptIncomingCall,
    declineIncomingCall: handleDeclineIncomingCall,
    endCall: handleEndCall,
    closeCallModal: () => setIsCallModalOpen(false),
  }
}
