import React from "react"
import {
  BookOpen,
  Video,
  Globe,
  Clock,
  Users,
  GraduationCap,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Star,
} from "lucide-react"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import CourseTabs from "../../components/CourseTabs"

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
              displayedClasses.map((cls) => {
                const isClassEnrolled = Boolean(cls.isEnrolled)
                const isExpanded = !!expandedClassIds[cls.id]
                const classButton = getClassButton(cls)
                const enrolledSeats =
                  cls.studentCount ?? cls.enrolledStudents ?? null
                const totalSlots = cls.slots ?? cls.capacity ?? null
                const remainingSlots =
                  cls.remainingSlots != null
                    ? Number(cls.remainingSlots)
                    : totalSlots != null && enrolledSeats != null
                      ? Math.max(0, Number(totalSlots) - Number(enrolledSeats))
                      : null
                const tuitionLabel =
                  cls.tuitionFee == null
                    ? ui.tba || "TBA"
                    : Number(cls.tuitionFee) === 0
                      ? scd.priceFree || sc.priceFree || "Miễn phí"
                      : formatCurrencyVND(cls.tuitionFee)
                const levelsText =
                  Array.isArray(cls.levels) && cls.levels.length > 0
                    ? cls.levels.join(", ")
                    : cls.level ||
                      rawCourse?.level ||
                      scd.defaultLevel ||
                      "Cơ bản"

                const startBadge = getStartDateBadge(cls.startDate)
                const enrollmentPeriodText =
                  cls.enrollmentStart && cls.enrollmentEnd
                    ? `${formatDate(cls.enrollmentStart)} - ${formatDate(cls.enrollmentEnd)}`
                    : cls.enrollmentStart
                      ? `${formatDate(cls.enrollmentStart)}`
                      : cls.enrollmentEnd
                        ? `${formatDate(cls.enrollmentEnd)}`
                        : ui.tba || "TBA"

                const remainingSlotsString = (
                  scd.remainingSlotsText || "Còn {{remaining}}/{{total}} chỗ"
                )
                  .replace("{{remaining}}", String(remainingSlots ?? 0))
                  .replace("{{total}}", String(totalSlots ?? 0))

                return (
                  <div
                    key={cls.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleClassExpand(cls.id)
                    }}
                    aria-expanded={isExpanded}
                    className={`cursor-pointer bg-white border rounded-2xl sm:rounded-3xl p-2 sm:p-3 transition-all duration-200 ${
                      isClassEnrolled
                        ? "border-green-300 ring-2 ring-green-50/60 shadow-sm"
                        : isExpanded
                          ? "border-cath-red-700/30 shadow-md ring-2 ring-red-50/40"
                          : "border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                  >
                    {/* ─── Accordion Item Header (Image 1) ─── */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* Left Side: Start Date Badge + Title + Sub-info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Start Date Badge */}
                        <div className="bg-cath-red-700/5 border border-cath-red-700/15 rounded-2xl w-16 h-16 sm:w-20 sm:h-18 flex flex-col items-center justify-center shrink-0 p-1 select-none shadow-sm">
                          <span className="text-[10px] sm:text-[11px] font-bold text-cath-red-700 tracking-tight leading-none">
                            {scd.startDateBadge || "Bắt đầu"}
                          </span>
                          <span className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                            {startBadge.day}
                          </span>
                          <span className="text-[10px] sm:text-xs font-semibold text-amber-500 capitalize leading-none text-center truncate max-w-full px-0.5">
                            {startBadge.month}
                          </span>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-950 leading-snug flex flex-wrap items-center gap-2">
                            <span>{cls.title || cls.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const classPath = isClassEnrolled
                                  ? `/workspace/learning/class/${encodeURIComponent(String(cls.id))}`
                                  : `/explore-courses/class/${encodeURIComponent(String(cls.id))}`
                                window.open(classPath, "_blank")
                              }}
                              title={
                                scd.viewClassDetailsNewTab ||
                                "Xem chi tiết lớp học trong tab mới"
                              }
                              className="p-1 text-gray-400 hover:text-cath-red-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <ExternalLink size={16} />
                            </button>
                            {isClassEnrolled && (
                              <span className="bg-green-100 text-green-700 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={11} />
                                <span>
                                  {scd.enrolledBadge ||
                                    c.student?.enrolled ||
                                    "Đã tham gia"}
                                </span>
                              </span>
                            )}
                          </h3>

                          {/* Sub-row: Clock + Users + Level */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm font-medium text-gray-600">
                            {/* {(cls.schedule?.days ||
                              (cls.schedule?.startTime &&
                                cls.schedule?.endTime)) && (
                              <div className="flex items-center gap-1.5">
                                <Clock
                                  size={15}
                                  className="text-amber-500 shrink-0"
                                />
                                <span>
                                  {formatScheduleDays(
                                    cls.schedule?.days,
                                    ui.tba,
                                    " - ",
                                    cls.schedule?.startTime,
                                  )}
                                  {cls.schedule?.startTime &&
                                  cls.schedule?.endTime
                                    ? ` | ${formatScheduleTime(cls.schedule.startTime, cls.startDate)} - ${formatScheduleTime(cls.schedule.endTime, cls.startDate)}`
                                    : ""}
                                </span>
                              </div>
                            )} */}

                            <div className="flex items-center gap-1.5">
                              <Users
                                size={15}
                                className="text-amber-500 shrink-0"
                              />
                              <span>
                                {enrolledSeats ?? 0}{" "}
                                {scd.studentsUnit ||
                                  c.student?.studentsText ||
                                  "học viên"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <GraduationCap
                                size={15}
                                className="text-amber-500 shrink-0"
                              />
                              <span>{levelsText}</span>
                            </div>

                            {Number(cls.reviewCount ?? cls.totalReviews ?? 0) >=
                              5 && (
                              <div className="flex items-center gap-1.5">
                                <Star
                                  size={14}
                                  className="text-amber-500 fill-amber-400 shrink-0"
                                />
                                <span>
                                  {cls.rating != null
                                    ? `${Number(cls.rating).toFixed(1)} (${cls.reviewCount ?? cls.totalReviews})`
                                    : `${cls.reviewCount ?? cls.totalReviews} ${scd.reviewsUnit || "đánh giá"}`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Price, Slots, and Register Button */}
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        {/* Tuition & Slots: Căn trái và nằm bên trái button */}
                        <div className="flex flex-col items-start text-left min-w-[120px] sm:min-w-[140px] shrink-0">
                          <span className="text-xl sm:text-2xl font-bold text-cath-red-700 tracking-tight leading-tight">
                            {tuitionLabel}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-amber-500">
                            {remainingSlotsString}
                          </span>
                        </div>

                        {/* Button: Fixed width container */}
                        <div className="w-36 sm:w-44 shrink-0 flex justify-end">
                          {isClassEnrolled ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(
                                  `/workspace/learning/class/${encodeURIComponent(String(cls.id))}`,
                                )
                              }}
                              className="w-full h-10 sm:h-11 px-4 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold rounded-full transition-all active:scale-95 shadow-sm cursor-pointer truncate flex items-center justify-center"
                            >
                              {scd.goToWorkspace ||
                                c.student?.goToWorkspace ||
                                "Vào học →"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                classButton.disabled ||
                                enrollingClassId === cls.id
                              }
                              onClick={(e) => {
                                e.stopPropagation()
                                handleClassRegister(cls)
                              }}
                              className={`w-full h-10 sm:h-11 px-3 sm:px-4 text-xs sm:text-sm font-bold rounded-full transition-all shadow-sm truncate text-center flex items-center justify-center ${
                                classButton.key === "open"
                                  ? "bg-cath-red-700 hover:bg-[#80000e] text-white active:scale-95 cursor-pointer"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              {enrollingClassId === cls.id
                                ? scd.processing ||
                                  sc.processing ||
                                  "Đang xử lý..."
                                : classButton.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ─── Accordion Item Expanded Content (Image 2) ─── */}
                    {isExpanded && (
                      <div
                        id={`class-details-${cls.id}`}
                        className="border-t border-gray-100 pt-5 mt-5 flex flex-col gap-5 animate-fadeIn"
                      >
                        {/* Top Specification Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* Card 1: Remaining Slots */}
                          <div className="bg-white rounded-2xl p-3.5 border border-gray-200 flex items-start gap-3 shadow-sm">
                            <Users
                              size={20}
                              className="text-cath-red-700 shrink-0 mt-0.5"
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-gray-400 font-medium text-xs">
                                {scd.remainingSlotsLabel ||
                                  c.student?.remainingSlots ||
                                  "Số chỗ còn lại"}
                              </span>
                              <span className="text-gray-900 font-bold text-base">
                                {remainingSlots ?? "N/A"}/{totalSlots ?? "N/A"}
                              </span>
                            </div>
                          </div>

                          {/* Card 2: Level */}
                          <div className="bg-white rounded-2xl p-3.5 border border-gray-200 flex items-start gap-3 shadow-sm">
                            <GraduationCap
                              size={20}
                              className="text-amber-500 shrink-0 mt-0.5"
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-gray-400 font-medium text-xs">
                                {scd.levelLabel ||
                                  c.student?.levelLabel ||
                                  "Trình độ"}
                              </span>
                              <span className="text-gray-900 font-bold text-base">
                                {levelsText}
                              </span>
                            </div>
                          </div>

                          {/* Card 3: Enrollment Period */}
                          <div className="bg-white rounded-2xl p-3.5 border border-gray-200 flex items-start gap-3 shadow-sm">
                            <Calendar
                              size={20}
                              className="text-emerald-500 shrink-0 mt-0.5"
                            />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-gray-400 font-medium text-xs">
                                {scd.enrollmentPeriod ||
                                  c.student?.enrollmentPeriod ||
                                  "Thời gian đăng ký"}
                              </span>
                              <span className="text-gray-900 font-bold text-sm sm:text-base truncate">
                                {enrollmentPeriodText}
                              </span>
                            </div>
                          </div>

                          {/* Card 4: Learning Method */}
                          <div className="bg-white rounded-2xl p-3.5 border border-gray-200 flex items-start gap-3 shadow-sm">
                            <Video
                              size={20}
                              className="text-blue-500 shrink-0 mt-0.5"
                            />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-gray-400 font-medium text-xs">
                                {scd.learningMethod ||
                                  c.student?.virtualClassroom ||
                                  "Hình thức học"}
                              </span>
                              <span className="text-gray-900 font-bold text-sm sm:text-base truncate">
                                {cls.roomName ||
                                  c.student?.onlineClassroom ||
                                  scd.defaultOnlineClassroom ||
                                  "Phòng học trực tuyến Cat Speak"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Weekly Schedule */}
                        {cls.rawSchedule && cls.rawSchedule.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <span className="font-bold text-gray-700 text-sm">
                              {scd.weeklySchedule ||
                                c.student?.weeklySchedule ||
                                "Lịch học hàng tuần"}
                            </span>
                            <div className="flex flex-wrap gap-2.5">
                              {cls.rawSchedule.map((s, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white border border-gray-200 rounded-xl px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                                >
                                  <strong className="text-gray-900 font-bold">
                                    {formatScheduleDays(
                                      [s.dayOfWeek],
                                      ui.tba,
                                      " - ",
                                      s.startTime,
                                    )}
                                    :
                                  </strong>{" "}
                                  {formatScheduleTime(s.startTime)} -{" "}
                                  {formatScheduleTime(s.endTime)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* About Class / Description */}
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-gray-700 text-sm">
                            {scd.aboutClass ||
                              c.student?.aboutClass ||
                              "Về lớp học"}
                          </span>
                          <RenderHTML
                            html={cls.description}
                            className="text-gray-600 font-normal text-sm sm:text-base leading-relaxed"
                            fallback={
                              <span className="text-gray-500 italic text-sm">
                                {scd.noClassDescription ||
                                  "Chưa có thông tin mô tả chi tiết cho lớp học này."}
                              </span>
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseTab
