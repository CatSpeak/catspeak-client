import { cn } from "@/lib/utils"

const BAR_HEIGHTS = [38, 72, 52, 86, 44, 66, 34]

const TONES = {
  listening: {
    bar: "bg-[#CF5B5B]",
    pill: "bg-[#FFF1F2] text-[#CF5B5B]",
  },
  analyzing: {
    bar: "bg-emerald-500",
    pill: "bg-[#F0FDF4] text-[#16A34A]",
  },
  notHearing: {
    bar: "bg-amber-600",
    pill: "bg-[#FFFBEB] text-[#B45309]",
  },
}

// Gương mặt mèo của AI (BUG-PT-10): hai mắt bầu dục và miệng ω, vẽ bằng SVG để
// làm động được. Mắt chớp đều; khi AI đang đọc thì miệng nhấp nhô theo nhịp nói.
// Có mascot Voxis chính thức thì thay khối <svg> này.
const MascotFace = ({ speaking = false }) => (
  <svg
    viewBox="0 0 120 90"
    className="h-20 w-[107px] select-none"
    role="img"
    aria-label="Voxis"
  >
    <style>{`
      .pt-eye { transform-box: fill-box; transform-origin: center; animation: pt-blink 4.2s infinite; }
      .pt-mouth { transform-box: fill-box; transform-origin: center top; }
      .pt-mouth.is-speaking { animation: pt-talk 0.32s ease-in-out infinite alternate; }
      @keyframes pt-blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.12); } }
      @keyframes pt-talk { from { transform: scaleY(0.75); } to { transform: scaleY(1.35); } }
      @media (prefers-reduced-motion: reduce) {
        .pt-eye, .pt-mouth.is-speaking { animation: none; }
      }
    `}</style>
    <ellipse className="pt-eye" cx="16" cy="28" rx="11" ry="26" fill="#A50016" />
    <ellipse className="pt-eye" cx="104" cy="28" rx="11" ry="26" fill="#A50016" />
    <path
      className={cn("pt-mouth", speaking && "is-speaking")}
      d="M36 68 C40 82 52 84 60 75 C68 84 80 82 84 68"
      fill="none"
      stroke="#A50016"
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
)

const AiAvatarPanel = ({
  tone = "listening",
  statusText,
  processingLabel,
  isRecording = false,
  aiSpeaking = false,
  micLevel = 0,
}) => {
  const palette = TONES[tone] || TONES.listening

  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-[0_6px_18px_-2px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.02)]">
      <div className="flex h-16 items-center gap-2.5">
        {BAR_HEIGHTS.map((height, index) => {
          const dynamicHeight = isRecording
            ? Math.min(100, Math.max(20, height * 0.4 + (micLevel || 0) * height * 0.6))
            : height

          return (
            <span
              key={index}
              className={cn(
                "w-2 rounded-full",
                isRecording
                  ? "transition-[height] duration-75 ease-out"
                  : "animate-pulse",
                palette.bar,
              )}
              style={{
                height: `${dynamicHeight}%`,
                ...(!isRecording
                  ? {
                      animationDelay: `${index * 120}ms`,
                      animationDuration: "1100ms",
                    }
                  : {}),
              }}
            />
          )
        })}
      </div>

      <MascotFace speaking={aiSpeaking} />

      <div className="flex flex-col items-center gap-2">
        {tone === "analyzing" && processingLabel && (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {processingLabel}
          </span>
        )}
        <span
          className={cn(
            "inline-flex min-h-[30px] items-center justify-center rounded-full px-4 py-1.5 text-center text-xs font-medium",
            palette.pill,
          )}
        >
          {statusText}
        </span>
      </div>
    </div>
  )
}

export default AiAvatarPanel
