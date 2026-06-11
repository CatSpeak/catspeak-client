import React, { useState, useEffect, useRef } from "react"
import { Mic, Video, Volume2, Info } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"
import Modal from "@/shared/components/ui/Modal"

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
  const audioRef = useRef(null)
  const autoToggledMic = useRef(false)

  const isSinkSupported =
    typeof HTMLAudioElement !== "undefined" &&
    typeof HTMLAudioElement.prototype.setSinkId === "function"

  useEffect(() => {
    if (testMic && localStream && audioRef.current) {
      console.log("[DeviceSettings] Testing mic: setting localStream to audio element.")
      console.log("[DeviceSettings] Audio tracks available in stream:", localStream.getAudioTracks().length)
      audioRef.current.srcObject = localStream
    } else if (audioRef.current) {
      audioRef.current.srcObject = null
    }
  }, [testMic, localStream])

  useEffect(() => {
    if (audioRef.current && isSinkSupported && selectedSpeaker) {
      console.log("[DeviceSettings] Attempting to setSinkId to:", selectedSpeaker)
      audioRef.current.setSinkId(selectedSpeaker).then(() => {
        console.log("[DeviceSettings] setSinkId succeeded.")
      }).catch(err => {
        console.error("[DeviceSettings] setSinkId failed:", err)
      })
    }
  }, [selectedSpeaker, isSinkSupported])

  // Stop test mic when modal closes
  useEffect(() => {
    if (!open) {
      setTestMic(false)
      if (autoToggledMic.current && onToggleMic) {
        console.log("[DeviceSettings] Modal closed, automatically turning auto-toggled mic back off...")
        autoToggledMic.current = false
        onToggleMic()
      }
    }
  }, [open, onToggleMic])

  const mapToOptions = (deviceList, icon) =>
    deviceList.map((d) => ({
      value: d.deviceId,
      label: d.label || t?.rooms?.waitingScreen?.unknownDevice || "Unknown Device",
      icon: icon,
    }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t?.rooms?.waitingScreen?.deviceSettings || "Device Settings"}
      className="max-w-[400px] flex flex-col"
      headerClassName="flex items-center justify-between p-6"
      bodyClassName="px-6 pb-6 flex-1 overflow-y-auto flex flex-col gap-6"
    >
      <Dropdown
        options={mapToOptions(devices.audioinput, <Mic size={16} />)}
        value={selectedMic}
        onChange={(val) => setSelectedMic(val)}
        placeholder={t?.rooms?.waitingScreen?.selectMicrophone || "Select Microphone"}
        className="w-full"
        triggerClassName="h-12"
        dropdownClassName="min-w-[280px]"
      />

      <div className="flex flex-col gap-1">
        <Dropdown
          options={mapToOptions(devices.audiooutput, <Volume2 size={16} />)}
          value={selectedSpeaker}
          onChange={(val) => setSelectedSpeaker(val)}
          placeholder={
            isSinkSupported 
              ? (t?.rooms?.waitingScreen?.selectSpeaker || "Select Speaker") 
              : (t?.rooms?.waitingScreen?.systemDefaultSpeaker || "System Default Speaker")
          }
          disabled={!isSinkSupported}
          className="w-full"
          triggerClassName="h-12"
          dropdownClassName="min-w-[280px]"
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
        options={mapToOptions(devices.videoinput, <Video size={16} />)}
        value={selectedCamera}
        onChange={(val) => setSelectedCamera(val)}
        placeholder={t?.rooms?.waitingScreen?.selectCamera || "Select Camera"}
        className="w-full"
        triggerClassName="h-12"
        dropdownClassName="min-w-[280px]"
      />

      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          id="test-mic"
          checked={testMic}
          onChange={(e) => {
            const checked = e.target.checked
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
          }}
          className="rounded border-gray-300 text-cath-red-700 focus:ring-cath-red-700 h-4 w-4 accent-cath-red-700"
        />
        <label
          htmlFor="test-mic"
          className="text-sm text-gray-700 cursor-pointer select-none"
        >
          {t?.rooms?.waitingScreen?.testMic || "Test Microphone (Playback)"}
        </label>
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
