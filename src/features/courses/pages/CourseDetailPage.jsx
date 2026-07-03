import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetCourseDetailQuery } from "@/store/api/coursesApi"
import { Pencil } from "lucide-react"
import { formatDateRange } from "../utils/courseUtils"

import CourseInfoCard from "../components/CourseInfoCard"
import ClassCard from "../components/ClassCard"
import UpcomingSessionCard from "../components/UpcomingSessionCard"
import TeachingTasksSection from "../components/TeachingTasksSection"

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const c = t.courses || {}

  // Fetch course details
  const { data, isLoading, error } = useGetCourseDetailQuery(id)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Error loading course detail: {error.message || "Unknown error"}
      </div>
    )
  }

  // Process data for rendering
  const rawCourse = data || {}
  const classes = rawCourse.classes || []

  // Format hours dynamically (mocking 4 hours per session as per mockup 12 sessions = 48 hours)
  const totalSessions = rawCourse.totalSessions || 0
  const durationText = `${totalSessions} Sessions (${totalSessions * 4} Hours)`

  const courseData = {
    id: rawCourse.id,
    title: rawCourse.title,
    language: rawCourse.language || "English",
    level: rawCourse.levels?.join(", ") || "N/A",
    admissionPeriod: rawCourse.enrollmentStart && rawCourse.enrollmentEnd
      ? formatDateRange(rawCourse.enrollmentStart, rawCourse.enrollmentEnd)
      : "TBA",
    duration: durationText,
    description: rawCourse.description || "",
    thumbnailUrl: rawCourse.thumbnailUrl || ""
  }

  // Calculate pricing range dynamically based on class tuition fees
  const tuitionFees = classes.map(cls => cls.tuitionFee).filter(f => f > 0)
  const minPrice = tuitionFees.length > 0 ? Math.min(...tuitionFees) : 350000
  const maxPrice = tuitionFees.length > 0 ? Math.max(...tuitionFees) : 1999000



  // Get next session details from classes
  const activeClasses = classes.filter(cls => cls.status === "TEACHING" || cls.status === "LIVE" || cls.status === "OPEN")
  const nextClass = activeClasses[0] || classes[0]

  // Localized Labels
  const courseDetailTitle = language === "vi" ? "Chi tiết khóa học" : "Course Details"
  const allCoursesLabel = t.allCourses?.title || (language === "vi" ? "Toàn bộ khóa học" : "All Courses")

  const languageLabel = c.languageLabel || (language === "vi" ? "Ngôn ngữ" : "Language")
  const levelLabel = c.levelLabel || (language === "vi" ? "Trình độ" : "Level")
  const admissionPeriodLabel = language === "vi" ? "Thời gian tuyển sinh" : "Admission Period"
  const durationLabel = language === "vi" ? "Thời lượng" : "Duration"
  const descriptionLabel = c.courseDetail?.description || (language === "vi" ? "Mô tả" : "Description")

  const customizeLabel = c.editCourse || (language === "vi" ? "Tùy chỉnh" : "Customize")

  const currentClassesLabel = c.courseDetail?.currentClasses || (language === "vi" ? "Lớp học hiện tại" : "Current Classes")
  const addNewClassLabel = c.courseDetail?.addNewClass || (language === "vi" ? "Tạo lớp mới" : "Add New Class")
  const noClassesYetLabel = c.courseDetail?.noClassesYet || (language === "vi" ? "Chưa có lớp học nào" : "No classes created yet")
  const startByAddingLabel = c.courseDetail?.startByAdding || (language === "vi" ? "Bắt đầu bằng cách thêm lớp học đầu tiên cho khóa học này." : "Start by adding your first class to this course.")

  const progressLabel = c.progress || (language === "vi" ? "Tiến độ" : "Progress")
  const minPriceLabel = language === "vi" ? "Giá thấp nhất" : "Lowest Price"
  const maxPriceLabel = language === "vi" ? "Giá cao nhất" : "Highest Price"

  const upcomingSessionLabel = c.courseDetail?.upcomingSession || (language === "vi" ? "Buổi dạy tiếp theo" : "Upcoming Session")
  const joinRoomLabel = c.classDetail?.joinRoom || (language === "vi" ? "Vào phòng" : "Join Room")
  const viewAllLabel = c.viewAll || (language === "vi" ? "Xem tất cả" : "View All")
  const noUpcomingLabel = c.courseDetail?.noUpcoming || (language === "vi" ? "Không có buổi dạy tiếp theo" : "No upcoming sessions")
  const createClassToScheduleLabel = c.courseDetail?.createClassToSchedule || (language === "vi" ? "Tạo lớp học mới để lên lịch cho buổi dạy đầu tiên." : "Create a class to schedule your first session.")

  const teachingTasksLabel = c.teachingTasks || (language === "vi" ? "Việc giảng dạy" : "Teaching Tasks")
  const gradeAssignmentLabel = c.gradeAssignment || (language === "vi" ? "Chấm bài tập" : "Grade homework")
  const giveFeedbackLabel = language === "vi" ? "Đưa feedback" : "Give feedback"
  const prepareLessonLabel = language === "vi" ? "Soạn giáo án" : "Prepare lesson plan"

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {/* ─── Breadcrumb ─── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{allCoursesLabel}</span>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{courseDetailTitle}</span>
        </div>
      </div>

      {/* ─── Page Heading ─── */}
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">
        {courseDetailTitle}
      </h1>

      {/* ─── Grid Content (2 Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Visual Banner, Information Card & Current Classes */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* ─── Visual Banner ─── */}
          <div
            className="relative overflow-hidden rounded-3xl p-8 min-h-[380px] flex flex-col justify-end shadow-sm bg-cover bg-center text-white"
            style={{
              backgroundImage: `url('${courseData.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"}')`
            }}
          >
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 z-0" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
              {/* Course Title */}
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight max-w-xl">
                {courseData.title}
              </h2>

              {/* Tùy chỉnh button */}
              <button
                onClick={() => navigate(`/workspace/courses/edit/${id}`)}
                className="shrink-0 h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm"
              >
                <Pencil size={14} />
                <span>{customizeLabel}</span>
              </button>
            </div>
          </div>

          <CourseInfoCard
            courseData={courseData}
            languageLabel={languageLabel}
            levelLabel={levelLabel}
            admissionPeriodLabel={admissionPeriodLabel}
            durationLabel={durationLabel}
            descriptionLabel={descriptionLabel}
          />

          {/* Current Classes Section */}
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-950 tracking-tight">
                {currentClassesLabel}
              </h3>

              <button
                onClick={() => navigate("/workspace/courses/create-class", { state: { courseId: rawCourse.id } })}
                className="px-4 py-1.5 border border-[#b20a1c] hover:bg-red-50/50 text-[#b20a1c] text-xs font-black rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <span>{addNewClassLabel}</span>
                <span className="text-sm font-light">+</span>
              </button>
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {classes.length > 0 ? (
                classes.map((cls) => {
                  return (
                    <ClassCard
                      key={cls.id}
                      cls={cls}
                      isStudent={false}
                      onClick={() => navigate(`/workspace/courses/class/${cls.id}`)}
                      progressLabel={progressLabel}
                      minPriceLabel={minPriceLabel}
                      maxPriceLabel={maxPriceLabel}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      courseTitle={courseData.title}
                      language={language}
                    />
                  )
                })
              ) : (
                /* Empty state card */
                <div className="bg-[#FCFCFC] border border-gray-150 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[220px] col-span-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Pencil size={24} className="stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-extrabold text-sm text-gray-800">{noClassesYetLabel}</h4>
                    <p className="text-xs text-gray-400 font-bold max-w-[240px] leading-relaxed">
                      {startByAddingLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Instructor details and Syllabus outlines */}
        <div className="flex flex-col gap-8">
          <UpcomingSessionCard
            nextClass={nextClass}
            courseData={courseData}
            upcomingSessionLabel={upcomingSessionLabel}
            noUpcomingLabel={noUpcomingLabel}
            createClassToScheduleLabel={createClassToScheduleLabel}
            joinRoomLabel={joinRoomLabel}
            viewAllLabel={viewAllLabel}
            onJoin={() => navigate(`/workspace/courses/class/${nextClass.id}`)}
            onViewAll={() => navigate("/workspace/courses/schedule")}
          />

          <TeachingTasksSection
            teachingTasksLabel={teachingTasksLabel}
            viewAllLabel={viewAllLabel}
            gradeAssignmentLabel={gradeAssignmentLabel}
            giveFeedbackLabel={giveFeedbackLabel}
            prepareLessonLabel={prepareLessonLabel}
            onViewAll={() => navigate("/workspace/courses/schedule")}
            onTaskAction={() => navigate("/workspace/courses/schedule")}
          />
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage