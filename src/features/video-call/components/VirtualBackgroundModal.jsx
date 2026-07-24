import React, { useEffect, useRef, useState } from "react";
import Modal from "@/shared/components/ui/Modal";
import VirtualBackgroundPicker from "./VirtualBackgroundPicker";
import BeautyPicker from "./BeautyPicker";
import { useLanguage } from "@/shared/context/LanguageContext";

import { isBeautyFilterSupported } from "@/features/video-call/utils/roomTypeHelpers";

const BEAUTY_STORAGE_KEY = "catspeak:beautyOptions";

const readStoredBeautyOptions = () => {
  try {
    const raw = localStorage.getItem(BEAUTY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt data */
  }
  return null;
};

const persistBeautyOptions = (opts) => {
  try {
    localStorage.setItem(BEAUTY_STORAGE_KEY, JSON.stringify(opts));
  } catch {
    /* quota exceeded — silently drop */
  }
};

const VirtualBackgroundModal = ({
  open,
  onClose,
  localStream,
  cameraOn,
  onToggleCam,
  lkVideoTrack,
  room,
}) => {
  const { t } = useLanguage();
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (lkVideoTrack) {
      lkVideoTrack.attach(videoElement);
      return () => {
        lkVideoTrack.detach(videoElement);
      };
    } else if (localStream) {
      videoElement.srcObject = localStream;
    } else {
      videoElement.srcObject = null;
    }
  }, [lkVideoTrack, localStream]);
  const [activeTab, setActiveTab] = useState("backgrounds");

  // Initialise beauty options from localStorage so pre-join selections survive
  // page reloads and carry over into the in-call session.
  const [beautyOptions, setBeautyOptions] = useState(() => {
    const stored = readStoredBeautyOptions();
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
    );
  });

  // Persist beauty options to localStorage whenever they change so the
  // in-call processor (useCombinedProcessor) can pick them up on attach.
  useEffect(() => {
    persistBeautyOptions(beautyOptions);
  }, [beautyOptions]);

  const handleBeautyChange = (key, value) => {
    setBeautyOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = (url) => {
    // Automatically turn on camera if an effect is selected while camera is off
    if (!cameraOn && url !== null && onToggleCam) {
      onToggleCam();
    }
  };

  const tabLabel = (tab) => {
    if (tab === "backgrounds")
      return t?.rooms?.videoCall?.tabBackgrounds || "Backgrounds";
    return t?.rooms?.beauty?.tabLabel || "Beauty";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        t?.rooms?.videoCall?.backgroundsAndEffects || "Backgrounds and effects"
      }
      className="md:max-w-[800px] min-h-[500px] "
      headerClassName="flex items-center justify-between py-4 px-6"
      bodyClassName="px-6 pb-6 flex-1 overflow-y-auto"
    >
      <div className="flex flex-col md:flex-row gap-5 h-full min-h-[400px]">
        {/* Left Column: Video Preview */}
        <div className="min-w-0 flex flex-col bg-[#202124] rounded-xl overflow-hidden relative aspect-video md:w-[280px] w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraOn ? "opacity-100" : "opacity-0"}`}
            style={{ transform: "scaleX(-1)" }}
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
              <span className="text-sm font-medium">
                {t?.rooms?.videoCall?.cameraOffWarning ||
                  "Your camera is turned off. Selecting an effect will turn it on."}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Picker */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col flex-1 md:h-auto">
          {/* Tab strip */}
          {(() => {
            const availableTabs = isBeautyFilterSupported(room?.roomType)
              ? ["backgrounds", "beauty"]
              : ["backgrounds"];
            if (availableTabs.length <= 1) return null;
            return (
              <div className="flex border-b border-[#E5E5E5] mb-3">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-cath-red-600 text-cath-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tabLabel(tab)}
                  </button>
                ))}
              </div>
            );
          })()}

          {activeTab === "backgrounds" ? (
            <VirtualBackgroundPicker onApply={handleApply} className="p-0" />
          ) : (
            <BeautyPicker
              beautyOptions={beautyOptions}
              onChange={handleBeautyChange}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VirtualBackgroundModal;
