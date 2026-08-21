import React from "react"
import { BookOpen, RotateCcw, Sparkles } from "lucide-react"

const EmptyCoursesState = ({
  icon: Icon = BookOpen,
  title,
  message,
  action,
  isFiltered = false,
  onResetFilter,
  resetFilterLabel = "Reset Filter",
  tips,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden max-w-xl w-full mx-auto my-4 p-8 sm:p-10 rounded-2xl border border-border/90 bg-white shadow-xs flex flex-col items-center justify-center text-center transition-all ${className}`}
    >
      {/* Futuristic top accent bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-[#b20a1c]" />

      {/* Subtle tech grid accent background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* Icon Badge */}
      <div className="relative z-10 w-14 h-14 rounded-xl bg-slate-50 border border-border flex items-center justify-center mb-4 text-[#b20a1c] shadow-2xs">
        {React.createElement(Icon, {
          size: 26,
          className: "text-[#b20a1c] stroke-[1.75]",
        })}
      </div>

      {/* Title */}
      {title ? (
        <h3 className="relative z-10 text-lg sm:text-xl font-bold text-slate-900 tracking-tight mb-1.5 font-sans">
          {title}
        </h3>
      ) : null}

      {/* Message / Description */}
      {message ? (
        <p className="relative z-10 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md mb-6">
          {message}
        </p>
      ) : null}

      {/* Action Buttons */}
      {(action || (isFiltered && onResetFilter)) && (
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mb-6">
          {action}
          {isFiltered && onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="h-9 px-4 rounded-lg border border-border hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-98"
            >
              <RotateCcw size={14} className="text-slate-500" />
              <span>{resetFilterLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Quick Feature Tips / Guidance Badges */}
      {Array.isArray(tips) && tips.length > 0 && (
        <div className="relative z-10 pt-5 border-t border-slate-100 w-full flex flex-wrap justify-center items-center gap-2">
          {tips.map((tip, idx) => {
            const TipIcon = tip.icon || Sparkles
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-border/80 text-[11px] font-medium text-slate-600"
              >
                <TipIcon size={13} className="text-[#b20a1c]" />
                <span>{tip.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default EmptyCoursesState
