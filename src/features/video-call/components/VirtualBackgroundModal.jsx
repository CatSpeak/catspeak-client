import React, { useEffect, useMemo, useRef, useState } from "react"
import { Video, VideoOff } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import VirtualBackgroundPicker from "./VirtualBackgroundPicker"
import BeautyPicker from "./BeautyPicker"
import { useLanguage } from "@/shared/context/LanguageContext"
import Tabs from "@/shared/components/ui/navigation/Tabs"

import { isBeautyFilterSupported } from "@/features/video-call/utils/roomTypeHelpers"
import { usePlanFeatures } from "@/shared/hooks/usePlanFeatures"
import { PLAN_FEATURES } from "@/shared/constants/planFeatures"

const BEAUTY_STORAGE_KEY = "catspeak:beautyOptions"

const readStoredBeautyOptions = () => {
  try {
    const raw = localStorage.getItem(BEAUTY_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore corrupt data */
  }
  return null
}

const persistBeautyOptions = (opts) => {
  try {
    localStorage.setItem(BEAUTY_STORAGE_KEY, JSON.stringify(opts))
  } catch {
    /* quota exceeded — silently drop */
  }
}

const VirtualBackgroundModal = ({
  open,
  onClose,
  localStream,
  cameraOn,
  onToggleCam,
  lkVideoTrack,
  room,
}) => {
  const { t } = useLanguage()
  const videoRef = useRef(null)
  const { hasFeature, isPro } = usePlanFeatures()
  const userHasProPlan = Boolean(
    isPro || hasFeature(PLAN_FEATURES.BEAUTY_FILTER),
  )
  const isBeautyAllowed =
    userHasProPlan && isBeautyFilterSupported(room?.roomType, userHasProPlan)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // Same live-track guard as VideoPreview: never attach an ended track,
    // otherwise the modal preview sticks on a black frame after re-toggle.
    const liveLkTrack =
      lkVideoTrack?.mediaStreamTrack?.readyState === "ended"
        ? null
        : lkVideoTrack

    if (liveLkTrack) {
      try {
        liveLkTrack.detach(videoElement)
      } catch {
        /* ignore */
      }
      try {
        liveLkTrack.attach(videoElement)
      } catch {
        /* ignore */
      }
      return () => {
        try {
          liveLkTrack.detach(videoElement)
        } catch {
          /* ignore */
        }
      }
    }

    if (lkVideoTrack) {
      try {
        lkVideoTrack.detach(videoElement)
      } catch {
        /* ignore */
      }
    }
    try {
      const hasLiveVideo = (() => {
        try {
          return (localStream?.getVideoTracks() || []).some(
            (t) => t.readyState === "live",
          )
        } catch {
          return false
        }
      })()
      videoElement.srcObject = hasLiveVideo ? localStream : null
      if (hasLiveVideo) {
        videoElement.play?.().catch(() => {})
      }
    } catch {
      /* ignore */
    }
    return () => {
      try {
        videoElement.srcObject = null
      } catch {
        /* ignore */
      }
    }
  }, [lkVideoTrack, localStream, open])
  const [activeTab, setActiveTab] = useState("backgrounds")

  // Initialise beauty options from localStorage so pre-join selections survive
  // page reloads and carry over into the in-call session.
  const [beautyOptions, setBeautyOptions] = useState(() => {
    const stored = readStoredBeautyOptions()
    return (
      stored ?? {
        smoothing: 0,
        brightness: 0,
        warmth: 0,
        colorFilter: 0,
        faceSlim: 0,
        eyeEnlarge: 0,
        eyeBrighten: 0,
        teethWhiten: 0,
      }
    )
  })

  // Persist beauty options to localStorage whenever they change so the
  // in-call processor (useCombinedProcessor) can pick them up on attach.
  useEffect(() => {
    persistBeautyOptions(beautyOptions)
  }, [beautyOptions])

  const handleBeautyChange = (key, value) => {
    setBeautyOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handleApply = (_url) => {
    // Background is selected and saved cleanly without forcing camera on
  }

  const tabs = useMemo(
    () => [
      {
        id: "backgrounds",
        label: t?.rooms?.videoCall?.tabBackgrounds || "Backgrounds",
      },
      ...(isBeautyAllowed
        ? [
            {
              id: "beauty",
              label: t?.rooms?.beauty?.tabLabel || "Beauty",
            },
          ]
        : []),
    ],
    [isBeautyAllowed, t],
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        t?.rooms?.videoCall?.backgroundsAndEffects || "Backgrounds and effects"
      }
      className="md:max-w-[800px] h-full md:h-[560px] md:max-h-[85vh]"
      headerClassName="flex items-center justify-between p-4 shrink-0"
      bodyClassName="!px-0 flex-1 flex flex-col min-h-0 overflow-y-auto md:overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0 px-4 md:pl-4 md:pr-0">
        {/* Left Column: Video Preview - portrait on mobile, landscape on desktop */}
        <div className="min-w-0 flex flex-col bg-[#202124] rounded-2xl overflow-hidden relative aspect-[3/4] md:aspect-video w-full md:self-start max-h-[40vh] md:max-h-none">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraOn ? "opacity-100" : "opacity-0"}`}
            style={{ transform: "scaleX(-1)" }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center gap-4">
              <VideoOff size={20} />

              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-white">
                  {t?.rooms?.videoCall?.cameraIsOff || "Camera is turned off"}
                </span>
                <span className="text-xs text-neutral-400 max-w-[240px]">
                  {t?.rooms?.videoCall?.cameraOffDesc ||
                    "Turn on your camera to preview effects."}
                </span>
              </div>
              {onToggleCam && (
                <PillButton onClick={onToggleCam} variant="primary">
                  {t?.rooms?.videoCall?.controls?.camOn || "Turn on camera"}
                </PillButton>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Picker */}
        <div className="w-full min-w-0 flex flex-col h-full min-h-0">
          {/* Tab strip */}
          {tabs.length > 1 && (
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              fullWidth={false}
              className="shrink-0 pr-4"
            />
          )}

          <div className="flex-1 min-h-0 md:overflow-y-auto pr-4 pt-4">
            {activeTab === "backgrounds" ? (
              <VirtualBackgroundPicker onApply={handleApply} />
            ) : (
              isBeautyAllowed && (
                <BeautyPicker
                  beautyOptions={beautyOptions}
                  onChange={handleBeautyChange}
                  roomType={room?.roomType}
                  className="pl-2.5"
                />
              )
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default VirtualBackgroundModal
