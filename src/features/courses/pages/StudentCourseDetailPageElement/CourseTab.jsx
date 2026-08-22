import React from "react"
import { BookOpen, Video, Globe } from "lucide-react"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import CourseTabs from "../../components/CourseTabs"
import ClassCard from "./ClassCard"

const CourseTab = ({
  courseDetailTabs = [],
  activeTab = "overview",
  setActiveTab,
  rawCourse = {},
  classes = [],
  displayedClasses = [],
  expandedClassIds = {},
  toggleClassExpand,
  getClassButton,
  getStartDateBadge,
  enrollingClassId,
  handleClassRegister,
  formatDate,
  formatScheduleTime,
  formatScheduleDays,
  formatCurrencyVND,
  navigate,
  c = {},
  sc = {},
  scd = {},
  ui = {},
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-6 w-full ${className}`}>
      {/* Tabs Bar */}
      <div className="border-b border-gray-200">
        <CourseTabs
          tabs={courseDetailTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {/* ─── Tab 1: Tổng quan ─── */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4">
            {/* 3 Info Cards: Tổng số lớp, Hình thức học, Ngôn ngữ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
              {/* Card 1: Tổng số lớp */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-cath-red-700" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-500">
                    {scd.totalClasses || "Tổng số lớp"}
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">
                  {classes.length || rawCourse?.classCount || 0}
                </div>
              </div>

              {/* Card 2: Hình thức học */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-cath-red-700" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-500">
                    {scd.learningMethod || "Hình thức học"}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold text-gray-900 mt-3 truncate">
                  {rawCourse.teachingMethod ||
                    c.student?.onlineClassroom ||
                    scd.defaultOnlineClassroom ||
                    "Phòng học trực tuyến Cat Speak"}
                </div>
              </div>

              {/* Card 3: Ngôn ngữ */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-cath-red-700" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-500">
                    {scd.language || "Ngôn ngữ"}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold text-gray-900 mt-3 truncate">
                  {rawCourse.languageName ||
                    rawCourse.language ||
                    scd.defaultLanguage ||
                    "Tiếng Anh"}
                </div>
              </div>
            </div>

            {/* Về khóa học */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-gray-100 shadow-sm flex flex-col gap-3.5">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                {scd.aboutCourse || "Về khóa học"}
              </h3>
              <div className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed text-justify">
                <RenderHTML
                  html={rawCourse.description}
                  fallback={
                    <span className="text-gray-500 italic text-sm">
                      {scd.noCourseDescription ||
                        "Chưa có thông tin mô tả chi tiết cho khóa học này."}
                    </span>
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Tabs 2, 3, 4: Danh sách lớp học (Tất cả / Chưa mở / Đã đóng) ─── */}
        {activeTab !== "overview" && (
          <div className="flex flex-col gap-4">
            {displayedClasses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center text-gray-400 font-medium flex flex-col items-center justify-center shadow-sm">
                <span className="text-gray-800 text-base font-bold mb-1">
                  {activeTab === "upcoming"
                    ? scd.noUpcomingClasses ||
                      "Chưa có lớp học nào sắp mở đăng ký"
                    : activeTab === "closed"
                      ? scd.noClosedClasses ||
                        "Không có lớp học nào đã đóng đăng ký"
                      : scd.noClasses ||
                        c.student?.noClassesTitle ||
                        "Chưa có lớp học nào"}
                </span>
                <span className="text-sm text-gray-500 max-w-sm">
                  {activeTab === "upcoming"
                    ? scd.noUpcomingClassesDesc ||
                      "Vui lòng quay lại sau hoặc xem các lớp học đang mở khác."
                    : activeTab === "all"
                      ? scd.noClassesDesc ||
                        c.student?.noClassesDesc ||
                        "Các lớp học mới sẽ được cập nhật sớm. Vui lòng quay lại sau."
                      : ""}
                </span>
              </div>
            ) : (
              displayedClasses.map((cls) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  isExpanded={!!expandedClassIds[cls.id]}
                  toggleClassExpand={toggleClassExpand}
                  getClassButton={getClassButton}
                  getStartDateBadge={getStartDateBadge}
                  enrollingClassId={enrollingClassId}
                  handleClassRegister={handleClassRegister}
                  formatDate={formatDate}
                  formatScheduleTime={formatScheduleTime}
                  formatScheduleDays={formatScheduleDays}
                  formatCurrencyVND={formatCurrencyVND}
                  navigate={navigate}
                  rawCourse={rawCourse}
                  c={c}
                  sc={sc}
                  scd={scd}
                  ui={ui}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseTab
