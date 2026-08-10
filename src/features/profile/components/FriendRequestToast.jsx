import React, { useState } from "react"
import toast from "react-hot-toast"
import { Check, X, Loader2 } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { useLanguage } from "@/shared/context/LanguageContext"

const FriendRequestToast = ({
  toastInstance,
  friendshipId,
  sender,
  onRespond,
  onClose,
}) => {
  const { t } = useLanguage()
  const [loadingAction, setLoadingAction] = useState(null) // "accept" | "decline" | null

  const displayName = sender?.nickname || sender?.username || "Ai đó"
  const avatarUrl = sender?.avatarImageUrl || sender?.avatarUrl

  const handleAction = async (action) => {
    if (loadingAction) return
    setLoadingAction(action)
    try {
      if (onRespond) {
        await onRespond(action)
      }
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDismiss = () => {
    if (onClose) {
      onClose()
    } else {
      toast.dismiss(toastInstance.id)
    }
  }

  return (
    <div
      className={`${
        toastInstance?.visible ? "animate-enter" : "animate-leave"
      } max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto border border-gray-100 p-4 transition-all duration-200 overflow-hidden`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <Avatar
            size={44}
            src={avatarUrl}
            name={displayName}
            accountId={sender?.accountId}
            className="w-11 h-11 ring-2 ring-cath-red-100 shadow-sm"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {t.profile?.social?.friendRequestReceived ||
              "đã gửi cho bạn một lời mời kết bạn"}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => handleAction("accept")}
              disabled={Boolean(loadingAction)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-cath-red-700 hover:brightness-90 active:scale-95 disabled:opacity-60 disabled:pointer-events-none text-white text-xs font-medium py-1.5 px-3 rounded-full transition shadow-sm"
            >
              {loadingAction === "accept" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>{t.profile?.friends?.actions?.accept || "Chấp nhận"}</span>
            </button>

            <button
              onClick={() => handleAction("decline")}
              disabled={Boolean(loadingAction)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none text-gray-700 text-xs font-medium py-1.5 px-3 rounded-full transition"
            >
              {loadingAction === "decline" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>{t.profile?.friends?.actions?.decline || "Từ chối"}</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
          title="Bỏ qua"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default FriendRequestToast
