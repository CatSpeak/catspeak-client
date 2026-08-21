import React, { useState } from "react"
import { Users, MessageSquare, LayoutGrid } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import ControlButton from "./ControlButton"
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

  return (
    <div className={`flex justify-end ${className}`}>
      <div className="relative text-base pr-1">
        <PillButton
          onClick={() => setShowParticipants(!showParticipants)}
          title={t.rooms?.videoCall?.controls?.participants || "Participants"}
          startIcon={<Users />}
          variant={showParticipants ? "primary" : "secondary-no-outline"}
          className={
            showParticipants
              ? "[&>div]:!bg-cath-red-600 [&>div]:hover:!bg-cath-red-700 [&>div]:!text-white"
              : "[&>div]:!bg-primaryBg [&>div]:hover:!bg-[#E6E6E6] [&>div]:!text-black"
          }
        >
          {participants?.length > 0 ? participants.length : null}
        </PillButton>
      </div>

      <div className="relative">
        <ControlButton
          isActive={showChat}
          onClick={() => setShowChat(!showChat)}
          title={t.rooms?.videoCall?.controls?.chat || "Chat"}
          iconActive={<MessageSquare />}
          iconInactive={<MessageSquare />}
          inactiveClassOverride="bg-primaryBg hover:bg-[#E6E6E6] text-black"
        />
        {unreadMessages > 0 && (
          <div className="absolute top-0 md:-top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm pointer-events-none z-10">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </div>
        )}
      </div>

      <ControlButton
        isActive={false}
        onClick={() => setIsLayoutModalOpen(true)}
        iconActive={<LayoutGrid />}
        iconInactive={<LayoutGrid />}
        inactiveClassOverride="bg-primaryBg hover:bg-[#E6E6E6] text-black"
      />

      <ChooseLayoutModal
        open={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
      />
    </div>
  )
}

export default RightSideControls
