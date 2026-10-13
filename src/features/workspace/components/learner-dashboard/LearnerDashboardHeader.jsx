import React from "react"
import { RefreshCw, GraduationCap, ArrowRightLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"

const LearnerDashboardHeader = ({ onRefresh, isRefreshing }) => {
  const { language } = useLanguage()
  const isEn = language === "en"
  const { isTeacherProfile, switchRole, isSwitching } = useRoleOverride()

  const breadcrumbItems = [
    { label: isEn ? "Home" : "Trang chủ", href: "/" },
    { label: isEn ? "My Workspace" : "Không gian làm việc", href: "/workspace" },
    { label: isEn ? "Learning Dashboard" : "Bảng điều khiển học tập", href: "/workspace/dashboard" },
  ]

  return (
    <header className="mb-6 flex flex-col gap-3">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#72000D] to-[#B80514] flex items-center justify-center text-white shadow-sm shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#14171F] tracking-tight">
              {isEn ? "Student Learning Dashboard" : "Bảng điều khiển học tập học viên"}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E788C] mt-0.5">
              {isEn
                ? "Track your speaking fluency, classroom participation balance, and course progress"
                : "Theo dõi tiến độ học tập, điểm phát biểu AI và cân bằng thời gian nói trong lớp học"}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Dual-role switcher button for Teachers in student view */}
          {isTeacherProfile && (
            <button
              type="button"
              disabled={isSwitching}
              onClick={() => switchRole("Teacher")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#72000D] bg-white border border-[#DEE0E5] hover:border-[#72000D] rounded-lg shadow-sm transition-colors cursor-pointer"
              title={isEn ? "Switch to Teacher Workspace" : "Chuyển sang Không gian Giảng viên"}
            >
              <ArrowRightLeft className={`w-3.5 h-3.5 ${isSwitching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {isEn ? "Teacher Workspace" : "K/gian Giảng viên"}
              </span>
            </button>
          )}

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#14171F] bg-white border border-[#DEE0E5] hover:bg-gray-50 rounded-lg shadow-sm transition-colors cursor-pointer"
            aria-label={isEn ? "Refresh dashboard" : "Làm mới dữ liệu"}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6E788C] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isEn ? "Refresh" : "Làm mới"}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default LearnerDashboardHeader
