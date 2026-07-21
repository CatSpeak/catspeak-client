import React from "react";
import { Users, MessageSquare, LayoutGrid } from "lucide-react";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";
import { useLanguage } from "@/shared/context/LanguageContext";
import ControlButton from "./ControlButton";

const RightSideControls = ({ className = "" }) => {
  const { t } = useLanguage();
  const {
    showParticipants,
    setShowParticipants,
    showChat,
    setShowChat,
    participants,
    unreadRoomChat,
    unreadAiChat,
  } = useGlobalVideoCall();

  const unreadMessages = (unreadRoomChat || 0) + (unreadAiChat || 0);

  return (
    <div className={`flex justify-end ${className}`}>
      <div className="relative text-base">
        <ControlButton
          isActive={showParticipants}
          onClick={() => setShowParticipants(!showParticipants)}
          title={t.rooms?.videoCall?.controls?.participants || "Participants"}
          iconActive={<Users size={20} />}
          iconInactive={<Users size={20} />}
          className="w-[58px]"
          inactiveClassOverride="bg-transparent hover:bg-[#D9D9D9] text-black"
        >
          {participants?.length > 0 && (
            <div className={`${showParticipants ? "text-white" : "text-black"} ml-1.5 text-base font-medium`}>
              {participants.length}
            </div>
          )}
        </ControlButton>
      </div>

      <div className="relative">
        <ControlButton
          isActive={showChat}
          onClick={() => setShowChat(!showChat)}
          title={t.rooms?.videoCall?.controls?.chat || "Chat"}
          iconActive={<MessageSquare size={20} />}
          iconInactive={<MessageSquare size={20} />}
          inactiveClassOverride="bg-transparent hover:bg-[#D9D9D9] text-black"
        />
        {unreadMessages > 0 && (
          <div className="absolute top-0 md:-top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm pointer-events-none z-10">
            {unreadMessages > 9 ? "9+" : unreadMessages}
          </div>
        )}
      </div>

      {/* <ControlButton
        isActive={false}
        onClick={() => { alert("change layout") }}
        iconActive={<LayoutGrid size={20} />}
        iconInactive={<LayoutGrid size={20} />}
        inactiveClassOverride="bg-transparent hover:bg-[#D9D9D9] text-black"
      /> */}
    </div>
  );
};

export default RightSideControls;
