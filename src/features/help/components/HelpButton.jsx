import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Help icon button — M1 per docs/bug-report-srs.md:37 and designs/bug-report/icon-help.html
 * 48px circle #8B0018 "?" with shadow, fixed bottom-right
 */
export default function HelpButton({ onClick, isActive }) {
  const { t } = useLanguage()
  const tooltip = t.helpBox?.helpTooltip || t.bugReport?.buttonTooltip || "Help"

  return (
    <div className="fixed bottom-[5.25rem] right-6 z-40">
      <button
        type="button"
        onClick={onClick}
        aria-label={tooltip}
        aria-expanded={isActive}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-[#8B0018] text-white shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)] transition hover:brightness-110 hover:scale-105 active:scale-95"
      >
        <span className="text-[20px] font-bold leading-none">?</span>
        {/* Tooltip on hover */}
        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap rounded-lg border border-white/10 bg-gray-900/95 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 pointer-events-none">
          {tooltip}
        </span>
      </button>
    </div>
  )
}
