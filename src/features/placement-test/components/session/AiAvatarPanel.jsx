import { cn } from "@/lib/utils"

const BAR_HEIGHTS = [38, 72, 52, 86, 44, 66, 34]

const TONES = {
  listening: {
    bar: "bg-[#CF5B5B]",
    glyph: "text-[#CF5B5B]",
    pill: "bg-[#FFF1F2] text-[#CF5B5B]",
  },
  analyzing: {
    bar: "bg-emerald-500",
    glyph: "text-emerald-500",
    pill: "bg-[#F0FDF4] text-[#16A34A]",
  },
  notHearing: {
    bar: "bg-amber-600",
    glyph: "text-amber-600",
    pill: "bg-[#FFFBEB] text-[#B45309]",
  },
}

const AiAvatarPanel = ({ tone = "listening", statusText }) => {
  const palette = TONES[tone] || TONES.listening

  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-[0_6px_18px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.02)]">
      <div className="flex h-16 items-center gap-2.5">
        {BAR_HEIGHTS.map((height, index) => (
          <span
            key={index}
            className={cn("w-2 animate-pulse rounded-full", palette.bar)}
            style={{
              height: `${height}%`,
              animationDelay: `${index * 120}ms`,
              animationDuration: "1100ms",
            }}
          />
        ))}
      </div>

      <span
        className={cn(
          "text-[44px] font-bold leading-none",
          palette.glyph,
        )}
      >
        ω
      </span>

      <span
        className={cn(
          "inline-flex min-h-[30px] items-center justify-center rounded-full px-4 py-1.5 text-center text-xs font-medium",
          palette.pill,
        )}
      >
        {statusText}
      </span>
    </div>
  )
}

export default AiAvatarPanel
