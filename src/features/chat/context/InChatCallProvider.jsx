import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import {
  useGetConversationsQuery,
  useInitiateCallMutation,
  useJoinCallMutation,
  useEndCallMutation,
  useGetActiveIncomingCallQuery,
  useRejectCallMutation,
} from "@/store/api/social/conversationsApi"
import useConversationSignalR from "../hooks/useConversationSignalR"
import IncomingCallModal from "../components/call/IncomingCallModal"
import InChatCallModal from "../components/call/InChatCallModal"
import toast from "react-hot-toast"
import { InChatCallContext } from "./InChatCallContext.js"

/**
 * InChatCallProvider — Global provider managing in-chat LiveKit calls,
 * app-wide SignalR CallStarted/CallEnded listener, incoming call modals,
 * and persistent floating Picture-in-Picture window across routes.
 */
export const InChatCallProvider = ({ children }) => {
  const { user: authUser } = useAuth()
  const { data: userProfile } = useGetUserProfileQuery(undefined, {
    skip: !authUser,
  })

  const { data: conversationsResponse } = useGetConversationsQuery(undefined, {
    skip: !authUser,
  })

  const conversations = useMemo(() => {
    return Array.isArray(conversationsResponse)
      ? conversationsResponse
      : conversationsResponse?.data || []
  }, [conversationsResponse])

  const currentUser = useMemo(() => {
    if (!authUser) return null
    return {
      id: authUser?.accountId || authUser?.id,
      accountId: authUser?.accountId || authUser?.id,
      username: userProfile?.username || authUser?.username || "Me",
      name: userProfile?.username || authUser?.username || "Me",
      avatarImageUrl:
        userProfile?.avatarImageUrl || authUser?.avatarImageUrl || null,
      avatar: userProfile?.avatarImageUrl || authUser?.avatarImageUrl || null,
    }
  }, [authUser, userProfile])

  const [initiateCallMutation] = useInitiateCallMutation()
  const [joinCallMutation] = useJoinCallMutation()
  const [endCallMutation] = useEndCallMutation()
  const [rejectCallMutation] = useRejectCallMutation()

  const CALL_SESSION_STORAGE_KEY = "catspeak_active_inchat_call_session"

  const [activeCallSession, setActiveCallSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem("catspeak_active_inchat_call_session")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [incomingCallData, setIncomingCallData] = useState(null)
  const [isCallModalOpen, setIsCallModalOpen] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem("catspeak_active_inchat_call_session"))
    } catch {
      return false
    }
  })
  const incomingTimerRef = useRef(null)
  const declinedCallsRef = useRef(new Set())
  const declinedCallIdsRef = useRef(new Set())
  const activeCallSessionRef = useRef(activeCallSession)
  activeCallSessionRef.current = activeCallSession

  // Synchronize active call session to sessionStorage for recovery on F5 / reload
  useEffect(() => {
    try {
      if (activeCallSession && activeCallSession.token) {
        sessionStorage.setItem(
          CALL_SESSION_STORAGE_KEY,
          JSON.stringify(activeCallSession),
        )
      } else {
        sessionStorage.removeItem(CALL_SESSION_STORAGE_KEY)
      }
    } catch (err) {
      console.warn("[InChatCall] Failed to sync session to sessionStorage:", err)
    }
  }, [activeCallSession])

  // ── Recover active incoming call on F5 / reload ────────
  const { data: activeIncomingRaw, refetch: refetchActiveIncoming } =
    useGetActiveIncomingCallQuery(undefined, {
      skip: !authUser,
    })

  useEffect(() => {
    if (!activeIncomingRaw || activeCallSession || incomingCallData) return

    if (!activeIncomingRaw?.hasActiveCall) return

    const cId = Number(activeIncomingRaw.conversationId)
    const callId = activeIncomingRaw.callId
    if (!cId) return

    // If this call/conversation was already declined or dismissed, do not resurrect from cache!
    if (
      declinedCallsRef.current.has(cId) ||
      (callId && declinedCallIdsRef.current.has(callId))
    ) {
      return
    }

    const timeoutSec = Number(activeIncomingRaw.ringingTimeoutSeconds) || 45
    const elapsed = Number(activeIncomingRaw.elapsedSeconds ?? 0)

    // If waiting time is within the server ringing timeout, restore the incoming call prompt
    if (elapsed < timeoutSec) {
      const matchedConv = conversations.find(
        (c) => Number(c.conversationId || c.id) === cId,
      )

      const callerId = Number(activeIncomingRaw.callerId)
      const callerFromParticipants = matchedConv?.participants?.find(
        (p) => Number(p.accountId || p.id) === callerId,
      )
      const friend = matchedConv?.friend
      const callerUser =
        callerFromParticipants ||
        (friend && Number(friend.accountId || friend.id) === callerId
          ? friend
          : null)

      const callerName =
        activeIncomingRaw.callerName ||
        callerUser?.username ||
        friend?.username ||
        matchedConv?.name ||
        "Someone"

      const callerAvatar =
        activeIncomingRaw.callerAvatar ||
        callerUser?.avatarImageUrl ||
        friend?.avatarImageUrl ||
        null

      setIncomingCallData({
        ...activeIncomingRaw,
        conversationId: cId,
        callId: activeIncomingRaw.callId,
        callerId,
        callerName,
        callerAvatar,
        callType: activeIncomingRaw.callType || "video",
        ringingTimeoutSeconds: timeoutSec,
        elapsedSeconds: elapsed,
        conversation: matchedConv || {
          id: cId,
          conversationId: cId,
          name: callerName,
          friend: callerUser || friend,
          isGroup: matchedConv?.isGroup || false,
        },
      })
    }
  }, [activeIncomingRaw, conversations, activeCallSession, incomingCallData])

  // ── Dynamic Ringing Timeout & Missed Call Tracker ────
  useEffect(() => {
    if (incomingTimerRef.current) {
      clearTimeout(incomingTimerRef.current)
      incomingTimerRef.current = null
    }

    if (incomingCallData) {
      const timeoutSec = Number(incomingCallData.ringingTimeoutSeconds) || 45
      const elapsed = Number(incomingCallData.elapsedSeconds ?? 0)
      const remainingMs = Math.max(1, timeoutSec - elapsed) * 1000

      incomingTimerRef.current = setTimeout(() => {
        setIncomingCallData(null)
        toast("Cuộc gọi nhỡ", { icon: "📞" })
      }, remainingMs)
    }

    return () => {
      if (incomingTimerRef.current) {
        clearTimeout(incomingTimerRef.current)
        incomingTimerRef.current = null
      }
    }
  }, [incomingCallData])

  // Global SignalR event listener for incoming & ended calls
  const signalRHandlers = useMemo(
    () => ({
      CallStarted: (payload) => {
        const cId = Number(payload?.conversationId)
        const callerId = Number(payload?.callerId)
        const myId = Number(currentUser?.id || currentUser?.accountId)

        // Don't ring self if outgoing call was started from another tab
        if (callerId === myId) return

        // If currently in an active call, ignore incoming calls
        if (activeCallSession) return

        // Resolve conversation and caller details from cached conversation list
        const matchedConv = conversations.find(
          (c) => Number(c.conversationId || c.id) === cId,
        )

        const callerFromParticipants = matchedConv?.participants?.find(
          (p) => Number(p.accountId || p.id) === callerId,
        )
        const friend = matchedConv?.friend

        const callerUser =
          callerFromParticipants ||
          (friend && Number(friend.accountId || friend.id) === callerId
            ? friend
            : null)

        const callerName =
          payload?.callerName ||
          callerUser?.username ||
          callerUser?.name ||
          friend?.username ||
          matchedConv?.name ||
          "Someone"

        const callerAvatar =
          payload?.callerAvatar ||
          callerUser?.avatarImageUrl ||
          callerUser?.avatar ||
          friend?.avatarImageUrl ||
          friend?.avatar ||
          null

        setIncomingCallData({
          ...payload,
          conversationId: cId,
          callerId,
          callerName,
          callerAvatar,
          callType: payload?.callType || payload?.type || "video",
          elapsedSeconds: 0,
          conversation: matchedConv || {
            id: cId,
            conversationId: cId,
            name: callerName,
            friend: callerUser || friend,
            isGroup: matchedConv?.isGroup || false,
          },
        })
      },
      CallRejected: (payload) => {
        const cId = Number(
          payload?.conversationId ??
            payload?.ConversationId ??
            payload?.data?.conversationId,
        )
        const callId =
          payload?.callId ?? payload?.CallId ?? payload?.data?.callId
        const rejectedByAccountId = Number(
          payload?.rejectedByAccountId ??
            payload?.RejectedByAccountId ??
            payload?.rejectedBy ??
            payload?.userId,
        )
        const myId = Number(currentUser?.id || currentUser?.accountId)

        const matchedConv = conversations.find(
          (c) => Number(c.conversationId || c.id) === cId,
        )
        const currentSession = activeCallSessionRef.current
        const isGroup =
          Boolean(payload?.isGroup) ||
          Boolean(matchedConv?.isGroup) ||
          Boolean(currentSession?.conversation?.isGroup)

        // In GROUP calls:
        // One member declining only affects that specific member!
        // It must NOT cancel the call for the initiator or close the call for other participants.
        if (isGroup) {
          if (rejectedByAccountId && rejectedByAccountId === myId) {
            if (cId) declinedCallsRef.current.add(cId)
            if (callId) declinedCallIdsRef.current.add(callId)
            setIncomingCallData((prev) => {
              if (!prev) return null
              const prevCId = Number(prev.conversationId)
              if (!cId || prevCId === cId) return null
              return prev
            })
          }
          return
        }

        // In 1-ON-1 calls:
        // The other participant rejected, terminate the call immediately
        if (cId) declinedCallsRef.current.add(cId)
        if (callId) declinedCallIdsRef.current.add(callId)

        // Close incoming call popup if open for this conversation
        setIncomingCallData((prev) => {
          if (!prev) return null
          const prevCId = Number(prev.conversationId)
          if (!cId || prevCId === cId) return null
          return prev
        })

        // If caller (initiator) is in a call modal, close it immediately!
        if (
          currentSession &&
          (!cId || Number(currentSession.conversationId) === cId)
        ) {
          activeCallSessionRef.current = null
          setIsCallModalOpen(false)
          setActiveCallSession(null)
        }
      },
      CallEnded: (payload) => {
        const cId = Number(
          payload?.conversationId ??
            payload?.ConversationId ??
            payload?.data?.conversationId,
        )
        const callId =
          payload?.callId ?? payload?.CallId ?? payload?.data?.callId
        const reason =
          payload?.reason ?? payload?.Reason ?? payload?.data?.reason ?? ""

        const isDeclined =
          reason === "declined" ||
          reason === "rejected" ||
          (cId && declinedCallsRef.current.has(cId)) ||
          (callId && declinedCallIdsRef.current.has(callId))

        if (cId) declinedCallsRef.current.add(cId)
        if (callId) declinedCallIdsRef.current.add(callId)

        setIncomingCallData((prev) => {
          if (!prev) return null
          const prevCId = Number(prev.conversationId)
          if (!cId || prevCId === cId) {
            if (
              !isDeclined &&
              (reason === "timeout" || reason === "missed")
            ) {
              toast("Cuộc gọi nhỡ", { icon: "📞" })
            }
            return null
          }
          return prev
        })

        const currentSession = activeCallSessionRef.current
        if (
          currentSession &&
          (!cId || Number(currentSession.conversationId) === cId)
        ) {
          try {
            sessionStorage.removeItem(CALL_SESSION_STORAGE_KEY)
          } catch {}
          activeCallSessionRef.current = null
          setIsCallModalOpen(false)
          setActiveCallSession(null)
          if (!isDeclined && (reason === "timeout" || reason === "missed")) {
            toast("Không có người trả lời", { icon: "📞" })
          }
          // Intentionally no toast for "Cuộc gọi đã kết thúc" (the call has ended)
        }
      },
    }),
    [conversations, currentUser],
  )
  useConversationSignalR(signalRHandlers)

  /**
   * Starts a call for a specific conversation and freezes conversation data into activeCallSession.
   */
  const startCall = useCallback(
    async (targetConversation, callType = "video") => {
      const convId =
        targetConversation?.id || targetConversation?.conversationId
      if (!convId) {
        console.warn("[InChatCall] Cannot start call: no conversationId")
        return
      }

      try {
        declinedCallsRef.current.delete(Number(convId))
        const res = await initiateCallMutation({
          conversationId: convId,
          callType,
        }).unwrap()

        const session = res?.data || res
        const token = session?.token || session?.livekitToken
        const serverUrl =
          session?.serverUrl ||
          session?.liveKitServerUrl ||
          import.meta.env.VITE_LIVEKIT_URL ||
          "wss://livekit.catspeak.com.vn"

        if (!token) {
          toast.error("Failed to acquire call token")
          return
        }

        const newSession = {
          token,
          serverUrl,
          callType,
          roomName: session?.roomName || `conv-${convId}`,
          isInitiator: true,
          conversation: targetConversation, // Frozen at call start!
          conversationId: convId,
        }
        activeCallSessionRef.current = newSession
        setActiveCallSession(newSession)
        setIsCallModalOpen(true)
      } catch (err) {
        console.error("Failed to initiate call:", err)
        toast.error(err?.data?.message || "Failed to start call")
      }
    },
    [initiateCallMutation],
  )

  /**
   * Joins an active call for a specific conversation.
   */
  const joinCall = useCallback(
    async (targetConversation, activeCallInfo) => {
      const convId =
        targetConversation?.id ||
        targetConversation?.conversationId ||
        activeCallInfo?.conversationId
      if (!convId) return

      try {
        declinedCallsRef.current.delete(Number(convId))
        const res = await joinCallMutation(convId).unwrap()
        const session = res?.data || res
        const token = session?.token || session?.livekitToken
        const serverUrl =
          session?.serverUrl ||
          session?.liveKitServerUrl ||
          import.meta.env.VITE_LIVEKIT_URL ||
          "wss://livekit.catspeak.com.vn"

        if (!token) {
          toast.error("Failed to acquire join token")
          return
        }

        const callType =
          activeCallInfo?.callType || activeCallInfo?.type || "video"

        const newSession = {
          token,
          serverUrl,
          callType,
          roomName: session?.roomName || `conv-${convId}`,
          isInitiator: false,
          conversation: targetConversation, // Frozen at call join!
          conversationId: convId,
        }
        activeCallSessionRef.current = newSession
        setActiveCallSession(newSession)
        setIncomingCallData(null)
        setIsCallModalOpen(true)
      } catch (err) {
        console.error("Failed to join call:", err)
        toast.error(err?.data?.message || "Failed to join call")
      }
    },
    [joinCallMutation],
  )

  /**
   * Accepts the incoming call and initiates joining.
   */
  const acceptIncomingCall = useCallback(
    async (callData) => {
      const target = callData || incomingCallData
      if (!target) return
      const conv = target.conversation || {
        id: target.conversationId,
        conversationId: target.conversationId,
        name: target.callerName,
      }
      await joinCall(conv, target)
    },
    [incomingCallData, joinCall],
  )

  /**
   * Declines the incoming call prompt, notifying backend via reject endpoint.
   */
  const declineIncomingCall = useCallback(
    async (reason = "rejected") => {
      if (incomingCallData) {
        const cId = Number(incomingCallData.conversationId)
        const callId = incomingCallData.callId
        if (cId) declinedCallsRef.current.add(cId)
        if (callId) declinedCallIdsRef.current.add(callId)

        if (incomingTimerRef.current) {
          clearTimeout(incomingTimerRef.current)
          incomingTimerRef.current = null
        }
        const callToReject = incomingCallData
        setIncomingCallData(null)

        try {
          if (cId) {
            await rejectCallMutation({
              conversationId: cId,
              callId: callToReject.callId,
              reason: typeof reason === "string" ? reason : "rejected",
            }).unwrap()
          }
          refetchActiveIncoming?.()
        } catch (err) {
          console.warn("[InChatCall] Reject call error:", err)
        } finally {
          setTimeout(() => {
            if (cId) declinedCallsRef.current.delete(cId)
            if (callId) declinedCallIdsRef.current.delete(callId)
          }, 15000)
        }
      } else {
        setIncomingCallData(null)
      }
    },
    [incomingCallData, rejectCallMutation, refetchActiveIncoming],
  )

  /**
   * Terminates the active call on the backend and closes the modal.
   */
  const endCall = useCallback(async () => {
    const currentSession = activeCallSessionRef.current || activeCallSession
    const convId = currentSession?.conversationId
    const isGroup = Boolean(currentSession?.conversation?.isGroup)
    try {
      sessionStorage.removeItem(CALL_SESSION_STORAGE_KEY)
    } catch {}
    try {
      if (convId) {
        await endCallMutation({
          conversationId: convId,
          // In group calls, a participant leaving must NOT force-kill the room for other participants!
          forceEnd: isGroup ? false : (currentSession?.isInitiator ?? false),
        }).unwrap()
      }
    } catch (err) {
      console.error("Error notifying end call:", err)
    } finally {
      activeCallSessionRef.current = null
      setIsCallModalOpen(false)
      setActiveCallSession(null)
    }
  }, [activeCallSession, endCallMutation])

  const closeCallModal = useCallback(() => {
    try {
      sessionStorage.removeItem(CALL_SESSION_STORAGE_KEY)
    } catch {}
    activeCallSessionRef.current = null
    setIsCallModalOpen(false)
    setActiveCallSession(null)
  }, [])

  const contextValue = useMemo(
    () => ({
      activeCallSession,
      incomingCallData,
      isCallModalOpen,
      currentUser,
      startCall,
      joinCall,
      acceptIncomingCall,
      declineIncomingCall,
      endCall,
      closeCallModal,
    }),
    [
      activeCallSession,
      incomingCallData,
      isCallModalOpen,
      currentUser,
      startCall,
      joinCall,
      acceptIncomingCall,
      declineIncomingCall,
      endCall,
      closeCallModal,
    ],
  )

  return (
    <InChatCallContext.Provider value={contextValue}>
      {children}

      {/* Global Incoming Call Popup — triggers anywhere across the entire application */}
      <IncomingCallModal
        open={Boolean(incomingCallData)}
        callData={incomingCallData}
        onAccept={acceptIncomingCall}
        onDecline={declineIncomingCall}
      />

      {/* Global In-Chat Call Modal / Floating PiP Window — persists across navigation */}
      <InChatCallModal
        open={isCallModalOpen}
        onClose={closeCallModal}
        callSession={activeCallSession}
        onEndCall={endCall}
        conversation={activeCallSession?.conversation}
        currentUser={currentUser}
      />
    </InChatCallContext.Provider>
  )
}

export default InChatCallProvider
