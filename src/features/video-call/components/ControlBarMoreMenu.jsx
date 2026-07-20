import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  MonitorUp,
  MonitorOff,
  Users,
  Circle,
  Loader2,
  Copy,
  Sparkles,
  UserCircle,
  Captions,
  Check,
  RefreshCcw,
  Gamepad2,
  History,
  Split,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";
import { useLanguage } from "@/shared/context/LanguageContext";
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation";
import { AnimatePresence, motion } from "framer-motion";
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls";
import SubtitleLanguagePicker from "./SubtitleLanguagePicker";
import { useRecordingStatus } from "@/features/video-call/hooks/useRecordingStatus";
import ProgressBar from "@/shared/components/ui/ProgressBar";
import {
  useParticipants,
  useLocalParticipant,
} from "@livekit/components-react";
import GameSetupModal from "@/features/games/components/shared/GameSetupModal";
import GameHistoryModal from "@/features/games/components/shared/GameHistoryModal";
import { useGame } from "@/features/games/context/GameContext";
import MenuItem from "@/shared/components/ui/MenuItem";

const ControlBarMoreMenu = ({
  showMoreMenu,
  setShowMoreMenu,
  setShowGameModal,
}) => {
  const { id: roomId } = useParams();
  const { t } = useLanguage();
  const { ongoingGame, spectateGame } = useGame();
  const {
    showParticipants,
    setShowParticipants,
    showVirtualBackground,
    setShowVirtualBackground,
    showAvatarPicker,
    setShowAvatarPicker,
    setShowCC,
    isAISession,
    enterPiP,
    lkRoom,
    showTroubleshoot,
    setShowTroubleshoot,
    room,
    user,
    showBreakout,
    setShowBreakout,
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
    confirmStopRecording,
  } = useGlobalVideoCall();

  const [showGameSetup, setShowGameSetup] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(false);

  const { isBreakoutActive, parentSessionId } = useSelector((s) => s.videoCall);

  // Need to import useGetBreakoutStatusQuery, oh wait, I didn't import it in the file! I will just use the one from videoCall context if possible?
  // Let me just import it manually here in the chunk by fixing the top imports.

  const {
    isSubtitleActive,
    isStarting,
    subtitleSupportedLangs,
    startSubtitles,
    stopSubtitles,
  } = useSubtitleControls();

  const {
    formattedTime,
    totalUsedMb,
    limitMb,
    usagePercent,
    isDanger,
    isWarning,
  } = useRecordingStatus(isRecording, confirmStopRecording);

  const [showSubtitlePicker, setShowSubtitlePicker] = useState(false);

  const allParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const hostParticipant = [...allParticipants].sort((a, b) => {
    const timeA = a.joinedAt ? a.joinedAt.getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = b.joinedAt ? b.joinedAt.getTime() : Number.MAX_SAFE_INTEGER;
    return timeA - timeB;
  })[0];
  const isHost =
    hostParticipant &&
    localParticipant &&
    hostParticipant.identity === localParticipant.identity;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t?.rooms?.videoCall?.linkCopied || "Link copied!");
    setShowMoreMenu(false);
  };

  return (
    <>
      <AnimatePresence>
        {showMoreMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMoreMenu(false)}
            />
            <FluentAnimation
              animationKey="more-menu"
              direction="up"
              distance={15}
              exit={true}
              duration={0.2}
              className="absolute bottom-[110%] right-0 z-50 mb-2 min-w-56 max-w-72 w-full"
            >
              <div className="w-full overflow-hidden rounded-lg border border-[#E5E5E5] bg-white shadow-lg">
                <AnimatePresence mode="wait" initial={false}>
                  {!showSubtitlePicker || isSubtitleActive || isAISession ? (
                    <FluentAnimation
                      key="main-menu"
                      animationKey="main-menu"
                      direction="right"
                      distance={20}
                      exit={true}
                      duration={0.2}
                      className="w-full"
                    >
                      <div className="flex flex-col">
                        <MenuItem
                          onClick={() => {
                            setShowMoreMenu(false);
                            if (ongoingGame) {
                              spectateGame();
                            } else {
                              if (!isHost) return;
                              setShowGameSetup(true);
                            }
                          }}
                          disabled={!isHost && !ongoingGame}
                          hoverBg={!isHost && !ongoingGame ? "hover:bg-transparent" : "hover:bg-[#F2F2F2] group-hover:bg-[#F2F2F2]"}
                          className={!isHost && !ongoingGame ? "!text-[#8F8F8F]" : ""}
                          icon={<Gamepad2 size={20} />}
                          label={ongoingGame ? "Xem trò chơi" : (t?.rooms?.videoCall?.controls?.playGames || "Play Games")}
                        />

                        <MenuItem
                          onClick={() => {
                            setShowMoreMenu(false);
                            setShowGameHistory(true);
                          }}
                          icon={<History size={20} />}
                          label={t.rooms?.game?.crackIt?.gameHistory || "Game History"}
                        />

                        <div className="border-t border-[#E5E5E5]"></div>
                        <MenuItem
                          onClick={() => {
                            setShowParticipants(!showParticipants);
                            setShowMoreMenu(false);
                          }}
                          icon={<Users size={20} />}
                          label={t.rooms?.videoCall?.controls?.participants || "Participants"}
                        />

                        {!isAISession && (isHost || isBreakoutActive) && (
                          <MenuItem
                            onClick={() => {
                              setShowBreakout(!showBreakout);
                              setShowMoreMenu(false);
                            }}
                            icon={<Split size={20} />}
                            label={t?.rooms?.breakoutRooms?.breakoutRoomOption || "Breakout Rooms"}
                          />
                        )}

                        <div className="flex flex-col">
                          <MenuItem
                            onClick={() => {
                              if (isRecording) {
                                confirmStopRecording();
                              } else {
                                handleToggleRecording();
                              }
                              setShowMoreMenu(false);
                            }}
                            disabled={isTogglingRecording}
                            icon={
                              isTogglingRecording ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : isRecording ? (
                                <Circle size={20} className="text-red-600 fill-red-600 animate-pulse" />
                              ) : (
                                <Circle size={20} />
                              )
                            }
                            label={
                              isRecording
                                ? (t?.rooms?.videoCall?.controls?.recordOff || "Stop recording")
                                : (t?.rooms?.videoCall?.controls?.recordOn || "Start recording")
                            }
                            rightText={isRecording ? <span className="font-semibold text-red-600">{formattedTime}</span> : undefined}
                          />
                          {isRecording && (
                            <div className="px-4 pb-2 pt-1">
                              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                                <span>Storage</span>
                                <span>{totalUsedMb.toFixed(1)}MB / {limitMb.toFixed(0)}MB</span>
                              </div>
                              <ProgressBar
                                progress={usagePercent}
                                heightClass="h-1.5"
                                trackColorClass="bg-[#F2F2F2]"
                                colorClass={isDanger ? "bg-red-500 animate-pulse" : isWarning ? "bg-amber-500" : "bg-emerald-500"}
                              />
                            </div>
                          )}
                        </div>
                        {/* <div className="border-t border-[#E5E5E5]"></div> */}

                        <MenuItem
                          onClick={() => {
                            if (isAISession) {
                              setShowCC(!showCC);
                              setShowMoreMenu(false);
                            } else {
                              if (isSubtitleActive) {
                                stopSubtitles();
                                setShowMoreMenu(false);
                              } else {
                                setShowSubtitlePicker((v) => !v);
                              }
                            }
                          }}
                          disabled={!isAISession && isStarting}
                          icon={!isAISession && isStarting ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Captions size={20} />
                          )}
                          label={(isAISession ? showCC : isSubtitleActive)
                            ? t?.rooms?.videoCall?.controls?.captionsOff ||
                            "Turn off captions"
                            : t?.rooms?.videoCall?.controls?.captionsOn ||
                            "Turn on captions"}
                        />

                        <div className="border-t border-[#E5E5E5]"></div>
                        <MenuItem
                          onClick={() => {
                            setShowVirtualBackground(!showVirtualBackground);
                            setShowMoreMenu(false);
                          }}
                          icon={<Sparkles size={20} className="shrink-0" />}
                          label={
                            t?.rooms?.videoCall?.backgroundsAndEffects ||
                            "Backgrounds and effects"}
                        />

                        <MenuItem
                          onClick={() => {
                            setShowAvatarPicker(!showAvatarPicker);
                            setShowMoreMenu(false);
                          }}
                          icon={<UserCircle size={20} />}
                          label={
                            t?.rooms?.videoCall?.changeAvatar ||
                            "Change meeting avatar"}
                        />

                        {"documentPictureInPicture" in window && (
                          <MenuItem
                            onClick={() => {
                              enterPiP?.();
                              setShowMoreMenu(false);
                            }}
                            icon={<MonitorUp size={20} />}
                            label={t?.rooms?.videoCall?.pictureInPicture ||
                              "Picture-in-Picture"}
                          />
                        )}

                        {/* <MenuItem
                          onClick={handleCopyLink}
                          icon={<Copy size={20} />}
                          label={t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
                        /> */}

                        <MenuItem
                          onClick={() => {
                            setShowTroubleshoot(!showTroubleshoot);
                            setShowMoreMenu(false);
                          }}
                          icon={<RefreshCcw size={20} className="shrink-0" />}
                          label={
                            t?.rooms?.videoCall?.reconnect ||
                            "Troubleshoot connection"
                          }
                        />
                      </div>
                    </FluentAnimation>
                  ) : (
                    <FluentAnimation
                      key="subtitle-picker"
                      animationKey="subtitle-picker"
                      direction="left"
                      distance={20}
                      exit={true}
                      duration={0.2}
                      className="flex w-full flex-col"
                    >
                      <SubtitleLanguagePicker
                        languages={subtitleSupportedLangs}
                        selectedLanguage={null}
                        onSelect={(lang) => {
                          startSubtitles(lang);
                          setShowSubtitlePicker(false);
                          setShowMoreMenu(false);
                        }}
                        onBack={() => setShowSubtitlePicker(false)}
                        backLabel={
                          t?.rooms?.videoCall?.controls?.back || "Back"
                        }
                        onClose={() => setShowSubtitlePicker(false)}
                        className="w-full bg-white"
                      />
                    </FluentAnimation>
                  )}
                </AnimatePresence>
              </div>
            </FluentAnimation>
          </>
        )}
      </AnimatePresence>

      {/* Game Setup Modal */}
      <GameSetupModal
        open={showGameSetup}
        onClose={() => setShowGameSetup(false)}
      />

      <GameHistoryModal
        open={showGameHistory}
        onClose={() => setShowGameHistory(false)}
        roomName={roomId}
      />
    </>
  );
};

export default ControlBarMoreMenu;

