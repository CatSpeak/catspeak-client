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
  Volume2,
  Settings,
  Info,
  ChevronLeft
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
import PillButton from "@/shared/components/ui/buttons/PillButton";
import { useSessionTimer } from "../hooks/useSessionTimer";
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"

const DISPLAY_NAMES = {
  en: "English",
  vi: "Tiếng Việt",
  zh: "中文",
};

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
    isLocalScreenShare,
    isTogglingScreenShare,
    handleToggleScreenShare,
    subtitleSelectedLanguage,
  } = useGlobalVideoCall();

  const [showGameSetup, setShowGameSetup] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  const { isBreakoutActive, parentSessionId } = useSelector((s) => s.videoCall);

  const { closingRemainingSeconds } = useVideoCallContext()
  const { formattedRemaining, formattedMax, hasDuration, formattedElapsed } = useSessionTimer(room?.createDate, room?.duration, closingRemainingSeconds)

  // Need to import useGetBreakoutStatusQuery, oh wait, I didn't import it in the file! I will just use the one from videoCall context if possible?
  // Let me just import it manually here in the chunk by fixing the top imports.

  const {
    isSubtitleActive,
    isStarting,
    subtitleSupportedLangs,
    startSubtitles,
    changeSubtitleLanguage,
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
              className="fixed inset-0 z-40 bg-black/40 md:bg-transparent"
              onClick={() => setShowMoreMenu(false)}
            />
            <FluentAnimation
              animationKey="more-menu"
              direction="up"
              distance={15}
              exit={true}
              duration={0.2}
              className="fixed inset-x-0 bottom-0 md:absolute md:inset-x-auto md:bottom-[110%] md:right-0 z-50 md:mb-2 md:min-w-56 md:max-w-72 w-full"
            >
              <div className="w-full overflow-hidden rounded-t-[24px] md:rounded-lg border border-[#E5E5E5] bg-white shadow-lg pb-safe md:pb-0">
                <AnimatePresence mode="wait" initial={false}>
                  {!showSubtitlePicker || isAISession ? (
                    <FluentAnimation
                      key="main-menu"
                      animationKey="main-menu"
                      direction="right"
                      distance={20}
                      exit={true}
                      duration={0.2}
                      className="w-full"
                    >
                      <div className="hidden md:flex flex-col">
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
                                setShowSubtitlePicker(true);
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

                        {!isAISession && isSubtitleActive && (
                          <button
                            onClick={() => {
                              setShowSubtitlePicker(true);
                            }}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                          >
                            <div className="flex items-center gap-3">
                              <Captions size={20} />
                              <span>
                                {t?.rooms?.videoCall?.controls?.captionLanguage ||
                                  "Caption language"}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              {DISPLAY_NAMES[subtitleSelectedLanguage] ||
                                subtitleSelectedLanguage}
                            </span>
                          </button>
                        )}

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

                      {/* MOBILE VIEW */}
                      <div className="flex md:hidden flex-col px-4 pb-6 pt-2 w-full">
                        <div className="w-full flex justify-center pb-4 cursor-pointer shrink-0" onClick={() => setShowMoreMenu(false)}>
                          <div className="w-10 h-1.5 bg-[#D9D9D9] rounded-full" />
                        </div>

                        <AnimatePresence mode="wait">
                          {!showMobileSettings ? (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col gap-3"
                            >
                              {hasDuration && (
                                <div className="flex items-center justify-center text-lg font-medium text-black md:text-base bg-[#F5F5F5] rounded-xl py-2 px-5 h-12 w-full">
                                  {t?.rooms?.videoCall?.remainingTime || "Thời gian còn lại"}: {formattedRemaining} / {formattedMax}
                                </div>
                              )}

                              <div className="grid grid-cols-3 gap-3">
                                <button
                                  onClick={() => {
                                    handleToggleScreenShare();
                                    setShowMoreMenu(false);
                                  }}
                                  disabled={isTogglingScreenShare}
                                  className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${isLocalScreenShare ? 'bg-red-100 text-red-600' : 'bg-[#F5F5F5]'}`}
                                >
                                  {isLocalScreenShare ? <MonitorOff size={24} /> : <MonitorUp size={24} />}
                                </button>
                                <button
                                  onClick={() => {
                                    if (isAISession) {
                                      setShowCC(!showCC);
                                      setShowMoreMenu(false);
                                    } else {
                                      if (isSubtitleActive) {
                                        stopSubtitles();
                                        setShowMoreMenu(false);
                                      } else {
                                        setShowSubtitlePicker(true);
                                      }
                                    }
                                  }}
                                  className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${(isAISession ? showCC : isSubtitleActive) ? 'bg-red-100 text-red-600' : 'bg-[#F5F5F5]'}`}
                                >
                                  <Captions size={24} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (isRecording) {
                                      confirmStopRecording();
                                    } else {
                                      handleToggleRecording();
                                    }
                                    setShowMoreMenu(false);
                                  }}
                                  disabled={isTogglingRecording}
                                  className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-[#F5F5F5]'}`}
                                >
                                  {isTogglingRecording ? <Loader2 size={24} className="animate-spin" /> : <Circle size={24} className={isRecording ? 'fill-red-600 text-red-600' : ''} />}
                                </button>
                              </div>

                              <button
                                onClick={handleCopyLink}
                                className="w-full h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center gap-2 font-medium"
                              >
                                <Copy size={20} />
                                {t?.rooms?.videoCall?.copyLink || "Sao chép liên kết"}
                              </button>

                              <div className="grid grid-cols-2 gap-3">
                                <button
                                  onClick={() => setShowMobileSettings(true)}
                                  className="h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center"
                                >
                                  <Settings size={24} />
                                </button>
                                <button
                                  onClick={() => {
                                    setShowTroubleshoot(!showTroubleshoot);
                                    setShowMoreMenu(false);
                                  }}
                                  className="h-16 bg-[#F5F5F5] rounded-xl flex items-center justify-center"
                                >
                                  <Info size={24} />
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              // key="mobile-settings"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                              className="flex flex-col"
                            >
                              <button
                                onClick={() => setShowMobileSettings(false)}
                                className="flex items-center gap-2 font-semibold text-base pb-3 border-b border-[#e5e5e5] mb-2"
                              >
                                <ChevronLeft size={20} /> {t?.rooms?.videoCall?.backBtn || "Back"}
                              </button>

                              <MenuItem
                                onClick={() => {
                                  setShowMoreMenu(false);
                                  if (ongoingGame) spectateGame();
                                  else if (isHost) setShowGameSetup(true);
                                }}
                                disabled={!isHost && !ongoingGame}
                                icon={<Gamepad2 size={20} />}
                                label={ongoingGame ? "Xem trò chơi" : (t?.rooms?.videoCall?.controls?.playGames || "Play Games")}
                              />
                              <MenuItem
                                onClick={() => { setShowMoreMenu(false); setShowGameHistory(true); }}
                                icon={<History size={20} />}
                                label={t.rooms?.game?.crackIt?.gameHistory || "Game History"}
                                hoverBg="active:bg-[#F2F2F2] md:hover:bg-[#F2F2F2] md:group-hover:bg-[#F2F2F2]"
                              />
                              {!isAISession && (isHost || isBreakoutActive) && (
                                <MenuItem
                                  onClick={() => { setShowBreakout(!showBreakout); setShowMoreMenu(false); }}
                                  icon={<Split size={20} />}
                                  label={t?.rooms?.breakoutRooms?.breakoutRoomOption || "Breakout Rooms"}
                                  hoverBg="active:bg-[#F2F2F2] md:hover:bg-[#F2F2F2] md:group-hover:bg-[#F2F2F2]"
                                />
                              )}
                              <MenuItem
                                onClick={() => { setShowVirtualBackground(!showVirtualBackground); setShowMoreMenu(false); }}
                                icon={<Sparkles size={20} />}
                                label={t?.rooms?.videoCall?.backgroundsAndEffects || "Backgrounds and effects"}
                                hoverBg="active:bg-[#F2F2F2] md:hover:bg-[#F2F2F2] md:group-hover:bg-[#F2F2F2]"
                              />
                              <MenuItem
                                onClick={() => { setShowAvatarPicker(!showAvatarPicker); setShowMoreMenu(false); }}
                                icon={<UserCircle size={20} />}
                                label={t?.rooms?.videoCall?.changeAvatar || "Change meeting avatar"}
                                hoverBg="active:bg-[#F2F2F2] md:hover:bg-[#F2F2F2] md:group-hover:bg-[#F2F2F2]"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                        selectedLanguage={subtitleSelectedLanguage}
                        onSelect={(lang) => {
                          if (isSubtitleActive) {
                            changeSubtitleLanguage(lang);
                          } else {
                            startSubtitles(lang);
                          }
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