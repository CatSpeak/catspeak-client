import React, { useState } from "react";
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
  Split,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider";
import { useLanguage } from "@/shared/context/LanguageContext";
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation";
import { AnimatePresence, motion } from "framer-motion";
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls";
import SubtitleLanguagePicker from "./SubtitleLanguagePicker";
import ListItem from "@/shared/components/ui/ListItem";

const ControlBarMoreMenu = ({ showMoreMenu, setShowMoreMenu }) => {
  const { t } = useLanguage();
  const {
    isLocalScreenShare,
    showParticipants,
    setShowParticipants,
    setShowChat,
    handleToggleScreenShare,
    isRecording,
    isTogglingRecording,
    handleToggleRecording,
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

  const { isBreakoutActive } = useSelector((s) => s.videoCall);
  const isHost = room?.creatorId === user?.accountId;

  const {
    isSubtitleActive,
    isStarting,
    subtitleSupportedLangs,
    startSubtitles,
    stopSubtitles,
  } = useSubtitleControls();

  const [showSubtitlePicker, setShowSubtitlePicker] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t?.rooms?.videoCall?.linkCopied || "Link copied!");
    setShowMoreMenu(false);
  };

  return (
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
            className="fixed inset-0 z-50 w-full min-[426px]:absolute min-[426px]:inset-auto min-[426px]:bottom-[110%] min-[426px]:right-0 min-[426px]:mb-2 min-[426px]:w-72"
          >
            <div className="flex h-full w-full flex-col overflow-hidden bg-white min-[426px]:h-auto min-[426px]:max-h-none min-[426px]:rounded-xl min-[426px]:border min-[426px]:border-[#E5E5E5] min-[426px]:shadow-lg">
              {/* Mobile Header */}
              <div className="flex w-full items-center justify-between border-b border-[#E5E5E5] px-4 py-3 min-[426px]:hidden">
                <span className="text-lg font-semibold">
                  {t?.rooms?.videoCall?.moreOptions || "More options"}
                </span>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
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
                      <div className="flex flex-col py-2">
                        <ListItem
                          onClick={() => {
                            setShowParticipants(!showParticipants);
                            setShowMoreMenu(false);
                          }}
                          leftContent={<Users />}
                          hoverEffect={true}
                        >
                          {t.rooms?.videoCall?.controls?.participants ||
                            "Participants"}
                        </ListItem>

                        {!isAISession && (isHost || isBreakoutActive) && (
                          <ListItem
                            onClick={() => {
                              setShowBreakout(!showBreakout);
                              setShowMoreMenu(false);
                            }}
                            leftContent={<Split />}
                            hoverEffect={true}
                            className="min-[769px]:hidden"
                          >
                            {t?.rooms?.breakoutRooms?.breakoutRoomOption || "Breakout Rooms"}
                          </ListItem>
                        )}

                        <ListItem
                          onClick={() => {
                            if (!isAISession && isStarting) return;
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
                          leftContent={
                            !isAISession && isStarting ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <Captions />
                            )
                          }
                          hoverEffect={!(!isAISession && isStarting)}
                          className={`min-[426px]:hidden ${
                            !isAISession && isStarting
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {(isAISession ? showCC : isSubtitleActive)
                            ? t?.rooms?.videoCall?.controls?.captionsOff ||
                              "Turn off captions"
                            : t?.rooms?.videoCall?.controls?.captionsOn ||
                              "Turn on captions"}
                        </ListItem>

                        <ListItem
                          onClick={() => {
                            setShowVirtualBackground(!showVirtualBackground);
                            setShowMoreMenu(false);
                          }}
                          leftContent={<Sparkles />}
                          hoverEffect={true}
                        >
                          {t?.rooms?.videoCall?.backgroundsAndEffects ||
                            "Backgrounds and effects"}
                        </ListItem>

                        <ListItem
                          onClick={() => {
                            setShowAvatarPicker(!showAvatarPicker);
                            setShowMoreMenu(false);
                          }}
                          leftContent={<UserCircle />}
                          hoverEffect={true}
                        >
                          {t?.rooms?.videoCall?.changeAvatar ||
                            "Change meeting avatar"}
                        </ListItem>

                        {"documentPictureInPicture" in window && (
                          <ListItem
                            onClick={() => {
                              enterPiP?.();
                              setShowMoreMenu(false);
                            }}
                            leftContent={<MonitorUp />}
                            hoverEffect={true}
                          >
                            {t?.rooms?.videoCall?.pictureInPicture ||
                              "Picture-in-Picture"}
                          </ListItem>
                        )}

                        <ListItem
                          onClick={handleCopyLink}
                          leftContent={<Copy />}
                          hoverEffect={true}
                        >
                          {t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
                        </ListItem>

                        <ListItem
                          onClick={() => {
                            setShowTroubleshoot(!showTroubleshoot);
                            setShowMoreMenu(false);
                          }}
                          leftContent={<RefreshCcw />}
                          hoverEffect={true}
                        >
                          {t?.rooms?.videoCall?.reconnect ||
                            "Troubleshoot connection"}
                        </ListItem>
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
            </div>
          </FluentAnimation>
        </>
      )}
    </AnimatePresence>
  );
};

export default ControlBarMoreMenu;

