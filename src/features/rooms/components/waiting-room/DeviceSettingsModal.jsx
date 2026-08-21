import React, { useState, useEffect, useRef } from "react"
import { Mic, Video, Volume2, Info } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import Modal from "@/shared/components/ui/Modal"
import MicTestVisualizer from "@/features/video-call/components/settings/MicTestVisualizer"
import {
  buildAudioConstraint,
  mapDevicesToOptions,
} from "@/shared/utils/mediaConstraintUtils"

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

  const [testMic, setTestMic] = useState(false)
  const [testStream, setTestStream] = useState(null)
  const audioRef = useRef(null)
  const testStreamRef = useRef(null)
  const autoToggledMic = useRef(false)

  const isSinkSupported =
    typeof HTMLAudioElement !== "undefined" &&
    typeof HTMLAudioElement.prototype.setSinkId === "function"

  // Reset test mic state when modal closes
  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setTestMic(false)
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
        .catch((err) => console.error("[DeviceSettings] setSinkId failed:", err))
    }
  }, [selectedSpeaker, isSinkSupported])

  const handleTestMicToggle = (checked) => {
    console.log("[DeviceSettings] Test Mic changed to:", checked)
    if (checked && !micOn && onToggleMic) {
      console.log("[DeviceSettings] Mic is off, automatically turning it on for test...")
      autoToggledMic.current = true
      onToggleMic()
    } else if (!checked && autoToggledMic.current && micOn && onToggleMic) {
      console.log("[DeviceSettings] Test finished, automatically turning mic back off...")
      autoToggledMic.current = false
      onToggleMic()
    }
    setTestMic(checked)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t?.rooms?.waitingScreen?.deviceSettings || "Device Settings"}
      className="max-w-[600px] flex flex-col"
      headerClassName="flex items-center justify-between p-6"
      bodyClassName="px-6 pb-6 flex-1 overflow-y-auto flex flex-col gap-3"
    >
      <Dropdown
        options={mapDevicesToOptions(
          devices.audioinput,
          <Mic size={16} />,
          true,
          t?.rooms?.waitingScreen?.systemDefaultSpeaker,
          t?.rooms?.waitingScreen?.unknownDevice
        )}
        value={selectedMic}
        onChange={(val) => setSelectedMic(val)}
        placeholder={
          t?.rooms?.waitingScreen?.selectMicrophone || "Select Microphone"
        }
        className="w-full"
        roundedClass="rounded-xl"
        dropdownClassName="md:min-w-[480px]"
      />

      <div className="flex flex-col gap-1">
        <Dropdown
          options={mapDevicesToOptions(
            devices.audiooutput,
            <Volume2 size={16} />,
            true,
            t?.rooms?.waitingScreen?.systemDefaultSpeaker,
            t?.rooms?.waitingScreen?.unknownDevice
          )}
          value={selectedSpeaker}
          onChange={(val) => setSelectedSpeaker(val)}
          placeholder={
            isSinkSupported
              ? t?.rooms?.waitingScreen?.selectSpeaker || "Select Speaker"
              : t?.rooms?.waitingScreen?.systemDefaultSpeaker ||
              "System Default Speaker"
          }
          disabled={!isSinkSupported}
          className="w-full"
          roundedClass="rounded-xl"
          dropdownClassName="md:min-w-[480px]"
        />
        {!isSinkSupported && (
          <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 px-1">
            <Info size={12} className="shrink-0" />{" "}
            {t?.rooms?.waitingScreen?.speakerNotSupported ||
              "Speaker selection is not supported in your browser."}
          </p>
        )}
      </div>

      <Dropdown
        options={mapDevicesToOptions(
          devices.videoinput,
          <Video size={16} />,
          false,
          t?.rooms?.waitingScreen?.systemDefaultSpeaker,
          t?.rooms?.waitingScreen?.unknownDevice
        )}
        value={selectedCamera}
        onChange={(val) => setSelectedCamera(val)}
        placeholder={t?.rooms?.waitingScreen?.selectCamera || "Select Camera"}
        className="w-full"
        roundedClass="rounded-xl"
        dropdownClassName="md:min-w-[480px]"
      />

      <div className="pt-2 border-t border-border">
        <MicTestVisualizer
          testMic={testMic}
          onToggleTest={() => handleTestMicToggle(!testMic)}
          stream={testStream || localStream}
          selectedMic={selectedMic}
          label={t?.rooms?.waitingScreen?.testMic || "Test mic"}
          stopLabel={t?.rooms?.waitingScreen?.stopTest || "Stop testing"}
        />
      </div>

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
