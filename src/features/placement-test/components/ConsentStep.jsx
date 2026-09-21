import { useState } from "react"
import { ArrowRight, BarChart3, Lightbulb, Mic, Target } from "lucide-react"
import { Checkbox } from "@/shared/components/ui/inputs"
import { PillButton } from "@/shared/components/ui/buttons"
import { cn } from "@/lib/utils"
import StepCard from "./StepCard"

const FEATURE_ICONS = [Target, Mic, BarChart3]
const FEATURE_ICON_TONES = [
  "bg-red-50 text-rose-500",
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
]

const ConsentStep = ({
  copy,
  onStart,
  onRequestPermission,
  onPermissionDenied,
  requesting,
}) => {
  const [agreed, setAgreed] = useState(false)
  const consent = copy?.consent || {}
  const features = consent.features || []

  const handleCheckboxChange = async () => {
    if (agreed) {
      setAgreed(false)
      return
    }

    if (onRequestPermission) {
      const granted = await onRequestPermission()
      if (granted) {
        setAgreed(true)
      } else {
        setAgreed(false)
        if (onPermissionDenied) onPermissionDenied()
      }
    } else {
      setAgreed(true)
    }
  }

  return (
    <>
      <StepCard className="gap-4 lg:w-[440px] lg:shrink-0">
        <span className="inline-flex h-[26px] w-fit items-center rounded-full bg-red-50 px-2.5 text-[11px] font-medium text-cath-red-700">
          {consent.pill}
        </span>
        <h1 className="text-2xl font-bold leading-8 text-[#09090B]">
          {consent.heading}
        </h1>
        <p className="text-sm font-bold leading-[22px] text-[#09090B]">
          {consent.intro}
        </p>
        <div className="flex flex-col gap-3">
          {features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length]
            return (
              <div
                key={feature.title}
                className="flex items-center gap-3.5 rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    FEATURE_ICON_TONES[index % FEATURE_ICON_TONES.length],
                  )}
                >
                  <Icon size={22} strokeWidth={2} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-[#09090B]">{feature.title}</span>
                  <span className="text-xs font-medium leading-[17px] text-slate-600">
                    {feature.desc}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </StepCard>

      <StepCard className="gap-5 lg:flex-1">
        <h2 className="text-xl font-bold leading-7 text-[#09090B]">
          {consent.agreementTitle}
        </h2>
        <p className="text-[13px] font-medium leading-5 text-slate-600">
          {consent.agreementBody}
        </p>
        <div className="flex flex-col gap-1.5 rounded-xl bg-slate-50 px-4 py-3.5">
          <span className="text-xs font-medium text-slate-600">
            {consent.privacyTitle}
          </span>
          <ul className="flex flex-col gap-1 text-[11px] font-medium leading-4 text-slate-600">
            <li>• {consent.bulletAudioOnly}</li>
            <li>• {consent.bulletNoShare}</li>
          </ul>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={agreed}
            onChange={handleCheckboxChange}
            aria-label={consent.checkbox}
          />
          <span className="text-xs font-semibold leading-[18px] text-[#09090B]">
            {consent.checkbox}
          </span>
        </div>
        <PillButton
          onClick={onStart}
          disabled={!agreed}
          loading={requesting}
          endIcon={<ArrowRight className="h-4 w-4" />}
          className="w-full"
        >
          {consent.startCta}
        </PillButton>
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600">
            <Lightbulb size={14} />
          </span>
          <span className="text-[11px] font-medium leading-4 text-slate-600">
            {consent.recommend}
          </span>
        </div>
      </StepCard>
    </>
  )
}

export default ConsentStep
