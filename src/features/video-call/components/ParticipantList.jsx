import React from "react";
import { Mic, MicOff, Video, VideoOff, Hand, Crown } from "lucide-react";
import { useIsSpeaking } from "@livekit/components-react";
import { useLanguage } from "@/shared/context/LanguageContext";
import Avatar from "@/shared/components/ui/Avatar";
import ListItem from "@/shared/components/ui/ListItem";
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider";
import { isCustomRoom } from "@/features/video-call/utils/roomTypeHelpers";
import { ParticipantVolumePopover } from "./ParticipantVolumePopover";

/**
 * A single row in the participant list.
 * Uses LiveKit Participant object properties directly.
 */
const ParticipantItem = ({ participant }) => {
  const { t } = useLanguage();
  const { micOn: localMicOn, cameraOn: localCameraOn, room, user } = useVideoCallContext();
  const isSpeaking = useIsSpeaking(participant);
  const pl = t.rooms.videoCall.participantList;

  const isLocal = participant.isLocal;
  const isMicOn = isLocal
    ? localMicOn
    : (participant.isMicrophoneEnabled ?? false);
  const isCameraOn = isLocal
    ? localCameraOn
    : (participant.isCameraEnabled ?? false);

  const parseMetadata = (metadata) => {
    if (!metadata) return {};
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  };
  const meta = parseMetadata(participant.metadata);
  const accountId = meta.accountId || (isLocal ? user?.accountId : null);
  const isHandRaised = meta.handRaised === true;
  const avatarUrl = meta.avatarImageUrl;

  const isParticipantHost =
    isCustomRoom(room?.roomType) &&
    room?.creatorId != null &&
    accountId != null &&
    String(accountId) === String(room.creatorId);

  const name =
    participant.name || participant.identity || (isLocal ? pl.you : pl.guest);

  return (
    <ListItem
      leftContent={
        <div
          className={`rounded-full my-1 ml-1 transition-all duration-200 ${isSpeaking ? "ring-2 ring-[#3D9E60] ring-offset-1 ring-offset-white" : "ring-0 ring-transparent"}`}
        >
          <Avatar size={36} name={name} src={avatarUrl} />
        </div>
      }
      rightContent={
        isHandRaised ? (
          <div className="h-9 w-9 flex items-center justify-center">
            <Hand size={20} className="text-yellow-500 shrink-0" />
          </div>
        ) : null
      }
    >
      {/* Name */}
      <div className="flex items-center gap-2 m-0">
        <p className="text-sm leading-5 truncate m-0">
          {name} {isLocal && pl.youSuffix}
        </p>
        {isParticipantHost && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
            <Crown size={12} className="text-amber-500 fill-amber-400" />
            Host
          </span>
        )}
      </div>


      {/* Mic + Camera UNDER name */}
      <div className="flex items-center gap-1 mt-1">
        {/* Camera (indicator only) */}
        <div className="flex items-center justify-center">
          {isCameraOn ? (
            <Video size={16} className="text-cath-red-700" />
          ) : (
            <VideoOff size={16} className="text-[#606060]" />
          )}
        </div>

        {/* Mic (indicator only) */}
        <div className="flex items-center justify-center">
          {isMicOn ? (
            <Mic size={16} className="text-cath-red-700" />
          ) : (
            <MicOff size={16} className="text-[#606060]" />
          )}
        </div>
      </div>
    </ListItem>
  );
};

/**
 * Participant list panel.
 * Reads participants and local media state from VideoCallContext.
 */
const ParticipantList = ({ hideTitle }) => {
  const { t } = useLanguage();
  const { participants } = useVideoCallContext();
  const pl = t.rooms.videoCall.participantList;

  const parseMetadata = (metadata) => {
    if (!metadata) return {};
    try {
      return JSON.parse(metadata);
    } catch {
      return {};
    }
  };

  const raisedHandParticipants = participants.filter((p) => {
    const meta = parseMetadata(p.metadata);
    return meta.handRaised === true;
  });

  const otherParticipants = participants.filter((p) => {
    const meta = parseMetadata(p.metadata);
    return meta.handRaised !== true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {!hideTitle && (
        <div className="px-4 py-3 border-b border-[#E5E5E5]">
          <h3 className="text-black text-sm font-semibold m-0">
            {pl.title} ({participants.length})
          </h3>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]">
        {raisedHandParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {raisedHandParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantVolumePopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantVolumePopover>
              </li>
            ))}
          </ul>
        )}

        {raisedHandParticipants.length > 0 && otherParticipants.length > 0 && (
          <div className="my-2 mx-1 border-t border-[#E5E5E5]" />
        )}

        {otherParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {otherParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantVolumePopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantVolumePopover>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
