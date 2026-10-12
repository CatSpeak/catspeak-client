import { useState, useMemo, useContext } from "react"
import { Phone, Video, PhoneCall } from "lucide-react"
import { useGetActiveCallQuery } from "@/store/api/social/conversationsApi"
import useConversationSignalR from "../../hooks/useConversationSignalR"
import { InChatCallContext } from "../../context/InChatCallContext"
import { VideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { PillButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * ActiveCallBanner — Shows an ongoing call alert banner under ChatHeader
 * with a quick "Join Call" action.
 */
const ActiveCallBanner = ({
  conversationId,
  isGroup = false,
  onJoinCall,
  isCallModalOpen = false,
}) => {
  const { t } = useLanguage()
  const inChatCallContext = useContext(InChatCallContext)
  const videoCallContext = useContext(VideoCallContext)

  const { data: rawActiveCall, refetch } = useGetActiveCallQuery(
    conversationId,
    {
      skip: !conversationId || !isGroup,
      pollingInterval: 10000,
    },
  )

  const [signalRCallActive, setSignalRCallActive] = useState(null)

  // Listen to CallStarted & CallEnded SignalR events
  const signalRHandlers = useMemo(
    () => ({
      CallStarted: (payload) => {
        const payloadConvId =
          payload?.conversationId ??
          payload?.ConversationId ??
          payload?.data?.conversationId
        if (
          String(payloadConvId) === String(conversationId) ||
          Number(payloadConvId) === Number(conversationId)
        ) {
          setSignalRCallActive(payload?.data || payload)
          refetch()
        }
      },
      CallEnded: (payload) => {
        const payloadConvId =
          payload?.conversationId ??
          payload?.ConversationId ??
          payload?.data?.conversationId
        if (
          String(payloadConvId) === String(conversationId) ||
          Number(payloadConvId) === Number(conversationId)
        ) {
          setSignalRCallActive(null)
          refetch()
        }
      },
    }),
    [conversationId, refetch],
  )
  useConversationSignalR(signalRHandlers)

  const activeCall = useMemo(() => {
    if (signalRCallActive) return signalRCallActive

    const callObj = rawActiveCall?.data ?? rawActiveCall
    if (!callObj || typeof callObj !== "object") return null

    // Explicitly inactive flags
    if (
      callObj.isActive === false ||
      callObj.hasActiveCall === false ||
      callObj.isCallActive === false ||
      callObj.hasActive === false
    ) {
      return null
    }

    // Active if explicit flag is true
    if (
      callObj.isActive === true ||
      callObj.hasActiveCall === true ||
      callObj.isCallActive === true
    ) {
      return callObj
    }

    // Active if it contains call identification (callId, roomName, token, or non-empty participants)
    if (
      callObj.callId ||
      callObj.CallId ||
      callObj.roomName ||
      callObj.RoomName ||
      callObj.token ||
      (Array.isArray(callObj.participants) && callObj.participants.length > 0)
    ) {
      return callObj
    }

    return null
  }, [signalRCallActive, rawActiveCall])

  const isInCall =
    Boolean(inChatCallContext?.activeCallSession) ||
    Boolean(inChatCallContext?.isCallModalOpen) ||
    Boolean(isCallModalOpen) ||
    Boolean(videoCallContext?.isInCall)

  const isIncomingCall = Boolean(inChatCallContext?.incomingCallData)

  // Don't render banner if not group chat, no active call, user is in a call, or incoming call modal is showing
  if (!isGroup || !activeCall || isInCall || isIncomingCall) {
    return null
  }

  const isVideo =
    activeCall.callType === "video" ||
    activeCall.type === "video" ||
    activeCall.isVideo

  const callerDisplayName =
    activeCall.callerName ||
    activeCall.callerUsername ||
    activeCall.initiatorName ||
    (Array.isArray(activeCall.participants) &&
      (activeCall.participants[0]?.name ||
        activeCall.participants[0]?.username)) ||
    ""

  return (
    <div className="flex gap-4 justify-between px-4 h-[72px] items-center border-b border-border">
      <div className="flex items-center gap-4 min-w-0">
        {isVideo ? <Video /> : <Phone />}

        <div className="min-w-0">
          <p className="truncate">
            {isVideo
              ? t?.chat?.call?.activeVideoCall || "Ongoing Video Call"
              : t?.chat?.call?.activeAudioCall || "Ongoing Voice Call"}
          </p>
          <p className="text-sm text-secondary truncate">
            {callerDisplayName
              ? `${t?.chat?.call?.startedBy || "Started by"} ${callerDisplayName}`
              : t?.chat?.call?.inProgress || "Call is currently in progress..."}
          </p>
        </div>
      </div>

      <PillButton
        variant="primary"
        onClick={() => onJoinCall(activeCall)}
        className="shrink-0 font-semibold"
      >
        {t?.chat?.call?.joinCall || "Join Call"}
      </PillButton>
    </div>
  )
}

export default ActiveCallBanner
