import React, { useState, useEffect, useRef } from "react"
import { Mic, Video, Volume2, Info } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import MicTestVisualizer from "./MicTestVisualizer"
import {
  buildAudioConstraint,
  mapDevicesToOptions,
} from "@/shared/utils/mediaConstraintUtils"

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
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-1">
        <span>{waitingT.selectMicrophone || "Microphone"}</span>
        <Dropdown
          options={mapDevicesToOptions(
            devices.audioinput,
            <Mic size={20} />,
            true,
            waitingT.systemDefaultSpeaker,
            waitingT.unknownDevice
          )}
          value={selectedMic}
          onChange={(val) => setSelectedMic?.(val)}
          placeholder={waitingT.selectMicrophone || "Select Microphone"}
          className="w-full"
          roundedClass="rounded-xl"
          dropdownClassName="w-full"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span>{waitingT.selectSpeaker || "Speaker (Audio Output)"}</span>
        <Dropdown
          options={mapDevicesToOptions(
            devices.audiooutput,
            <Volume2 size={20} />,
            true,
            waitingT.systemDefaultSpeaker,
            waitingT.unknownDevice
          )}
          value={selectedSpeaker}
          onChange={(val) => setSelectedSpeaker?.(val)}
          placeholder={
            isSinkSupported
              ? waitingT.selectSpeaker || "Select Speaker"
              : waitingT.systemDefaultSpeaker || "System Default Speaker"
          }
          disabled={!isSinkSupported}
          className="w-full"
          roundedClass="rounded-xl"
          dropdownClassName="w-full"
        />
        {!isSinkSupported && (
          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
            <Info size={13} className="shrink-0" />{" "}
            {waitingT.speakerNotSupported ||
              "Speaker selection is not supported in your browser."}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span>{waitingT.selectCamera || "Camera"}</span>
        <Dropdown
          options={mapDevicesToOptions(
            devices.videoinput,
            <Video size={20} />,
            false,
            waitingT.systemDefaultSpeaker,
            waitingT.unknownDevice
          )}
          value={selectedCamera}
          onChange={(val) => setSelectedCamera?.(val)}
          placeholder={waitingT.selectCamera || "Select Camera"}
          className="w-full"
          roundedClass="rounded-xl"
          dropdownClassName="w-full"
        />
      </div>

      <MicTestVisualizer
        testMic={testMic}
        onToggleTest={() => setTestMic(!testMic)}
        stream={testStreamRef.current || localStream}
        selectedMic={selectedMic}
        label={waitingT.testMic || "Test mic"}
        stopLabel={waitingT.stopTest || "Stop testing"}
      />

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
