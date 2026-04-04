import React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import BackButton from "@/shared/components/ui/buttons/BackButton"
import ParticipantsPreview from "./ParticipantsPreview"
import VideoPreview from "./VideoPreview"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getTranslatedRoomName } from "../../utils/roomNameUtils"

const WaitingScreen = ({
  session,
  room,
  participantCount,
  localStream,
  micOn,
  cameraOn,
  user,
  onToggleMic,
  onToggleCam,
  onJoin,
  isFull = false,
  maxParticipants = 5,
}) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const participants = session?.participants ?? []
  const { t } = useLanguage()
  const communityLanguage = localStorage.getItem("communityLanguage") || "en"
  const effectiveParticipantCount = participantCount ?? participants.length
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center relative bg-gray-50 p-5">
      {/* Back Button */}
      <div className="text-sm absolute top-5 left-5 md:top-8 md:left-8 z-10">
        <BackButton
          onClick={() =>
            navigate({
              pathname: `/${communityLanguage}/community`,
              search: searchParams.toString(),
            })
          }
        >
          {t.rooms.waitingScreen.backToCommunity}
        </BackButton>
      </div>

      <div className="mb-6 text-center">
        <h4 className="mb-2 font-semibold text-2xl md:text-4xl">
          {getTranslatedRoomName(session?.roomName, t) ||
            t.rooms.waitingScreen.readyToJoin}
        </h4>

        {/* Level & Topic Tags */}
        {(room?.requiredLevel || room?.topic) && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {room?.requiredLevel && (
              <span className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="rounded-full bg-[#990011] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed}
                  </span>
                )
              })}
          </div>
        )}
      </div>

      {/* Participants + Video stacked and centered */}
      <div className="flex w-full max-w-[960px] flex-col items-center justify-center gap-6 mb-6">
        <ParticipantsPreview
          participants={participants}
          participantCount={participantCount}
        />
        <VideoPreview
          user={user}
          localStream={localStream}
          micOn={micOn}
          cameraOn={cameraOn}
          onToggleMic={onToggleMic}
          onToggleCam={onToggleCam}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <PillButton
          onClick={onJoin}
          disabled={isFull}
          aria-disabled={isFull}
          title={isFull ? t.rooms.waitingScreen.roomFull : undefined}
          className="h-10"
        >
          {t.rooms.waitingScreen.joinNow}
        </PillButton>
        {isFull && (
          <p className="text-sm text-red-600">
            {t.rooms.waitingScreen.roomFull} ({effectiveParticipantCount}/
            {maxParticipants})
          </p>
        )}
        <p className="text-sm text-gray-500">
          {t.rooms.waitingScreen.joinedAs}{" "}
          <span className="font-medium text-gray-900">{user?.username}</span>
        </p>
      </div>
    </div>
  )
}

export default WaitingScreen
