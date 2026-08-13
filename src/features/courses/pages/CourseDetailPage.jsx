import React, { useState, useRef, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  useGetCourseDetailQuery,
  useGetTeacherCourseTeachingTasksCombinedQuery,
  useDeleteCourseMutation,
} from "@/store/api/coursesApi"
import { Check, Pencil, Share2, Trash2 } from "lucide-react"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import { useTimezone } from "@/shared/hooks/useTimezone"
import {
  getSafeMediaUrl,
  defaultCourseThumbnail,
} from "../utils/courseUtils"
import { mapTeachingTask } from "../utils/courseTransforms"
import { ensureDate } from "@/shared/utils/dateUtils"

import ClassCard from "../components/ClassCard"
import CourseInfoCard from "../components/CourseInfoCard"
import TeachingTasksSection from "../components/assignments/TeachingTasksSection"
import UpcomingSessionCard from "../components/sessions/UpcomingSessionCard"
import { copyShareLink } from "@/shared/utils/shareUtils"

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const c = t.courses || {}
  const ui = c.workspaceUi || {}
  const taskText = c.grading || {}

  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const menuRef = useRef(null)

  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation()
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/explore-courses/details/${id}`
    const ok = await copyShareLink({
      url: shareUrl,
      successMessage: c.courseDetail?.linkCopied || "Link copied!",
      errorMessage: c.courseDetail?.linkCopyFailed || "Failed to copy link",
    })
    if (ok) {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const handleShareClass = async (clsItem) => {
    const shareUrl = `${window.location.origin}/explore-courses/class/${clsItem.id || clsItem._id}`
    await copyShareLink({
      url: shareUrl,
      successMessage: c.classDetail?.linkCopied || "Link copied!",
      errorMessage: c.classDetail?.linkCopyFailed || "Failed to copy link",
    })
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDeleteCourse = async () => {
    if (!id || isDeleting) return
    try {
      await deleteCourse(id).unwrap()
      toast.success(c.courseDetail?.toastDeleteSuccess || "Course deleted successfully!")
      navigate("/workspace/courses")
    } catch {
      toast.error(c.courseDetail?.toastDeleteFailed || "Failed to delete course!")
    } finally {
      setShowDeleteModal(false)
    }
  }

  // Fetch course details
  const {
    currentData: data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCourseDetailQuery(id, { skip: !id })

  // Fetch teaching tasks (Combined API)
  const { data: rawTasks = [], isLoading: isLoadingTasks } =
    useGetTeacherCourseTeachingTasksCombinedQuery(id, { skip: !id })

  const teachingTasks = useMemo(() => {
    return Array.isArray(rawTasks)
      ? rawTasks.map((task) => mapTeachingTask(task, {
        pendingCount: taskText.teachingTaskPendingCount,
        urgent: taskText.teachingTaskUrgent,
        required: taskText.teachingTaskRequired,
        gradeQuiz: taskText.teachingTaskGradeQuiz,
        gradeAssignment: taskText.teachingTaskGradeAssignment,
        unknown: taskText.statusUnknown,
      })).filter(Boolean)
      : []
  }, [
    rawTasks,
    taskText.teachingTaskGradeAssignment,
    taskText.teachingTaskGradeQuiz,
    taskText.teachingTaskPendingCount,
    taskText.teachingTaskRequired,
    taskText.teachingTaskUrgent,
    taskText.statusUnknown,
  ])

  const handleTaskAction = (task) => {
    if (!task) return
    const targetClassId = task.classId
    if (!targetClassId) return
    let targetUrl = `/workspace/courses/class/${encodeURIComponent(String(targetClassId))}?tab=grading`
    if (task.assignmentId) {
      targetUrl += `&assignmentId=${encodeURIComponent(String(task.assignmentId))}`
    } else if (task.quizId) {
      targetUrl += `&quizId=${encodeURIComponent(String(task.quizId))}`
    }
    navigate(targetUrl)
  }
  const rawCourse = (
    data
    && typeof data === "object"
    && !Array.isArray(data)
    && data.id
  )
    ? data
    : null

  if ((isLoading || isFetching) && data === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]"></div>
      </div>
    )
  }

  if (error || !id || (!isLoading && !rawCourse)) {
    return (
      <div
        className="flex flex-col items-start gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold"
        role="alert"
      >
        <span>{c.courseDetail?.loadFailed || "Could not load the course details."}</span>
        <button
          type="button"
          onClick={refetch}
          disabled={isFetching}
          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-extrabold disabled:opacity-50"
        >
          {c.courseDetail?.retry || "Try again"}
        </button>
      </div>
    )
  }

  const classes = Array.isArray(rawCourse.classes)
    ? rawCourse.classes.filter((item) => item && typeof item === "object")
    : []

  const parsedSessions = Number(rawCourse.totalSessions)
  const totalSessions = Number.isFinite(parsedSessions)
    ? Math.max(0, Math.floor(parsedSessions))
    : 0
  const parsedHours = Number(rawCourse.durationHours ?? rawCourse.totalHours)
  const totalHours = Number.isFinite(parsedHours) && parsedHours >= 0
    ? parsedHours
    : null
  const durationParts = []
  if (totalSessions > 0) {
    durationParts.push(
      (ui.sessionsCount || "{{count}} sessions")
        .replace("{{count}}", String(totalSessions)),
    )
  }
  if (totalHours !== null) {
    durationParts.push(
      (ui.hoursCount || "{{count}} hours")
        .replace("{{count}}", String(totalHours)),
    )
  }
  const durationText = durationParts.join(" • ") || ui.tba || "TBA"

  const courseData = {
    id: rawCourse.id,
    title: rawCourse.title,
    language: rawCourse.language || ui.notAvailable || "N/A",
    levels: Array.isArray(rawCourse.levels) ? rawCourse.levels : [],
    level: Array.isArray(rawCourse.levels) && rawCourse.levels.length > 0
      ? rawCourse.levels.join(", ")
      : ui.notAvailable || "N/A",
    admissionPeriod: rawCourse.enrollmentStart && rawCourse.enrollmentEnd
      ? `${formatDate(rawCourse.enrollmentStart)} - ${formatDate(rawCourse.enrollmentEnd)}`
      : ui.tba || "TBA",
    duration: durationText,
    description: rawCourse.description || "",
    thumbnailUrl: getSafeMediaUrl(rawCourse.thumbnailUrl)
  }

  // Prioritize upcoming future session over past sessions
  const nowMs = Date.now()
  const nextSessionCandidate = classes
    .map((cls) => {
      const ns = cls?.nextSession
      const datePart = ns?.date || cls?.startDate || ""
      let rawTs = ns?.rawStartTime || ns?.startTime || ""
      if (typeof rawTs === "string" && !rawTs.includes("T") && !rawTs.includes("-") && datePart) {
        const cleanDate = datePart.includes("T") ? datePart.split("T")[0] : datePart
        rawTs = `${cleanDate}T${rawTs}`
      } else if (!rawTs && datePart) {
        rawTs = datePart
      }
      const d = ensureDate(rawTs)
      const startTimeMs = d ? d.getTime() : NaN
      return { cls, startTimeMs }
    })
    .filter(({ startTimeMs }) => Number.isFinite(startTimeMs))
    .sort((left, right) => {
      const aUpcoming = left.startTimeMs >= nowMs ? 1 : 0
      const bUpcoming = right.startTimeMs >= nowMs ? 1 : 0
      if (aUpcoming !== bUpcoming) return bUpcoming - aUpcoming
      return Math.abs(left.startTimeMs - nowMs) - Math.abs(right.startTimeMs - nowMs)
    })[0]
  const nextSessionClass = nextSessionCandidate?.cls || null

  const nextClass = nextSessionClass
    ? {
      ...nextSessionClass,
      nextSession: nextSessionClass.nextSession,
      startDate: nextSessionClass.nextSession?.date || nextSessionClass.startDate,
      schedule: {
        ...nextSessionClass.schedule,
        startTime: nextSessionClass.schedule?.startTime || nextSessionClass.nextSession?.startTime,
        endTime: nextSessionClass.schedule?.endTime || nextSessionClass.nextSession?.endTime,
      },
    }
    : null

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {isFetching && (
        <span role="status" className="sr-only">
          {c.courseDetail?.refreshing || "Refreshing course details"}
        </span>
      )}
      {/* ─── Breadcrumb ─── */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
          { label: c.title || "Khóa học của tôi", onClick: () => navigate("/workspace/courses") },
          { label: c.allCourses?.title || "All Courses", onClick: () => navigate("/workspace/courses") },
          { label: c.student?.courseDetails || "Course Details" },
        ]}
      />

      {/* ─── Page Heading ─── */}
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">
        {c.student?.courseDetails || "Course Details"}
      </h1>

      {/* ─── Grid Content (2 Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT COLUMN: Visual Banner, Information Card & Current Classes */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* ─── Visual Banner ─── */}
          <div
            className="relative rounded-3xl p-8 min-h-[380px] flex flex-col justify-end shadow-sm bg-gray-700 text-white"
          >
            {/* Background image & gradient overlay container */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <img
                src={courseData.thumbnailUrl || defaultCourseThumbnail}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 z-0" />
            </div>

            {/* Share / Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              title={c.courseDetail?.shareCourse || "Share course"}
              className="absolute top-4 right-4 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-all active:scale-90 cursor-pointer"
            >
              {linkCopied ? <Check size={18} /> : <Share2 size={18} />}
            </button>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
              {/* Course Title */}
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight max-w-xl">
                {courseData.title}
              </h2>

              {/* Menu button (Edit / Delete course) */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label={c.courseDetail?.courseActions || "Course actions"}
                  aria-haspopup="menu"
                  aria-expanded={showMenu}
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="shrink-0 h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Pencil size={14} />
                  <span>{c.editCourse || "Customize"}</span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        navigate(`/workspace/courses/edit/${encodeURIComponent(String(id))}`)
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Pencil size={14} className="text-gray-500" />
                      <span>{c.courseDetail?.editCourse || c.createCourse?.updateCourse || "Chỉnh sửa khóa học"}</span>
                    </button>

                    <div className="my-1 border-t border-border" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        setShowDeleteModal(true)
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} className="text-red-500" />
                      <span>{c.courseDetail?.deleteCourse || "Xóa khóa học"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <CourseInfoCard
            courseData={courseData}
            languageLabel={c.languageLabel || "Language"}
            levelLabel={c.levelLabel || "Level"}
            admissionPeriodLabel={c.courseDetail?.admission || "Admission Period"}
            durationLabel={c.courseDetail?.duration || "Duration"}
            descriptionLabel={c.courseDetail?.description || "Description"}
            noDescriptionText={c.courseDetail?.noDescription || "No description provided."}
          />

          {/* Current Classes Section */}
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-950 tracking-tight">
                {c.courseDetail?.currentClasses || "Current Classes"}
              </h3>

              <button
                type="button"
                onClick={() => navigate("/workspace/classes/create-class", { state: { courseId: rawCourse.id } })}
                className="px-4 py-1.5 border border-[#b20a1c] hover:bg-red-50/50 text-[#b20a1c] text-xs font-black rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <span>{c.courseDetail?.addNewClass || "Add New Class"}</span>
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
                      onClick={() => navigate(`/workspace/courses/class/${encodeURIComponent(String(cls.id))}`)}
                      progressLabel={c.progress || "Progress"}
                      courseTitle={courseData.title}
                      onShare={handleShareClass}
                    />
                  )
                })
              ) : (
                /* Empty state card */
                <div className="bg-[#FCFCFC] border border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[220px] col-span-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <Pencil size={24} className="stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-extrabold text-sm text-gray-800">{c.courseDetail?.noClassesYet || "No classes created yet"}</h4>
                    <p className="text-xs text-gray-400 font-bold max-w-[240px] leading-relaxed">
                      {c.courseDetail?.startByAdding || "Start by adding your first class to this course."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Instructor details and Syllabus outlines */}
        <div className="flex flex-col gap-4">
          <UpcomingSessionCard
            nextClass={nextClass}
            courseData={courseData}
            upcomingSessionLabel={c.courseDetail?.upcomingSession || "Upcoming Session"}
            noUpcomingLabel={c.courseDetail?.noUpcoming || "No upcoming sessions"}
            createClassToScheduleLabel={c.courseDetail?.createClassToSchedule || "Create a class to schedule your first session."}
            joinRoomLabel={c.joinRoom || "Join Room"}
            viewAllLabel={c.viewAll || "View All"}
            onJoin={() => {
              if (nextClass?.id) {
                navigate(`/workspace/courses/class/${encodeURIComponent(String(nextClass.id))}`)
              }
            }}
            onViewAll={() => navigate("/workspace/courses/schedule")}
          />

          <TeachingTasksSection
            teachingTasksLabel={c.teachingTasks || "Teaching Tasks"}
            viewAllLabel={c.viewAll || "View All"}
            tasks={teachingTasks}
            isLoading={isLoadingTasks}
            onViewAll={() => navigate("/workspace/courses/schedule")}
            onTaskAction={handleTaskAction}
          />
        </div>
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          if (!isDeleting) setShowDeleteModal(false)
        }}
        onConfirm={handleDeleteCourse}
        isPending={isDeleting}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default CourseDetailPage
