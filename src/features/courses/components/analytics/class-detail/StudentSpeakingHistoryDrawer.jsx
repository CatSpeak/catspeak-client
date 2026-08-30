import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react"

const StudentSpeakingHistoryDrawer = ({ student, open, onClose, thresholdRate = 25 }) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const cd = c.analytics?.classDetail || {}

  if (!student) return null

  const getTrendIcon = () => {
    if (student.trend === "improving") return <TrendingUp size={16} className="text-emerald-600" />
    if (student.trend === "stable") return <Minus size={16} className="text-gray-500" />
    return <TrendingDown size={16} className="text-rose-600" />
  }

  const metPercent = Math.round((student.sessionsMet / (student.sessionsMet + student.sessionsUnmet)) * 100)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-gray-800 font-bold text-sm flex items-center justify-center shrink-0">
            {student.initial || student.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {student.name}
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              {cd.drawerTitle || "Lịch sử phát biểu học viên"}
            </span>
          </div>
        </div>
      }
      className="md:max-w-xl max-h-[85vh]"
    >
      <div className="flex flex-col gap-5 py-2">
        {/* KPI Stats in Modal */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500 font-medium">
              {cd.drawerAvg || "STB Trung bình"}
            </span>
            <span className="text-lg font-black text-gray-900 mt-0.5">
              {student.avgStbPercent}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500 font-medium">
              {cd.drawerSessions || "Số buổi tham gia"}
            </span>
            <span className="text-lg font-black text-gray-900 mt-0.5">
              {student.sessionsMet + student.sessionsUnmet}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500 font-medium">
              {cd.drawerMetRatio || "Tỷ lệ đạt"}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-lg font-black text-emerald-600">
                {metPercent}%
              </span>
              {getTrendIcon()}
            </div>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            {cd.timeline || "Tiến trình qua các buổi học"}
          </h4>
          <span className="text-xs text-gray-500 font-medium">
            {student.sessionsMet} / {student.sessionsMet + student.sessionsUnmet} {cd.sessionsCount ? cd.sessionsCount.replace("{{count}}", "").trim() : "buổi đạt"} (≥ {thresholdRate}%)
          </span>
        </div>

        {/* Sessions Scrollable List */}
        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {student.sessionHistory?.map((sess) => {
            const isMet = sess.percent >= thresholdRate
            return (
              <div
                key={sess.sessionId || sess.session_id || sess.sessionNumber || sess.date}
                className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50/60 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {isMet ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-500" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {sess.date ? `${cd.session || "Buổi học"} · ${sess.date}` : (cd.session || "Buổi học")}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 truncate">
                      {sess.topic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-gray-500 font-medium">
                    {sess.words} {cd.wordsCount ? cd.wordsCount.replace("{{count}}", "").trim() : "từ"}
                  </span>
                  <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isMet ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, sess.percent * 2)}%` }}
                    />
                  </div>
                  <span className={`font-bold tabular-nums w-8 text-right ${
                    isMet ? "text-emerald-700" : "text-amber-700"
                  }`}>
                    {sess.percent}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

export default StudentSpeakingHistoryDrawer
