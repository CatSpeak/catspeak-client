import { useState } from "react"
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Flame,
  Lock,
  Medal,
  Mic,
  Sparkles,
} from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import { cn } from "@/lib/utils"
import { DEFAULT_TARGET_BAND, TARGET_BANDS } from "../constants/bands"

const BAND_ICONS = {
  hsk1_2: Sparkles,
  hsk3_4: Flame,
  hsk5_6: Medal,
}

const TONES = {
  emerald: {
    badge: "bg-[#ECFDF5] text-[#059669]",
    specBox: "bg-slate-50",
    specText: "text-slate-600",
    chip: "bg-slate-100 text-slate-600",
    bar: "bg-emerald-500",
  },
  primary: {
    badge: "bg-cath-red-700 text-white",
    specBox: "bg-[#FFF1F2]",
    specText: "text-cath-red-700",
    chip: "bg-red-100 text-cath-red-700",
    bar: "bg-cath-red-700",
  },
  violet: {
    badge: "bg-violet-100 text-violet-600",
    specBox: "bg-slate-50",
    specText: "text-slate-600",
    chip: "bg-violet-50 text-slate-600",
    bar: "bg-violet-500",
  },
}

const formatTemplate = (template, token, value) =>
  String(template || "").replace(`{{${token}}}`, value)

const BandStep = ({ copy, onStart, creating }) => {
  const bandCopy = copy?.band || {}
  const items = bandCopy.items || {}
  const [selected, setSelected] = useState(DEFAULT_TARGET_BAND)
  const selectedTitle = items[selected]?.title || ""

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold leading-8 text-[#09090B]">
          {bandCopy.title}
        </h1>
        <p className="max-w-2xl text-[13px] font-semibold leading-[19px] text-slate-600">
          {bandCopy.subtitle}
        </p>
      </div>

      <div className="grid w-full gap-4 md:grid-cols-3 md:gap-5">
        {TARGET_BANDS.map((band) => {
          const item = items[band.id] || {}
          const tone = TONES[band.tone] || TONES.primary
          const Icon = BAND_ICONS[band.id] || Sparkles
          const isSelected = band.id === selected

          return (
            <button
              key={band.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelected(band.id)}
              className={cn(
                "flex flex-col justify-between gap-5 rounded-2xl border-2 bg-white p-5 text-left transition-all",
                isSelected
                  ? "border-cath-red-700 shadow-[0_12px_28px_-2px_rgba(153,0,17,0.2),0_2px_6px_rgba(153,0,17,0.1)]"
                  : "border-slate-300 shadow-sm hover:border-slate-400",
              )}
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-[10px] font-medium uppercase leading-none",
                      tone.badge,
                    )}
                  >
                    <Icon size={13} strokeWidth={2} />
                    {item.level}
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-cath-red-700 bg-cath-red-700 text-white"
                        : "border-slate-300 text-transparent",
                    )}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                </div>
                <h2
                  className={cn(
                    "text-[26px] font-bold leading-8",
                    isSelected ? "text-cath-red-700" : "text-[#09090B]",
                  )}
                >
                  {item.title}
                </h2>
                <p className="text-xs font-medium leading-[17px] text-slate-600">
                  {item.desc}
                </p>
                <div
                  className={cn(
                    "flex flex-col gap-1.5 rounded-[10px] px-3 py-2.5",
                    tone.specBox,
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-2 text-[11px] font-medium leading-4",
                      tone.specText,
                    )}
                  >
                    <BookOpen size={14} strokeWidth={2} />
                    {item.vocab}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-2 text-[11px] font-medium leading-4",
                      tone.specText,
                    )}
                  >
                    <Clock size={14} strokeWidth={2} />
                    {item.time}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(item.topics || []).map((topic) => (
                    <span
                      key={topic}
                      className={cn(
                        "rounded-md px-2 py-1 text-[11px] font-medium leading-none",
                        tone.chip,
                      )}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-[11px] font-semibold leading-4",
                    isSelected ? "text-cath-red-700" : "text-slate-600",
                  )}
                >
                  {bandCopy.difficultyLabel} {item.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  {[1, 2, 3].map((step) => (
                    <span
                      key={step}
                      className={cn(
                        "h-1.5 w-3.5 rounded-full",
                        step <= band.difficulty ? tone.bar : "bg-slate-200",
                      )}
                    />
                  ))}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-2">
        <PillButton
          onClick={() => onStart(selected)}
          loading={creating}
          startIcon={<Mic size={16} />}
          endIcon={<ArrowRight size={16} />}
          className="w-full max-w-[400px]"
          roundedClass="rounded-[14px]"
        >
          {formatTemplate(bandCopy.startCta, "band", selectedTitle)}
        </PillButton>
        <span className="flex items-center gap-1.5 text-[11px] font-medium leading-4 text-slate-600">
          <Lock size={12} className="text-slate-400" />
          {bandCopy.lockedNote}
        </span>
      </div>
    </div>
  )
}

export default BandStep
