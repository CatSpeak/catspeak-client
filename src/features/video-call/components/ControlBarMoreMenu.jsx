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
  } = useGlobalVideoCall();

  const [showGameSetup, setShowGameSetup] = useState(false);
  const [showGameHistory, setShowGameHistory] = useState(false);

  const { isBreakoutActive } = useSelector((s) => s.videoCall);

  const {
    isSubtitleActive,
    isStarting,
    subtitleSupportedLangs,
    startSubtitles,
    stopSubtitles,
  } = useSubtitleControls();

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
                            className="min-[769px]:hidden"
                          />
                        )}

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

                        <MenuItem
                          onClick={handleCopyLink}
                          icon={<Copy size={20} />}
                          label={t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
                        />

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