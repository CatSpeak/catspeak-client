import React from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, ArrowRight, Play, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const OngoingCoursesSection = ({ courses = [] }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isEn = language === "en"

  return (
    <section
      aria-labelledby="ongoing-courses-heading"
      className="bg-white border border-[#DEE0E5] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#72000D]" />
            <h2 id="ongoing-courses-heading" className="text-base font-bold text-[#14171F]">
              {isEn ? "Ongoing Courses" : "Khóa học đang học"}
            </h2>
          </div>
          <p className="text-xs text-[#6E788C] mt-0.5">
            {isEn ? "Resume where you left off" : "Tiếp tục bài giảng và theo dõi tiến độ hoàn thành"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/workspace/explore-courses")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B80514] hover:underline cursor-pointer"
        >
          <span>{isEn ? "All Courses" : "Tất cả khóa học"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Courses List */}
      {courses && courses.length > 0 ? (
        <div className="space-y-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="border border-[#DEE0E5] rounded-xl p-3 sm:p-3.5 hover:border-[#72000D]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {course.level && (
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      {course.level}
                    </span>
                  )}
                  <span className="text-xs text-[#6E788C]">
                    {isEn ? "Studied: " : "Đã học: "}
                    <strong className="text-[#14171F] font-semibold">{course.learnedDuration}</strong>
                    {course.totalDuration ? ` / ${course.totalDuration}` : ""}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#14171F] truncate" title={course.title}>
                  {course.title}
                </h3>

                {/* Progress Bar */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#72000D] to-[#B80514] rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#14171F] tabular-nums shrink-0">
                    {course.progressPercent}%
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => navigate(course.targetUrl || "/workspace/explore-courses")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#72000D] hover:bg-[#85000F] active:bg-[#5E000A] rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{isEn ? "Continue" : "Tiếp tục học"}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-xs">
          <CheckCircle2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p>{isEn ? "No courses in progress." : "Bạn chưa tham gia khóa học nào."}</p>
        </div>
      )}
    </section>
  )
}

export default OngoingCoursesSection
