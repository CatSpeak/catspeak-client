import React, { useState } from "react"
import { Users, MessageSquare, LayoutGrid } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ChooseLayoutModal from "./ChooseLayoutModal"

const RightSideControls = ({ className = "" }) => {
  const { t } = useLanguage()
  const {
    showParticipants,
    setShowParticipants,
    showChat,
    setShowChat,
    participants,
    unreadRoomChat,
    unreadAiChat,
  } = useGlobalVideoCall()

  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false)

  const unreadMessages = (unreadRoomChat || 0) + (unreadAiChat || 0)
  const participantCount = participants?.length || 0

  return (
    <div className={`flex items-center justify-end ${className}`}>
      <PillButton
        variant={showParticipants ? "controlActive" : "control"}
        onClick={() => setShowParticipants(!showParticipants)}
        title={t.rooms?.videoCall?.controls?.participants || "Participants"}
        startIcon={<Users />}
      >
        {participantCount > 0 ? participantCount : null}
      </PillButton>

      <div className="relative">
        <IconButton
          variant={showChat ? "controlActive" : "control"}
          onClick={() => setShowChat(!showChat)}
          title={t.rooms?.videoCall?.controls?.chat || "Chat"}
        >
          <MessageSquare />
        </IconButton>
        {unreadMessages > 0 && (
          <div className="absolute top-0 md:-top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm pointer-events-none z-10">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </div>
        )}
      </div>

      <IconButton
        variant="control"
        onClick={() => setIsLayoutModalOpen(true)}
        title="Change layout"
      >
        <LayoutGrid />
      </IconButton>

      <ChooseLayoutModal
        open={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
      />
    </div>
  )
}

export default RightSideControls
