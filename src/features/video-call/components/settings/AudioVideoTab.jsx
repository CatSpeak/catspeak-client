import React, { useState, useEffect, useRef } from "react"
import { Mic, Video, Volume2, Info } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import MicTestVisualizer from "./MicTestVisualizer"
import {
  buildAudioConstraint,
  mapDevicesToOptions,
} from "@/shared/utils/mediaConstraintUtils"

const DeviceSection = ({ icon, title, children }) => (
  <section className="flex flex-col gap-3 rounded-xl border border-[#e5e5e5] bg-white p-4">
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cath-red-700/10 text-cath-red-700">
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
    </div>
    {children}
  </section>
)

const AudioVideoTab = ({
  waitingT = {},
  deviceSelection = {},
  localStream = null,
  isOpen = true,
}) => {
  const {
    devices = { audioinput: [], audiooutput: [], videoinput: [] },
    selectedMic,
    setSelectedMic,
    selectedSpeaker,
    setSelectedSpeaker,
    selectedCamera,
    setSelectedCamera,
  } = deviceSelection

  const [testMic, setTestMic] = useState(false)
  const audioRef = useRef(null)
  const testStreamRef = useRef(null)

  const isSinkSupported =
    typeof HTMLAudioElement !== "undefined" &&
    typeof HTMLAudioElement.prototype.setSinkId === "function"

  const systemDefaultLabel =
    waitingT.systemDefault ||
    waitingT.systemDefaultSpeaker ||
    "System default"

  const selectedMicLabel =
    devices.audioinput?.find((d) => d.deviceId === selectedMic)?.label ||
    systemDefaultLabel
  const selectedSpeakerLabel =
    devices.audiooutput?.find((d) => d.deviceId === selectedSpeaker)?.label ||
    systemDefaultLabel
  const selectedCameraLabel =
    devices.videoinput?.find((d) => d.deviceId === selectedCamera)?.label ||
    waitingT.unknownDevice ||
    "Unknown Device"

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
          if (audioRef.current) {
            audioRef.current.srcObject = stream
          }
        }
      } catch (err) {
        console.error("[AudioVideoTab] Failed to start mic test stream:", err)
      }
    }

    if (testMic && isOpen) {
      startTestStream()
    } else {
      if (audioRef.current) {
        audioRef.current.srcObject = null
      }
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((track) => track.stop())
        testStreamRef.current = null
      }
    }

    return () => {
      cancelled = true
      if (testStreamRef.current) {
        testStreamRef.current.getTracks().forEach((track) => track.stop())
        testStreamRef.current = null
      }
    }
  }, [testMic, localStream, selectedMic, isOpen])

  // Speaker setSinkId effect
  useEffect(() => {
    if (audioRef.current && isSinkSupported && selectedSpeaker) {
      audioRef.current
        .setSinkId(selectedSpeaker)
        .catch((err) => console.error("[AudioVideoTab] setSinkId failed:", err))
    }
  }, [selectedSpeaker, isSinkSupported])

  // Reset test state when tab/modal closes
  useEffect(() => {
    if (!isOpen) {
      setTestMic(false)
    }
  }, [isOpen])

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <DeviceSection icon={<Mic size={16} aria-hidden="true" />} title={waitingT.selectMicrophone || "Microphone"}>
        <Dropdown
          options={mapDevicesToOptions(
            devices.audioinput,
            <Mic size={20} />,
            true,
            systemDefaultLabel,
            waitingT.unknownDevice
          )}
          value={selectedMic}
          onChange={(val) => setSelectedMic?.(val)}
          placeholder={waitingT.selectMicrophone || "Select Microphone"}
          ariaLabel={`${waitingT.selectMicrophone || "Microphone"}: ${selectedMicLabel}`}
          className="w-full"
          roundedClass="rounded-xl"
          dropdownClassName="w-full"
        />

        <MicTestVisualizer
          testMic={testMic}
          onToggleTest={() => setTestMic(!testMic)}
          stream={testStreamRef.current || localStream}
          selectedMic={selectedMic}
          label={waitingT.testMic || "Test mic"}
          stopLabel={waitingT.stopTest || "Stop testing"}
          hint={waitingT.micTestHint}
          listeningLabel={waitingT.micTestListening}
          detectedLabel={waitingT.micTestDetected}
        />
      </DeviceSection>

      <DeviceSection
        icon={<Volume2 size={16} aria-hidden="true" />}
        title={waitingT.selectSpeaker || "Speaker (Audio Output)"}
      >
        <Dropdown
          options={mapDevicesToOptions(
            devices.audiooutput,
            <Volume2 size={20} />,
            true,
            systemDefaultLabel,
            waitingT.unknownDevice
          )}
          value={selectedSpeaker}
          onChange={(val) => setSelectedSpeaker?.(val)}
          placeholder={
            isSinkSupported
              ? waitingT.selectSpeaker || "Select Speaker"
              : waitingT.systemDefaultSpeaker || "System Default Speaker"
          }
          ariaLabel={`${waitingT.selectSpeaker || "Speaker"}: ${selectedSpeakerLabel}`}
          disabled={!isSinkSupported}
          className="w-full"
          roundedClass="rounded-xl"
          dropdownClassName="w-full"
        />
        {!isSinkSupported && (
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <Info size={13} className="shrink-0" aria-hidden="true" />{" "}
            {waitingT.speakerNotSupported ||
              "Speaker selection is not supported in your browser."}
          </p>
        )}
      </DeviceSection>

      <DeviceSection icon={<Video size={16} aria-hidden="true" />} title={waitingT.selectCamera || "Camera"}>
        <Dropdown
          options={mapDevicesToOptions(
            devices.videoinput,
            <Video size={20} />,
            false,
            systemDefaultLabel,
            waitingT.unknownDevice
          )}
          value={selectedCamera}
          onChange={(val) => setSelectedCamera?.(val)}
          placeholder={waitingT.selectCamera || "Select Camera"}
          ariaLabel={`${waitingT.selectCamera || "Camera"}: ${selectedCameraLabel}`}
          className="w-full"
          roundedClass="rounded-xl"
          dropdownClassName="w-full"
        />
      </DeviceSection>

      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={true}
        className="hidden"
      />
    </div>
  )
}

export default AudioVideoTab
