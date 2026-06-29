import React, { useState } from "react"
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
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { AnimatePresence, motion } from "framer-motion"
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls"
import SubtitleLanguagePicker from "./SubtitleLanguagePicker"

const ControlBarMoreMenu = ({ showMoreMenu, setShowMoreMenu }) => {
  const { t } = useLanguage()
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
    showCC,
    setShowCC,
    isAISession,
    enterPiP,
    lkRoom,
    showTroubleshoot,
    setShowTroubleshoot,
  } = useGlobalVideoCall()

  const {
    isSubtitleActive,
    isStarting,
    subtitleSupportedLangs,
    startSubtitles,
    stopSubtitles,
  } = useSubtitleControls()

  const [showSubtitlePicker, setShowSubtitlePicker] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t?.rooms?.videoCall?.linkCopied || "Link copied!")
    setShowMoreMenu(false)
  }

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
            className="absolute bottom-[110%] right-0 z-50 mb-2 w-56"
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
                    <div className="flex flex-col gap-1 p-1">
                      <button
                        onClick={() => {
                          setShowParticipants(!showParticipants)
                          setShowMoreMenu(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                        style={{ textAlign: "left" }}
                      >
                        <Users size={20} />
                        {t.rooms?.videoCall?.controls?.participants ||
                          "Participants"}
                      </button>

                      <button
                        onClick={() => {
                          if (isAISession) {
                            setShowCC(!showCC)
                            setShowMoreMenu(false)
                          } else {
                            if (isSubtitleActive) {
                              stopSubtitles()
                              setShowMoreMenu(false)
                            } else {
                              setShowSubtitlePicker((v) => !v)
                            }
                          }
                        }}
                        disabled={!isAISession && isStarting}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                      >
                        {!isAISession && isStarting ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Captions size={20} />
                        )}
                        {(isAISession ? showCC : isSubtitleActive)
                          ? t?.rooms?.videoCall?.controls?.captionsOff ||
                            "Turn off captions"
                          : t?.rooms?.videoCall?.controls?.captionsOn ||
                            "Turn on captions"}
                      </button>

                      <div className="border-t border-[#E5E5E5]"></div>

                      <button
                        onClick={() => {
                          setShowAvatarPicker(!showAvatarPicker)
                          setShowMoreMenu(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                      >
                        <UserCircle size={20} />
                        {t?.rooms?.videoCall?.changeAvatar ||
                          "Change meeting avatar"}
                      </button>

                      <button
                        onClick={() => {
                          setShowVirtualBackground(!showVirtualBackground)
                          setShowMoreMenu(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                      >
                        <Sparkles size={20} />
                        {t?.rooms?.videoCall?.applyVisualEffects ||
                          "Apply visual effects"}
                      </button>

                      {"documentPictureInPicture" in window && (
                        <button
                          onClick={() => {
                            enterPiP?.()
                            setShowMoreMenu(false)
                          }}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                        >
                          <MonitorUp size={20} />
                          {t?.rooms?.videoCall?.pictureInPicture || "Picture-in-Picture"}
                        </button>
                      )}

                      <button
                        onClick={handleCopyLink}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                      >
                        <Copy size={20} />
                        {t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
                      </button>

                      <button
                        onClick={() => {
                          setShowTroubleshoot(!showTroubleshoot)
                          setShowMoreMenu(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6] text-left"
                      >
                        <RefreshCcw size={20} className="shrink-0" />
                        <span>{t?.rooms?.videoCall?.reconnect || "Troubleshoot connection"}</span>
                      </button>
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
                        startSubtitles(lang)
                        setShowSubtitlePicker(false)
                        setShowMoreMenu(false)
                      }}
                      onBack={() => setShowSubtitlePicker(false)}
                      backLabel={t?.rooms?.videoCall?.controls?.back || "Back"}
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
  )
}

export default ControlBarMoreMenu
