import { useRef } from "react"
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Headphones,
  Info,
  MicOff,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Square,
  VolumeX,
} from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import { cn } from "@/lib/utils"
import useMicCapture from "../hooks/useMicCapture"
import DeviceSelect from "./DeviceSelect"
import MicLevelMeter from "./MicLevelMeter"
import StepCard from "./StepCard"

const FIX_ICONS = [VolumeX, Headphones, SlidersHorizontal]
const FIX_TONES = [
  "bg-amber-50 text-amber-600",
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
]

const formatTemplate = (template, token, value) =>
  String(template || "").replace(`{{${token}}}`, value)

const DeviceStep = ({ copy, onContinue }) => {
  const device = copy?.device || {}
  const noAudio = copy?.noAudio || {}
  const audioRef = useRef(null)
  const {
    devices,
    deviceId,
    selectDevice,
    level,
    status,
    recording,
    recordingUrl,
    recordingMs,
    startRecording,
    stopRecording,
    retry,
  } = useMicCapture()

  const isNoAudio = status === "nosignal"
  const isError = status === "error"
  const isReady = status === "ready"
  const canContinue = isReady || status === "listening"

  const handleSampleAction = () => {
    if (recording) {
      stopRecording()
      return
    }
    if (recordingUrl) {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
      return
    }
    startRecording()
  }

  const actionLabel = recording
    ? device.recording
    : recordingUrl
      ? formatTemplate(
          device.replay,
          "duration",
          (recordingMs / 1000).toFixed(1),
        )
      : device.record

  const pill = isNoAudio
    ? { className: "bg-[#FEF2F2] text-red-600", label: device.statusNoSignal }
    : isReady
      ? { className: "bg-[#F0FDF4] text-[#15803D]", label: device.statusReady }
      : isError
        ? { className: "bg-[#FEF2F2] text-red-600", label: device.statusError }
        : { className: "bg-slate-100 text-slate-600", label: device.statusListening }

  const checklist = device.checklist || []
  const fixes = noAudio.fixes || []

  return (
    <>
      <StepCard className="gap-4 lg:w-[440px] lg:shrink-0">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold leading-6 text-[#09090B]">
            {device.title}
          </h2>
          <span
            className={cn(
              "inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium",
              pill.className,
            )}
          >
            {isNoAudio || isError ? (
              <CircleAlert size={13} strokeWidth={2} />
            ) : (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isReady ? "bg-green-600" : "bg-slate-400",
                )}
              />
            )}
            {pill.label}
          </span>
        </div>

        <p
          className={cn(
            "text-[13px] font-medium leading-[19px]",
            isNoAudio || isError ? "text-red-600" : "text-slate-600",
          )}
        >
          {isNoAudio ? noAudio.instruction : device.instruction}
        </p>

        <div className="flex flex-col gap-1.5 rounded-xl bg-[#FDFBF7] px-4 py-3.5">
          <p className="text-[22px] font-bold leading-7 text-cath-red-700">
            {device.sampleHanzi}
          </p>
          <p
            className={cn(
              "text-[13px] font-medium leading-[19px]",
              isNoAudio ? "text-amber-600" : "text-slate-600",
            )}
          >
            {device.samplePinyin}
          </p>
          <p className="text-[11px] font-medium leading-4 text-slate-600">
            {device.sampleTranslation}
          </p>
        </div>

        <MicLevelMeter
          level={level}
          tone={isNoAudio || isError ? "danger" : isReady ? "primary" : "muted"}
          active={isReady}
        />

        {isNoAudio ? (
          <>
            <div className="flex items-center gap-2.5 rounded-xl bg-[#FEF2F2] px-4 py-3">
              <MicOff size={18} strokeWidth={2} className="shrink-0 text-red-600" />
              <span className="text-xs font-semibold leading-4 text-red-600">
                {noAudio.meterLabel}
              </span>
              <span className="ml-auto flex items-center gap-1">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1 w-1.5 rounded-full bg-red-200"
                  />
                ))}
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-[10px] bg-slate-50 px-3.5 py-2.5">
              <Info size={15} className="mt-0.5 shrink-0 text-slate-500" />
              <span className="text-xs font-medium leading-4 text-slate-600">
                {noAudio.info}
              </span>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={handleSampleAction}
            disabled={isError}
            className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-2.5 text-left transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-[13px] font-semibold leading-[19px] text-[#09090B]">
              {actionLabel}
            </span>
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                recording
                  ? "bg-red-100 text-red-600"
                  : "bg-[#FFF1F2] text-cath-red-700",
              )}
            >
              {recording ? (
                <Square size={13} fill="currentColor" />
              ) : (
                <Play size={14} />
              )}
            </span>
          </button>
        )}

        <audio ref={audioRef} src={recordingUrl || undefined} className="hidden" />
      </StepCard>

      <StepCard className="gap-4 lg:flex-1">
        {isNoAudio ? (
          <>
            <h2 className="text-lg font-semibold leading-7 text-[#09090B]">
              {noAudio.guideTitle}
            </h2>
            <DeviceSelect
              devices={devices}
              value={deviceId}
              onChange={selectDevice}
              title={device.deviceTitle}
              caption={noAudio.switchHint}
              placeholder={device.devicePlaceholder}
              variant="noAudio"
            />
            <div className="flex flex-col gap-3">
              {fixes.map((fix, index) => {
                const Icon = FIX_ICONS[index % FIX_ICONS.length]
                return (
                  <div
                    key={fix.title}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        FIX_TONES[index % FIX_TONES.length],
                      )}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold leading-[19px] text-[#09090B]">
                        {fix.title}
                      </span>
                      <span className="text-[11px] font-medium leading-4 text-slate-600">
                        {fix.desc}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <PillButton
              onClick={retry}
              startIcon={<RotateCcw size={16} />}
              className="w-full"
              roundedClass="rounded-xl"
            >
              {noAudio.retryCta}
            </PillButton>
          </>
        ) : isError ? (
          <>
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <CircleAlert size={26} strokeWidth={2} />
            </span>
            <h2 className="text-xl font-semibold leading-7 text-[#09090B]">
              {device.errorTitle}
            </h2>
            <p className="text-sm font-medium leading-[22px] text-slate-600">
              {device.errorBody}
            </p>
            <PillButton
              onClick={retry}
              startIcon={<RotateCcw size={16} />}
              className="w-full"
              roundedClass="rounded-xl"
            >
              {device.errorRetryCta}
            </PillButton>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold leading-7 text-[#09090B]">
              {device.deviceTitle}
            </h2>
            <DeviceSelect
              devices={devices}
              value={deviceId}
              onChange={selectDevice}
              title={device.deviceTitle}
              caption={device.deviceCaption}
              placeholder={device.devicePlaceholder}
            />
            <div className="flex flex-col gap-2.5 rounded-xl bg-[#F0FDF4] px-4 py-3.5">
              {checklist.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle2
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 text-green-600"
                  />
                  <span className="text-xs font-medium leading-[17px] text-[#15803D]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <PillButton
              onClick={onContinue}
              disabled={!canContinue}
              endIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full"
              roundedClass="rounded-[14px]"
            >
              {device.continueCta}
            </PillButton>
          </>
        )}
      </StepCard>
    </>
  )
}

export default DeviceStep
