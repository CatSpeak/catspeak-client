import React from "react"
import {
  MonitorUp,
  MonitorOff,
  Users,
  Circle,
  Loader2,
  Copy,
  Sparkles,
  Captions,
  Check,
  UserCircle,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { AnimatePresence } from "framer-motion"

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
    isAISession,
    showCC,
    setShowCC,
    showAvatarPicker,
    setShowAvatarPicker,
  } = useGlobalVideoCall()

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
            <div className="w-full rounded-lg border border-[#E5E5E5] bg-white shadow-lg">
              {/* Mobile-only menu items */}
              <div className="min-[426px]:hidden">
                <div className="p-1">
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
                </div>
                <div className="border-t border-[#E5E5E5]"></div>
              </div>

              <div className="p-1 flex flex-col gap-1">
                <button
                  onClick={() => {
                    setShowAvatarPicker(!showAvatarPicker)
                    setShowMoreMenu(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                >
                  <UserCircle size={20} />
                  {t?.rooms?.videoCall?.changeAvatar || "Change meeting avatar"}
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

                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                >
                  <Copy size={20} />
                  {t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
                </button>

                {isAISession && (
                  <button
                    onClick={() => {
                      setShowCC(!showCC)
                      setShowMoreMenu(false)
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-sm hover:bg-[#F6F6F6]"
                  >
                    <Captions size={20} />
                    <span className="flex-1 text-left">
                      {t?.rooms?.videoCall?.subtitles || "Subtitles (CC)"}
                    </span>
                    {showCC && (
                      <Check size={18} className="text-cath-red-700" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </FluentAnimation>
        </>
      )}
    </AnimatePresence>
  )
}

export default ControlBarMoreMenu
