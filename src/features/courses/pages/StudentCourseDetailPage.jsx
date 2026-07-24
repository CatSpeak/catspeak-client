import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  useGetStudentCourseDetailQuery,
  useEnrollInCourseMutation
} from "@/store/api/coursesApi"
import StudentJoinModal from "../student/components/StudentJoinModal"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { formatCurrencyVND, formatDateDayMonth } from "../utils/courseUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { Calendar, Mail, CheckCircle2, BookOpen, FileText, Award, Globe, User, Radio, Users, Clock, Video } from "lucide-react"

const StudentCourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const c = t.courses || {}

  // Fetch course details
  const { data: courseDetail, isLoading, error } = useGetStudentCourseDetailQuery(id, { skip: !id })
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation()
  const { data: profileResponse } = useGetUserProfileQuery()
  const profile = profileResponse?.data || profileResponse || {}
  const currentUserId = profile.id?.toString() || ""

  // State
  const [enrollTarget, setEnrollTarget] = useState(null)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)
  const [expandedClassIds, setExpandedClassIds] = useState({})

  const toggleClassExpand = (classId) => {
    setExpandedClassIds((prev) => ({
      ...prev,
      [classId]: !prev[classId]
    }))
  }

  const handleOpenEnroll = (course, cls) => {
    if (isOwner) {
      toast.error(c.student?.cannotEnrollOwn || "You cannot enroll in your own course or class.")
      return
    }
    setEnrollTarget({ course, class: cls })
    setEnrollSuccess(false)
    setIsJoinOpen(true)
  }

  const handleConfirmEnroll = async () => {
    if (!enrollTarget) return
    try {
      const result = await enrollInCourse({
        classId: enrollTarget.class.id
      }).unwrap()

      if (result.checkoutUrl) {
        toast.success(
          c.createClass?.toastRedirectPayment || "Redirecting to payment..."
        )
        window.location.href = result.checkoutUrl
      } else {
        setEnrollSuccess(true)
        toast.success(
          c.student?.enrolledSuccess
            ? c.student.enrolledSuccess.replace("{{className}}", enrollTarget.class.title)
            : `Successfully enrolled in ${enrollTarget.class.title}!`
        )
      }
    } catch (err) {
      toast.error(err.data?.message || err.message || "Failed to enroll in class.")
    }
  }

  const handleSuccessClose = () => {
    setIsJoinOpen(false)
    const targetClassId = enrollTarget?.class?.id
    setEnrollTarget(null)
    if (targetClassId) {
      navigate(`/workspace/learning/class/${targetClassId}`)
    }
  }

  const notifyInDevelopment = () => {
    toast.success(c.student?.inDevelopment || "Tính năng đang phát triển")
  }

  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Error loading course: {error.message || "Unknown error"}
      </div>
    )
  }

  const rawCourse = courseDetail || {}
  const classes = rawCourse.classes || []
  const teacher = rawCourse.teacher || {}
  const isOwner = currentUserId && (rawCourse.accountId?.toString() === currentUserId || teacher.accountId?.toString() === currentUserId)

  // Data helpers
  const languageLabel = rawCourse.language || "English"
  const levelLabel = rawCourse.levels?.join(", ") || "All Levels"

  return (
    <div className="flex flex-col gap-8 text-[#2e2e2e] bg-gray-50/30 -mx-4 sm:-mx-6 px-4 sm:px-6">

      {/* ─── Breadcrumb ─── */}
      <div className="text-xs text-gray-400 font-semibold flex flex-wrap items-center gap-1.5">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Home"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/learning")}>{c.student?.dashboardTitle || "My Learning"}</span>
        <span>/</span>
        <span className="text-[#990011] font-bold">{rawCourse.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* ─── 1. Course Header Block inside Left Column ─── */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                {languageLabel}
              </span>
              <span className="bg-red-50 text-[#990011] border border-red-100 font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                {levelLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight leading-tight">
              {rawCourse.title}
            </h1>

            {/* Side-by-side 50/50: Description (Left) + Thumbnail (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-1">
              {rawCourse.description && (
                <div className="text-sm sm:text-sm md:text-base text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                  {rawCourse.description}
                </div>
              )}

              <div className="w-full">
                <img
                  src={rawCourse.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"}
                  alt={rawCourse.title}
                  className="w-full h-52 sm:h-60 object-cover rounded-2xl border border-gray-150 shadow-2xs block"
                />
              </div>
            </div>
          </div>

          {/* ─── 2. Overview Specifications 6-Grid ─── */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex flex-col gap-6">
            <h2 className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-2">
              <BookOpen size={20} className="text-[#990011]" />
              <span>{c.student?.overview || "Overview"}</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <Radio size={18} className="text-[#990011] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-400 font-bold uppercase">{c.student?.liveGroupClass || "Live Group Class"}</span>
                  <span className="text-sm font-black text-gray-950">{c.student?.liveGroupClassDesc || "Meet over live video meetings"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <Calendar size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-400 font-bold uppercase">{c.student?.totalClasses || "Total Classes"}</span>
                  <span className="text-sm font-black text-gray-950">{classes.length} {c.student?.classesText || "classes"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <Award size={18} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-400 font-bold uppercase">{c.student?.targetLevel || "Target Level"}</span>
                  <span className="text-sm font-black text-gray-950">{levelLabel}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100">
                <Globe size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-400 font-bold uppercase">{c.student?.languageLabel || "Language"}</span>
                  <span className="text-sm font-black text-gray-950">{languageLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 4. Available Classes ─── */}
          <div id="schedule-section" className="bg-white rounded-3xl border border-gray-150 p-6 shadow-xs flex flex-col gap-6 scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                  <Calendar size={20} className="text-[#990011]" />
                  <span>{c.student?.availableClasses || "Available Classes"}</span>
                </h2>
                <p className="text-sm text-gray-400 font-semibold mt-0.5">{c.student?.selectClassDesc || "Select a class that best fits your daily schedule."}</p>
              </div>
            </div>

            {classes.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl border border-gray-150 p-10 text-center text-gray-400 font-bold flex flex-col items-center justify-center">
                <span className="text-gray-800 text-base mb-1">{c.student?.noClassesTitle || "No Classes Available Yet"}</span>
                <span className="text-sm font-semibold max-w-[280px]">{c.student?.noClassesDesc || "New class sessions will be scheduled soon. Please check back later."}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {classes.map((cls) => {
                  const isClassEnrolled = cls.isEnrolled || rawCourse.enrolledClassId === cls.id
                  const isExpanded = !!expandedClassIds[cls.id]
                  const enrolledSeats = cls.studentCount !== undefined ? cls.studentCount : (cls.enrolledStudents || 0)
                  const totalSlots = cls.slots || cls.capacity || 10

                  return (
                    <div
                      key={cls.id}
                      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isClassEnrolled
                        ? "border-green-300 ring-2 ring-green-50/60"
                        : isExpanded
                          ? "border-[#990011]/30 shadow-md ring-2 ring-red-50/40"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-2xs"
                        }`}
                    >
                      {/* Accordion Trigger */}
                      <div
                        onClick={() => toggleClassExpand(cls.id)}
                        className="p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 cursor-pointer select-none group bg-white"
                      >
                        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-red-50 text-[#990011] font-black text-[12px] px-2.5 py-0.5 rounded-full tracking-wider border border-red-100/60">
                              {cls.title}
                            </span>
                            {isClassEnrolled && (
                              <span className="bg-green-100 text-green-700 font-bold text-[12px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 size={10} />
                                <span>{c.student?.enrolled || "Enrolled"}</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-black text-base text-gray-950 group-hover:text-[#990011] transition-colors leading-snug">
                            {cls.schedule?.days?.join(" - ") || "Weekly"} | {cls.schedule?.startTime} - {cls.schedule?.endTime}
                          </h3>

                          <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span>
                                {cls.startDate && cls.endDate
                                  ? `${formatDateDayMonth(cls.startDate)} – ${formatDateDayMonth(cls.endDate)}`
                                  : cls.startDate
                                    ? `${c.student?.startsOn || "Starts"} ${formatDateDayMonth(cls.startDate)}`
                                    : "TBA"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between items-center sm:items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-150 shrink-0">
                          <div className="flex flex-col sm:items-end">
                            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">{c.student?.tuitionFee || "Tuition Fee"}</span>
                            <span className="text-gray-950 font-black text-base">{formatCurrencyVND(cls.tuitionFee)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isClassEnrolled ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/workspace/learning/class/${cls.id}`)
                                }}
                                className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-full transition-all active:scale-95 shadow-2xs"
                              >
                                {c.student?.goToWorkspace || "Go to Workspace →"}
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenEnroll(rawCourse, cls)
                                }}
                                className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-sm font-black rounded-full transition-all active:scale-95 shadow-2xs"
                              >
                                {c.student?.enroll || "Enroll"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Collapsible Panel */}
                      {isExpanded && (
                        <div className="bg-gray-50/70 border-t border-gray-150 p-5 flex flex-col gap-4 text-sm animate-fadeIn">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-white rounded-xl p-3 border border-gray-150 flex items-start gap-2.5">
                              <Users size={18} className="text-[#990011] shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-400 font-bold text-[12px] uppercase">{c.student?.enrolledSlots || "Enrolled Slots"}</span>
                                <span className="text-gray-950 font-black text-sm">{enrolledSeats} / {totalSlots}</span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-gray-150 flex items-start gap-2.5">
                              <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-400 font-bold text-[12px] uppercase">{c.student?.sessionCount || "Session Count"}</span>
                                <span className="text-gray-950 font-black text-sm">{cls.progress?.totalSessions || cls.totalSessions || 24} {c.student?.sessionsText || "Sessions"}</span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-gray-150 flex items-start gap-2.5">
                              <Video size={18} className="text-blue-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-gray-400 font-bold text-[12px] uppercase">{c.student?.virtualClassroom || "Virtual Classroom"}</span>
                                <span className="text-gray-950 font-black text-sm truncate">{cls.roomName || c.student?.onlineClassroom || "Online Classroom"}</span>
                              </div>
                            </div>
                          </div>

                          {cls.rawSchedule && cls.rawSchedule.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold text-gray-700 text-[11px]">{c.student?.weeklySchedule || "Weekly Schedule:"}</span>
                              <div className="flex flex-wrap gap-2">
                                {cls.rawSchedule.map((s, idx) => (
                                  <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold">
                                    <strong className="text-gray-950">{s.dayOfWeek}:</strong> {s.startTime} - {s.endTime}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Always-Visible Class Description */}
                          <div className="bg-white rounded-xl p-3.5 border border-gray-150 flex flex-col gap-1">
                            <span className="font-bold text-gray-950 text-sm flex items-center gap-1">
                              <FileText size={13} className="text-[#990011]" />
                              <span>{c.student?.description || "Description"}</span>
                            </span>
                            <p className="text-gray-600 font-medium text-sm leading-relaxed">
                              {cls.description || c.student?.defaultClassDesc || "Weekly interactive live class batch featuring 1-on-1 speaking practice, real-time feedback, and structured curriculum modules."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-6">
          {/* ─── MEET THE TEACHER CARD (Right Sidebar Column) ─── */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 flex flex-col gap-5">
            <h2 className="text-lg font-black text-gray-950 tracking-tight flex items-center gap-2 border-b border-gray-100 pb-3">
              <User size={18} className="text-[#990011]" />
              <span>{c.student?.meetInstructor || "Meet the Instructor"}</span>
            </h2>

            <div className="flex items-center gap-3.5">
              {teacher.avatarImageUrl ? (
                <img
                  className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-2xs shrink-0"
                  src={teacher.avatarImageUrl}
                  alt={teacher.name || "Instructor"}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-red-100 text-[#990011] flex items-center justify-center font-black text-xl border border-red-200 shadow-2xs shrink-0">
                  {(teacher.name || "T")[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="font-black text-gray-950 text-base truncate">
                  {teacher.name || "CatSpeak Instructor"}
                </h3>
                <span className="text-[12px] text-[#b20a1c] font-bold uppercase truncate">
                  {c.student?.seniorCoach || "Senior CatSpeak Coach"}
                </span>
              </div>
            </div>

            {teacher.introduction && (
              <div className="flex flex-col gap-1.5">
                <h4 className="font-extrabold text-sm text-gray-950 tracking-wider">{c.student?.aboutMe || "About Me"}</h4>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  {teacher.introduction}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  const teacherId = teacher.accountId || teacher.id
                  if (teacherId) {
                    navigate(`/workspace/instructor/${teacherId}`)
                  } else {
                    notifyInDevelopment()
                  }
                }}
                className="flex-1 h-10 border border-gray-200 hover:bg-gray-50 text-gray-800 text-sm font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <User size={14} />
                <span>{c.student?.profile || "Profile"}</span>
              </button>

              <button
                onClick={notifyInDevelopment}
                className="flex-1 h-10 border border-gray-200 hover:bg-gray-50 text-gray-800 text-sm font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Mail size={14} />
                <span>{c.student?.contactInstructor || "Contact Instructor"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Enrollment Checkout Modal */}
      <StudentJoinModal
        open={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onConfirm={handleConfirmEnroll}
        course={enrollTarget?.course}
        selectedClass={enrollTarget?.class}
        isSubmitting={isEnrolling}
        success={enrollSuccess}
        onSuccessClose={handleSuccessClose}
        t={t}
      />
    </div>
  )
}

export default StudentCourseDetailPage
