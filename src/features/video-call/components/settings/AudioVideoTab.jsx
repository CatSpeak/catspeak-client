import React, { useState, useEffect, useRef } from "react"
import { Mic, Video, Volume2, Info } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import MicTestVisualizer from "./MicTestVisualizer"
import {
  buildAudioConstraint,
  mapDevicesToOptions,
} from "@/shared/utils/mediaConstraintUtils"

const getCleanLabel = (str, fallback) => {
  if (!str) return fallback
  return str.replace(/^(Chọn|Select)\s+/i, "")
}

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
    waitingT.systemDefault || waitingT.systemDefaultSpeaker || "System default"

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
    <div className="px-4 pb-4 flex flex-col h-full justify-between gap-4">
      {/* Device Selection Rows (Clean, Borderless) */}
      <div className="flex flex-col">
        {/* Microphone Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[56px]">
          <div className="flex items-center gap-4 min-w-0">
            <Mic
              className="text-neutral-600 dark:text-[#AAAAAA] shrink-0"
              size={20}
            />
            <p className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white truncate">
              {getCleanLabel(waitingT.selectMicrophone, "Microphone")}
            </p>
          </div>

          <Dropdown
            options={mapDevicesToOptions(
              devices.audioinput,
              <Mic size={18} />,
              true,
              systemDefaultLabel,
              waitingT.unknownDevice,
            )}
            value={selectedMic}
            onChange={(val) => setSelectedMic?.(val)}
            placeholder={
              (devices.audioinput?.length || 0) > 0
                ? waitingT.selectMicrophone || "Select Microphone"
                : (waitingT.micNotFound || "No microphone found").replace(
                    /\.+$/,
                    "",
                  )
            }
            ariaLabel={`${waitingT.selectMicrophone || "Microphone"}: ${selectedMicLabel}`}
            disabled={(devices.audioinput?.length || 0) === 0}
            fitContent
            className="w-full sm:w-auto shrink-0"
            align="right"
            roundedClass="rounded-xl"
            dropdownClassName="w-max min-w-[220px] max-w-[min(480px,calc(100vw-32px))]"
          />
        </div>

        {/* Speaker Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[56px]">
          <div className="flex items-center gap-4 min-w-0">
            <Volume2
              className="text-neutral-600 dark:text-[#AAAAAA] shrink-0"
              size={20}
            />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white truncate">
                {getCleanLabel(waitingT.selectSpeaker, "Speaker")}
              </p>
              {!isSinkSupported && (
                <p className="text-[11px] text-gray-500 dark:text-[#AAAAAA] flex items-center gap-1 mt-0.5">
                  <Info
                    size={12}
                    className="shrink-0 text-amber-500"
                    aria-hidden="true"
                  />{" "}
                  {waitingT.speakerNotSupported ||
                    "Speaker selection is not supported in your browser."}
                </p>
              )}
            </div>
          </div>

          <Dropdown
            options={mapDevicesToOptions(
              devices.audiooutput,
              <Volume2 size={18} />,
              true,
              systemDefaultLabel,
              waitingT.unknownDevice,
            )}
            value={selectedSpeaker}
            onChange={(val) => setSelectedSpeaker?.(val)}
            placeholder={
              !isSinkSupported
                ? waitingT.systemDefaultSpeaker || "System Default Speaker"
                : (devices.audiooutput?.length || 0) > 0
                  ? waitingT.selectSpeaker || "Select Speaker"
                  : (waitingT.speakerNotFound || "No speaker found").replace(
                      /\.+$/,
                      "",
                    )
            }
            ariaLabel={`${waitingT.selectSpeaker || "Speaker"}: ${selectedSpeakerLabel}`}
            disabled={
              !isSinkSupported || (devices.audiooutput?.length || 0) === 0
            }
            fitContent
            className="w-full sm:w-auto shrink-0"
            align="right"
            roundedClass="rounded-xl"
            dropdownClassName="w-max min-w-[220px] max-w-[min(480px,calc(100vw-32px))]"
          />
        </div>

        {/* Camera Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[56px]">
          <div className="flex items-center gap-4 min-w-0">
            <Video
              className="text-neutral-600 dark:text-[#AAAAAA] shrink-0"
              size={20}
            />
            <p className="text-sm sm:text-base font-medium text-neutral-900 dark:text-white truncate">
              {getCleanLabel(waitingT.selectCamera, "Camera")}
            </p>
          </div>

          <Dropdown
            options={mapDevicesToOptions(
              devices.videoinput,
              <Video size={18} />,
              false,
              systemDefaultLabel,
              waitingT.unknownDevice,
            )}
            value={selectedCamera}
            onChange={(val) => setSelectedCamera?.(val)}
            placeholder={
              (devices.videoinput?.length || 0) > 0
                ? waitingT.selectCamera || "Select Camera"
                : (waitingT.cameraNotFound || "No camera found").replace(
                    /\.+$/,
                    "",
                  )
            }
            ariaLabel={`${waitingT.selectCamera || "Camera"}: ${selectedCameraLabel}`}
            disabled={(devices.videoinput?.length || 0) === 0}
            fitContent
            className="w-full sm:w-auto shrink-0"
            align="right"
            roundedClass="rounded-xl"
            dropdownClassName="w-max min-w-[220px] max-w-[min(480px,calc(100vw-32px))]"
          />
        </div>
      </div>

      {/* Mic Test Visualizer Section (Separated by subtle border line) */}
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
