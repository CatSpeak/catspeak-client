import { useState, useMemo } from "react"
import { Phone, Video, PhoneCall } from "lucide-react"
import { useGetActiveCallQuery } from "@/store/api/social/conversationsApi"
import useConversationSignalR from "../../hooks/useConversationSignalR"
import { PillButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * ActiveCallBanner — Shows an ongoing call alert banner under ChatHeader
 * with a quick "Join Call" action.
 */
const ActiveCallBanner = ({
  conversationId,
  onJoinCall,
  isCallModalOpen = false,
}) => {
  const { t } = useLanguage()

  const { data: rawActiveCall, refetch } = useGetActiveCallQuery(
    conversationId,
    {
      skip: !conversationId,
      pollingInterval: 10000,
    },
  )

  const [signalRCallActive, setSignalRCallActive] = useState(null)

  // Listen to CallStarted & CallEnded SignalR events
  const signalRHandlers = useMemo(
    () => ({
      CallStarted: (payload) => {
        if (Number(payload?.conversationId) === Number(conversationId)) {
          setSignalRCallActive(payload)
          refetch()
        }
      },
      CallEnded: (payload) => {
        if (Number(payload?.conversationId) === Number(conversationId)) {
          setSignalRCallActive(null)
          refetch()
        }
      },
    }),
    [conversationId, refetch],
  )
  useConversationSignalR(signalRHandlers)

  const activeCall =
    signalRCallActive ||
    (rawActiveCall?.isActive || rawActiveCall?.data?.isActive
      ? rawActiveCall?.data || rawActiveCall
      : null)

  // Don't render banner if no active call or user is already in the call modal
  if (!activeCall || isCallModalOpen) {
    return null
  }

  const isVideo =
    activeCall.callType === "video" ||
    activeCall.type === "video" ||
    activeCall.isVideo

  return (
    <div className="mx-4 mt-2 mb-1 p-3 bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/10 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white shadow-sm shrink-0">
          {isVideo ? <Video size={20} /> : <Phone size={20} />}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
            {isVideo
              ? t?.chat?.call?.activeVideoCall || "Ongoing Video Call"
              : t?.chat?.call?.activeAudioCall || "Ongoing Voice Call"}
          </p>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 truncate">
            {activeCall.callerName
              ? `${t?.chat?.call?.startedBy || "Started by"} ${activeCall.callerName}`
              : t?.chat?.call?.inProgress || "Call is currently in progress..."}
          </p>
        </div>
      </div>

      <PillButton
        size="sm"
        variant="primary"
        onClick={() => onJoinCall(activeCall)}
        className="!bg-emerald-600 hover:!bg-emerald-700 shrink-0 font-semibold"
        startIcon={<PhoneCall size={14} />}
      >
        {t?.chat?.call?.joinCall || "Join Call"}
      </PillButton>
    </div>
  )
}

export default ActiveCallBanner
