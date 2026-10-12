import React, {
  useState,
  useMemo,
  useCallback,
} from "react"
import { useAuth } from "@/features/auth"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import {
  useGetConversationsQuery,
  useInitiateCallMutation,
  useJoinCallMutation,
  useEndCallMutation,
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

  const [activeCallSession, setActiveCallSession] = useState(null)
  const [incomingCallData, setIncomingCallData] = useState(null)
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)

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
          conversation: matchedConv || {
            id: cId,
            conversationId: cId,
            name: callerName,
            friend: callerUser || friend,
            isGroup: matchedConv?.isGroup || false,
          },
        })
      },
      CallEnded: (payload) => {
        const cId = Number(payload?.conversationId)
        if (
          incomingCallData &&
          Number(incomingCallData.conversationId) === cId
        ) {
          setIncomingCallData(null)
        }
        if (
          activeCallSession &&
          Number(activeCallSession.conversationId) === cId
        ) {
          toast("Call ended", { icon: "📞" })
          setIsCallModalOpen(false)
          setActiveCallSession(null)
        }
      },
    }),
    [conversations, currentUser, activeCallSession, incomingCallData],
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

        setActiveCallSession({
          token,
          serverUrl,
          callType,
          roomName: session?.roomName || `conv-${convId}`,
          isInitiator: true,
          conversation: targetConversation, // Frozen at call start!
          conversationId: convId,
        })
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

        setActiveCallSession({
          token,
          serverUrl,
          callType,
          roomName: session?.roomName || `conv-${convId}`,
          isInitiator: false,
          conversation: targetConversation, // Frozen at call join!
          conversationId: convId,
        })
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
   * Declines the incoming call prompt.
   */
  const declineIncomingCall = useCallback(() => {
    setIncomingCallData(null)
  }, [])

  /**
   * Terminates the active call on the backend and closes the modal.
   */
  const endCall = useCallback(async () => {
    const convId = activeCallSession?.conversationId
    try {
      if (convId) {
        await endCallMutation({
          conversationId: convId,
          forceEnd: activeCallSession?.isInitiator ?? false,
        }).unwrap()
      }
    } catch (err) {
      console.error("Error notifying end call:", err)
    } finally {
      setIsCallModalOpen(false)
      setActiveCallSession(null)
    }
  }, [activeCallSession, endCallMutation])

  const closeCallModal = useCallback(() => {
    setIsCallModalOpen(false)
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
