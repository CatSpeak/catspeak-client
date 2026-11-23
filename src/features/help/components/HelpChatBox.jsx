import React from "react"
import { ChevronRight, BookOpen, TriangleAlert, MessageCircle } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSelector } from "react-redux"
import Modal from "@/shared/components/ui/Modal"

/**
 * Help Chat Box popup — rendered via standard Modal for consistent UI
 * Greeting + 3 action cards + footer
 */
export default function HelpChatBox({ open, onClose, onExplore, onReportProblem, onAskQuestion }) {
  const { t } = useLanguage()
  const user = useSelector((s) => s.auth?.user)
  const lang = t.helpBox || {}
  const displayName = user?.nickname || user?.fullName || user?.username || null

  const greetingLine = displayName
    ? (lang.greeting || "Hi {name},").replace("{name}", displayName)
    : lang.greetingFallback || "Hi there,"

  const greetingSuffix = lang.greetingSuffix || "how can we help?"

  return (
    <Modal
      open={open}
      onClose={onClose}
      fullScreenOnMobile={false}
      className="max-w-[420px] rounded-3xl"
      ariaLabel={lang.helpTooltip || "Help"}
    >
      <div className="flex flex-col p-2 pt-0 sm:p-2">
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold leading-tight text-slate-800 dark:text-white">
            {greetingLine}
            <br />
            {greetingSuffix}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-[#AAAAAA]">
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
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] p-3.5 text-left transition hover:border-blue-200 dark:hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-[#3D3D3D] hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 dark:text-blue-400 shrink-0">
                <BookOpen size={20} />
              </div>
              <div className="pl-3.5">
                <div className="text-xs font-semibold leading-4 text-slate-800 dark:text-white">
                  {lang.exploreTitle}
                </div>
                <div className="text-[11px] leading-tight text-slate-400 dark:text-[#AAAAAA] mt-0.5">
                  {lang.exploreDesc}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300 dark:text-[#AAAAAA]" />
          </button>

          {/* Report Problem */}
          <button
            type="button"
            onClick={() => {
              onClose?.()
              onReportProblem?.()
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] p-3.5 text-left transition hover:border-red-200 dark:hover:border-red-500/50 hover:bg-red-50/30 dark:hover:bg-[#3D3D3D] hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-[#FF0033] shrink-0">
                <TriangleAlert size={20} />
              </div>
              <div className="pl-3.5">
                <div className="text-xs font-semibold leading-4 text-slate-800 dark:text-white">
                  {lang.reportTitle}
                </div>
                <div className="text-[11px] leading-tight text-slate-400 dark:text-[#AAAAAA] mt-0.5">
                  {lang.reportDesc}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300 dark:text-[#AAAAAA]" />
          </button>

          {/* Ask us a question */}
          <button
            type="button"
            onClick={() => {
              onClose?.()
              onAskQuestion?.()
            }}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 dark:border-[#3F3F3F] bg-white dark:bg-[#272727] p-3.5 text-left transition hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-[#3D3D3D] hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 dark:text-emerald-400 shrink-0">
                <MessageCircle size={20} />
              </div>
              <div className="pl-3.5">
                <div className="text-xs font-semibold leading-4 text-slate-800 dark:text-white">
                  {lang.askTitle}
                </div>
                <div className="text-[11px] leading-tight text-slate-400 dark:text-[#AAAAAA] mt-0.5">
                  {lang.askDesc}
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300 dark:text-[#AAAAAA]" />
          </button>
        </div>

        {/* Footer */}
        <div className="pt-5 text-center text-[11px] leading-relaxed text-slate-400 dark:text-[#AAAAAA]">
          {lang.footer}
        </div>
      </div>
    </Modal>
  )
}
