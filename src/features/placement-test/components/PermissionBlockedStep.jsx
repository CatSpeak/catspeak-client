import {
  ArrowRight,
  Lock,
  MicOff,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import { cn } from "@/lib/utils"
import StepCard from "./StepCard"

const STEP_ICONS = [Lock, SlidersHorizontal, RotateCcw]
const STEP_ICON_TONES = [
  "bg-blue-50 text-blue-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
]

const PermissionBlockedStep = ({ copy, onRetry, requesting }) => {
  const blocked = copy?.blocked || {}
  const consequences = blocked.consequences || []
  const steps = blocked.steps || []

  return (
    <>
      <StepCard className="gap-4 lg:w-[440px] lg:shrink-0">
        <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <MicOff size={26} strokeWidth={2} />
        </span>
        <h1 className="text-2xl font-bold leading-8 text-[#09090B]">
          {blocked.title}
        </h1>
        <p className="text-sm font-semibold leading-[22px] text-[#09090B]">
          {blocked.body}
        </p>
        <div className="flex flex-col gap-2 rounded-2xl bg-red-50 px-[18px] py-4">
          <span className="text-[13px] font-medium leading-[19px] text-red-800">
            {blocked.consequencesTitle}
          </span>
          <ul className="flex flex-col gap-2 text-xs font-medium leading-[18px] text-slate-600">
            {consequences.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </StepCard>

      <StepCard className="gap-4 lg:flex-1">
        <h2 className="text-xl font-semibold leading-7 text-[#09090B]">
          {blocked.stepsTitle}
        </h2>
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index % STEP_ICONS.length]
            return (
              <div
                key={step.title}
                className="flex items-center gap-3.5 rounded-xl bg-slate-50 px-4 py-3"
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]",
                    STEP_ICON_TONES[index % STEP_ICON_TONES.length],
                  )}
                >
                  <Icon size={20} strokeWidth={2} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold leading-[19px] text-[#09090B]">
                    {step.title}
                  </span>
                  <span className="text-xs font-medium leading-[17px] text-slate-600">
                    {step.desc}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <PillButton
          onClick={onRetry}
          loading={requesting}
          endIcon={<ArrowRight className="h-4 w-4" />}
          className="w-full"
          roundedClass="rounded-xl"
        >
          {blocked.retryCta}
        </PillButton>
        <div className="flex items-center gap-2.5 rounded-[10px] bg-green-50 px-3.5 py-2.5">
          <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-green-600" />
          <span className="text-[11px] font-medium leading-4 text-green-700">
            {blocked.trust}
          </span>
        </div>
      </StepCard>
    </>
  )
}

export default PermissionBlockedStep
