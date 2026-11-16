import React, { useState, useEffect, useRef } from "react"
import { Mic, Video, Volume2, Info } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import Modal from "@/shared/components/ui/Modal"
import Tabs from "@/shared/components/ui/navigation/Tabs"
import MeetingAvatarPicker from "@/features/video-call/components/MeetingAvatarPicker"
import MicTestVisualizer from "@/features/video-call/components/settings/MicTestVisualizer"
import {
  buildAudioConstraint,
  mapDevicesToOptions,
} from "@/shared/utils/mediaConstraintUtils"

const getCleanLabel = (str, fallback) => {
  if (!str) return fallback
  return str.replace(/^(Chọn|Select)\s+/i, "")
}

const DeviceSettingsModal = ({
  open,
  onClose,
  deviceSelection,
  localStream,
  micOn,
  onToggleMic,
  t,
}) => {
  const {
    devices,
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker,
    selectedCamera,
    setSelectedCamera,
  } = deviceSelection

  const [activeTab, setActiveTab] = useState("devices")
  const [testMic, setTestMic] = useState(false)
  const [testStream, setTestStream] = useState(null)
  const audioRef = useRef(null)
  const testStreamRef = useRef(null)
  const autoToggledMic = useRef(false)

  const isSinkSupported =
    typeof HTMLAudioElement !== "undefined" &&
    typeof HTMLAudioElement.prototype.setSinkId === "function"

  // Reset test mic state and tab when modal closes
  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setTestMic(false)
        setActiveTab("devices")
      })
      if (autoToggledMic.current && micOn && onToggleMic) {
        autoToggledMic.current = false
        onToggleMic()
      }
    }
  }, [open, micOn, onToggleMic])

  // Microphone playback test effect
  useEffect(() => {
    let cancelled = false

    const startTestStream = async () => {
      try {
        if (localStream) {
          if (audioRef.current && !cancelled) {
            audioRef.current.srcObject = localStream
          }
        } else {
          // Request temporary audio stream for testing
          const constraints = {
            audio: buildAudioConstraint(selectedMic),
          }
          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          if (cancelled) {
            stream.getTracks().forEach((track) => track.stop())
            return
          }
          testStreamRef.current = stream
          setTestStream(stream)
          if (audioRef.current) {
            audioRef.current.srcObject = stream
          }
        }
      } catch (err) {
        console.error("[DeviceSettings] Failed to start mic test stream:", err)
      }
    }

    if (testMic && open) {
      startTestStream()
    } else {
      if (audioRef.current) {
        audioRef.current.srcObject = null
      }
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((track) => track.stop())
        testStreamRef.current = null
        queueMicrotask(() => setTestStream(null))
      }
    }

    return () => {
      cancelled = true
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((track) => track.stop())
        testStreamRef.current = null
        setTestStream(null)
      }
    }
  }, [testMic, localStream, selectedMic, open])

  // Speaker setSinkId effect
  useEffect(() => {
    if (audioRef.current && isSinkSupported && selectedSpeaker) {
      audioRef.current
        .setSinkId(selectedSpeaker)
        .catch((err) =>
          console.error("[DeviceSettings] setSinkId failed:", err),
        )
    }
  }, [selectedSpeaker, isSinkSupported])

  const handleTestMicToggle = (checked) => {
    console.log("[DeviceSettings] Test Mic changed to:", checked)
    if (checked && !micOn && onToggleMic) {
      console.log(
        "[DeviceSettings] Mic is off, automatically turning it on for test...",
      )
      autoToggledMic.current = true
      onToggleMic()
    } else if (!checked && autoToggledMic.current && micOn && onToggleMic) {
      console.log(
        "[DeviceSettings] Test finished, automatically turning mic back off...",
      )
      autoToggledMic.current = false
      onToggleMic()
    }
    setTestMic(checked)
  }

  const tabs = [
    {
      id: "devices",
      label:
        t?.rooms?.waitingScreen?.deviceSettingsTab ||
        t?.rooms?.waitingScreen?.deviceSettings ||
        "Device Settings",
    },
    {
      id: "avatar",
      label: t?.rooms?.avatarPicker?.tabLabel || "Avatar",
    },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t?.rooms?.waitingScreen?.deviceSettings || "Settings"}
      className="max-w-[600px] h-full md:h-[480px] md:max-h-[85vh] flex flex-col"
      headerClassName="flex items-center justify-between p-4 shrink-0"
      bodyClassName="px-4 flex-1 flex flex-col min-h-0 overflow-y-auto"
    >
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        fullWidth={false}
        className="shrink-0"
      />

      {activeTab === "devices" ? (
        <div className="flex-1 flex flex-col justify-between mt-4 min-h-0">
          <div className="flex flex-col">
            {/* Microphone Row */}
            <div className="h-[56px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-4 min-w-0">
                <Mic className="dark:text-[#AAAAAA] shrink-0" />
                <p className="text-base dark:text-white truncate">
                  {getCleanLabel(
                    t?.rooms?.waitingScreen?.selectMicrophone,
                    "Microphone",
                  )}
                </p>
              </div>

              <Dropdown
                options={mapDevicesToOptions(
                  devices.audioinput,
                  null,
                  true,
                  t?.rooms?.waitingScreen?.systemDefault || "System Default",
                  t?.rooms?.waitingScreen?.unknownDevice,
                )}
                value={selectedMic}
                onChange={(val) => setSelectedMic(val)}
                placeholder={
                  (devices.audioinput?.length || 0) > 0
                    ? t?.rooms?.waitingScreen?.selectMicrophone ||
                      "Select Microphone"
                    : (
                        t?.rooms?.waitingScreen?.micNotFound ||
                        "No microphone found"
                      ).replace(/\.+$/, "")
                }
                disabled={(devices.audioinput?.length || 0) === 0}
                fitContent
                className="w-full sm:w-auto shrink-0"
                align="right"
                dropdownClassName="w-max min-w-[220px] max-w-[min(480px,calc(100vw-32px))]"
              />
            </div>

            {/* Speaker Row */}
            <div className="h-[56px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-4 min-w-0">
                <Volume2 className="dark:text-[#AAAAAA] shrink-0" />
                <div className="min-w-0">
                  <p className="text-base dark:text-white truncate">
                    {getCleanLabel(
                      t?.rooms?.waitingScreen?.selectSpeaker,
                      "Speaker",
                    )}
                  </p>
                  {!isSinkSupported && (
                    <p className="text-[11px] text-gray-500 dark:text-[#AAAAAA] flex items-center gap-1 mt-0.5">
                      <Info size={12} className="shrink-0 text-amber-500" />{" "}
                      {t?.rooms?.waitingScreen?.speakerNotSupported ||
                        "Speaker selection is not supported in your browser."}
                    </p>
                  )}
                </div>
              </div>

              <Dropdown
                options={mapDevicesToOptions(
                  devices.audiooutput,
                  null,
                  true,
                  t?.rooms?.waitingScreen?.systemDefault || "System Default",
                  t?.rooms?.waitingScreen?.unknownDevice,
                )}
                value={selectedSpeaker}
                onChange={(val) => setSelectedSpeaker(val)}
                placeholder={
                  !isSinkSupported
                    ? t?.rooms?.waitingScreen?.systemDefault || "System Default"
                    : (devices.audiooutput?.length || 0) > 0
                      ? t?.rooms?.waitingScreen?.selectSpeaker ||
                        "Select Speaker"
                      : (
                          t?.rooms?.waitingScreen?.speakerNotFound ||
                          "No speaker found"
                        ).replace(/\.+$/, "")
                }
                disabled={
                  !isSinkSupported || (devices.audiooutput?.length || 0) === 0
                }
                fitContent
                className="w-full sm:w-auto shrink-0"
                align="right"
                dropdownClassName="w-max min-w-[220px] max-w-[min(480px,calc(100vw-32px))]"
              />
            </div>

            {/* Camera Row */}
            <div className="h-[56px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-4 min-w-0">
                <Video className="dark:text-[#AAAAAA] shrink-0" />
                <p className="text-base dark:text-white truncate">
                  {getCleanLabel(
                    t?.rooms?.waitingScreen?.selectCamera,
                    "Camera",
                  )}
                </p>
              </div>

              <Dropdown
                options={mapDevicesToOptions(
                  devices.videoinput,
                  null,
                  false,
                  undefined,
                  t?.rooms?.waitingScreen?.unknownDevice,
                )}
                value={selectedCamera}
                onChange={(val) => setSelectedCamera(val)}
                placeholder={
                  (devices.videoinput?.length || 0) > 0
                    ? t?.rooms?.waitingScreen?.selectCamera || "Select Camera"
                    : (
                        t?.rooms?.waitingScreen?.cameraNotFound ||
                        "No camera found"
                      ).replace(/\.+$/, "")
                }
                disabled={(devices.videoinput?.length || 0) === 0}
                fitContent
                className="w-full sm:w-auto shrink-0"
                align="right"
                dropdownClassName="w-max min-w-[200px] max-w-[min(480px,calc(100vw-32px))]"
              />
            </div>
          </div>

          {/* Mic Test Visualizer */}
          <div className="mt-auto pt-4">
            <MicTestVisualizer
              testMic={testMic}
              onToggleTest={() => handleTestMicToggle(!testMic)}
              stream={testStream || localStream}
              selectedMic={selectedMic}
              label={t?.rooms?.waitingScreen?.testMic || "Test mic"}
              stopLabel={t?.rooms?.waitingScreen?.stopTest || "Stop testing"}
            />
          </div>
        </div>
      ) : (
        <div className="pt-4 flex-1 flex flex-col min-h-0">
          <MeetingAvatarPicker className="p-0" />
        </div>
      )}

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={!testMic}
        className="hidden"
      />
    </Modal>
  )
}

export default DeviceSettingsModal
