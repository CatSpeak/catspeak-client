import React from "react"
import { ExternalLink } from "lucide-react"

const SpeakingRoomQuotaBanner = ({ quota }) => {
  if (!quota) return null

  const remaining = quota.total - quota.used

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border border-[#990011] dark:border-red-400 rounded-2xl p-4 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
      {/* Left column */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1">
            🔥 Hạn mức hôm nay:
          </span>
          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100/90 dark:bg-rose-950/40 text-[#990011] dark:text-red-400 border border-rose-200/80 dark:border-red-900/40">
            {quota.currentPlan}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          Làm mới lúc {quota.resetTime} · Premium không giới hạn buổi
        </p>
      </div>

      {/* Right column: Remaining quota & Progress */}
      <div className="flex flex-col sm:items-end gap-1.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-medium text-slate-700 dark:text-neutral-200">
            Còn lại <strong>{remaining} / {quota.total} buổi ({quota.percent}%)</strong>
          </span>
          <span className="text-slate-300 dark:text-neutral-600">·</span>
          <span className="font-semibold text-slate-800 dark:text-white inline-flex items-center gap-1">
            Nâng cấp Premium <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-neutral-400 font-medium">0 buổi</span>
          <div className="w-32 sm:w-44 h-2 bg-slate-200 dark:bg-[#272727] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#990011] dark:bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${quota.percent}%` }}
            />
          </div>
          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-[#242424] border border-slate-200 dark:border-[#3F3F3F] text-slate-600 dark:text-neutral-300 shadow-2xs">
            {quota.total} buổi (Tối đa)
          </span>
        </div>
      </div>
    </div>
  )
}

export default SpeakingRoomQuotaBanner
