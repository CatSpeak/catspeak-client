import { X, ChevronRight, BookOpen, TriangleAlert, MessageCircle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSelector } from "react-redux"

/**
 * Help Chat Box popup — M2 per docs/bug-report-srs.md:39-54 and designs/bug-report/help-popup.html
 * 385px card above Help button, greeting + 3 action cards + footer
 */
export default function HelpChatBox({ open, onClose, onExplore, onReportProblem, onAskQuestion }) {
  const { t } = useLanguage()
  const user = useSelector((s) => s.auth?.user)
  const lang = t.helpBox || {}
  const displayName = user?.nickname || user?.fullName || user?.username || null

  if (!open) return null

  const greetingLine = displayName
    ? (lang.greeting || "Hi {name},").replace("{name}", displayName)
    : lang.greetingFallback || "Hi there,"

  const greetingSuffix = lang.greetingSuffix || "how can we help?"

  return (
    <>
      {/* Backdrop to close on outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed bottom-[88px] right-6 z-50 w-[385px] max-w-[calc(100vw-2.5rem)] rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.18),0_0_12px_rgba(0,0,0,0.04)]"
        role="dialog"
        aria-modal="true"
        aria-label={lang.helpTooltip || "Help"}
      >
        {/* Close */}
        <div className="flex justify-end -mt-1 -mr-1 mb-1">
          <button
            type="button"
            onClick={onClose}
            aria-label={lang.closeLabel || "Close"}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-[26px] font-bold leading-8 text-slate-800">
            {greetingLine}
            <br />
            {greetingSuffix}
          </h2>
          <p className="mt-2 text-[13px] leading-[21px] text-slate-500">
            {lang.subtitle || "Choose an option below or send us a message."}
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {/* Explore */}
          <button
            type="button"
            onClick={() => {
              onClose?.()
              onExplore?.()
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-[14px] text-left transition hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <BookOpen size={20} />
              </div>
              <div className="pl-3.5">
                <div className="text-[12px] font-semibold leading-4 text-slate-800">
                  {lang.exploreTitle}
                </div>
                <div className="text-[11.5px] leading-[15.8px] text-slate-400">
                  {lang.exploreDesc}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300" />
          </button>

          {/* Report Problem */}
          <button
            type="button"
            onClick={() => {
              onClose?.()
              onReportProblem?.()
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-[14px] text-left transition hover:border-red-200 hover:bg-red-50/30 hover:shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <TriangleAlert size={20} />
              </div>
              <div className="pl-3.5">
                <div className="text-[12px] font-semibold leading-4 text-slate-800">
                  {lang.reportTitle}
                </div>
                <div className="text-[11.5px] leading-[15.8px] text-slate-400">
                  {lang.reportDesc}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300" />
          </button>

          {/* Ask us a question */}
          <button
            type="button"
            onClick={() => {
              onClose?.()
              onAskQuestion?.()
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-white p-[14px] text-left transition hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm"
          >
            <div className="flex items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <MessageCircle size={20} />
              </div>
              <div className="pl-3.5">
                <div className="text-[12px] font-semibold leading-4 text-slate-800">
                  {lang.askTitle}
                </div>
                <div className="text-[11.5px] leading-[15.8px] text-slate-400">
                  {lang.askDesc}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300" />
          </button>
        </div>

        {/* Footer */}
        <div className="pt-6 text-center text-[11.5px] leading-[17.25px] text-slate-400">
          {lang.footer}
        </div>
      </div>
    </>
  )
}
