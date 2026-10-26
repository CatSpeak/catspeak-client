import React from "react"
import { ExternalLink } from "lucide-react"

const SpeakingRoomQuotaBanner = ({ quota }) => {
  if (!quota) return null

  const remaining = quota.total - quota.used

  return (
    <div className="bg-white border border-[#990011] rounded-2xl p-4 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
      {/* Left column */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
            🔥 Hạn mức hôm nay:
          </span>
          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100/90 text-[#990011] border border-rose-200/80">
            {quota.currentPlan}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Làm mới lúc {quota.resetTime} · Premium không giới hạn buổi
        </p>
      </div>

      {/* Right column: Remaining quota & Progress */}
      <div className="flex flex-col sm:items-end gap-1.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-medium text-slate-700">
            Còn lại <strong>{remaining} / {quota.total} buổi ({quota.percent}%)</strong>
          </span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-800 inline-flex items-center gap-1">
            Nâng cấp Premium <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">0 buổi</span>
          <div className="w-32 sm:w-44 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#990011] rounded-full transition-all duration-300"
              style={{ width: `${quota.percent}%` }}
            />
          </div>
          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-white border border-slate-200 text-slate-600 shadow-2xs">
            {quota.total} buổi (Tối đa)
          </span>
        </div>
      </div>
    </div>
  )
}

export default SpeakingRoomQuotaBanner
