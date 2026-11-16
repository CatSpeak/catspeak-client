import React from "react"
import { Circle, AlertTriangle } from "lucide-react"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const RecordingButton = ({
  isRecording: propIsRecording,
  isTogglingRecording: propIsTogglingRecording,
  onToggleRecording: propOnToggleRecording,
  onStopRecording: propOnStopRecording,
}) => {
  const { t } = useLanguage()
  const globalCall = useGlobalVideoCall()

  const isRecording = propIsRecording ?? globalCall?.isRecording ?? false
  const isTogglingRecording =
    propIsTogglingRecording ?? globalCall?.isTogglingRecording ?? false
  const onToggleRecording =
    propOnToggleRecording ?? globalCall?.handleToggleRecording
  const onStopRecording =
    propOnStopRecording ?? globalCall?.confirmStopRecording

  const {
    formattedTime = "00:00",
    totalUsedMb = 0,
    limitMb = null,
    usagePercent = 0,
    isDanger = false,
    isWarning = false,
  } = globalCall?.recordingStatus || {}

  const title = isRecording
    ? t.rooms?.videoCall?.controls?.recordOff || "Stop recording"
    : t.rooms?.videoCall?.controls?.recordOn || "Start recording"

  const progressColor = isDanger
    ? "bg-red-500 animate-pulse"
    : isWarning
      ? "bg-amber-500"
      : "bg-emerald-500"

  if (!isRecording) {
    return (
      <IconButton
        variant="control"
        disabled={isTogglingRecording}
        onClick={onToggleRecording}
        title={title}
      >
        <Circle />
      </IconButton>
    )
  }

  return (
    <div className="relative group flex items-center">
      <button
        onClick={onToggleRecording}
        disabled={isTogglingRecording}
        title={title}
        className="inline-flex items-center justify-center rounded-full focus:outline-none shrink-0 h-12"
      >
        <span className="relative inline-flex items-center justify-center rounded-full transition-colors shadow-sm overflow-hidden bg-red-600 hover:bg-red-700 text-white px-4 h-10">
          <div className="flex items-center justify-center gap-2 w-full">
            <span className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>

            <span className="text-sm font-semibold tracking-wider">
              {formattedTime}
            </span>
          </div>
        </span>
      </button>

      {/* Hover Popover (Storage Details) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 pb-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto w-[360px]">
        <div className="bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white border border-border dark:border-[#3F3F3F] rounded-xl p-4 shadow-xl flex flex-col">
          <div className="text-xs flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-neutral-200">
              {t?.recordings?.storage?.title || "Storage"}
            </span>

            <span className="font-medium text-gray-600 dark:text-neutral-300">
              {totalUsedMb.toFixed(1)}MB{" "}
              {limitMb != null && limitMb > 0
                ? `/ ${limitMb.toFixed(0)}MB`
                : "(Unlimited)"}
            </span>
          </div>

          <div className="w-full flex items-center">
            <ProgressBar
              progress={usagePercent}
              heightClass="h-2"
              trackColorClass="bg-primaryBg dark:bg-[#272727]"
              colorClass={progressColor}
            />
          </div>

          {isDanger && (
            <div className="flex items-center gap-1 text-[11px] text-red-600 font-bold animate-pulse">
              <AlertTriangle size={12} />
              <span>Critical Space!</span>
            </div>
          )}
          {isWarning && !isDanger && (
            <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
              <AlertTriangle size={12} />
              <span>Approaching Limit.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecordingButton
