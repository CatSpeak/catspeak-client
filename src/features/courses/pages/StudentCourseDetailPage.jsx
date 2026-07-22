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
import { Calendar, Clock, Mail, CheckCircle2 } from "lucide-react"

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

  // Modal State
  const [enrollTarget, setEnrollTarget] = useState(null)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)

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
    toast.success("Tính năng đang phát triển")
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

  // Labels
  const languageLabel = rawCourse.language || "English"
  const levelLabel = rawCourse.levels?.join(", ") || "All Levels"

  return (
    <div className="flex flex-col gap-8 pb-16 text-[#2e2e2e]">

      {/* ─── Breadcrumb ─── */}
      <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Home"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/learning")}>{c.student?.dashboardTitle || "My Learning"}</span>
        <span>/</span>
        <span className="text-[#990011] font-semibold">{rawCourse.title}</span>
      </div>

      {/* ─── Immersive Landing Hero Banner ─── */}
      <div className="relative overflow-hidden rounded-3xl min-h-[360px] flex flex-col justify-end p-8 md:p-12 shadow-md text-white bg-cover bg-center"
        style={{
          backgroundImage: `url('${rawCourse.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"}')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent z-0" />

        <div className="relative z-10 flex flex-col gap-3.5 max-w-3xl">
          {/* Rating and Tags */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              {languageLabel}
            </span>
            <span className="bg-red-500 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
              {levelLabel}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
            {rawCourse.title}
          </h1>
        </div>
      </div>

      {/* ─── Split Grid Content ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Side: About, Classes */}
        <div className="lg:col-span-2 flex flex-col gap-10">

          {/* About This Course */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
              {c.student?.aboutCourse || "About This Course"}
            </h2>
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-xs leading-relaxed text-sm text-gray-600 font-medium flex flex-col gap-4">
              <p>
                {rawCourse.description}
              </p>
            </div>
          </div>

          {/* Class Selector / Batches */}
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
              {c.student?.availableClasses || "Available Batches"}
            </h2>

            {classes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center text-gray-400 font-bold flex flex-col items-center justify-center shadow-xs">
                <span className="text-gray-800 text-base mb-1">{c.student?.noClassesTitle || "No Classes Available Yet"}</span>
                <span className="text-xs font-semibold max-w-[280px]">{c.student?.noClassesDesc || "New class sessions will be scheduled soon. Please check back later."}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {classes.map((cls) => {
                  const isClassEnrolled = cls.isEnrolled || rawCourse.enrolledClassId === cls.id

                  return (
                    <div
                      key={cls.id}
                      className={`bg-white border rounded-3xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 transition-all ${isClassEnrolled
                        ? "border-green-300 ring-2 ring-green-50"
                        : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      <div className="flex-1 flex flex-col gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[9px] px-2.5 py-0.5 rounded-full">
                            {cls.title}
                          </span>
                          {isClassEnrolled && (
                            <span className="bg-green-100 text-green-700 font-bold text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              <span>{c.student?.enrolledStatus || c.student?.enrolled || "Enrolled"}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-black text-lg text-gray-950 leading-tight">
                          {cls.title}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-gray-500 mt-1">
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-gray-400" />
                            <span>{cls.schedule?.days?.join(" - ") || "TBA"} | {cls.schedule?.startTime} - {cls.schedule?.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-gray-400" />
                            <span>{c.student?.startDate || "Start date:"} {cls.startDate ? formatDateDayMonth(cls.startDate) : "TBA"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing and Action */}
                      <div className="border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 flex md:flex-col justify-between items-center md:items-end gap-3 shrink-0">
                        <div className="flex flex-col md:items-end">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{c.student?.tuitionFee || c.student?.tuition || "Tuition Fee"}</span>
                          <span className="text-gray-900 font-black text-lg">{formatCurrencyVND(cls.tuitionFee)}</span>
                        </div>

                        {isClassEnrolled ? (
                          <button
                            onClick={() => navigate(`/workspace/learning/class/${cls.id}`)}
                            className="h-9 px-5 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-full flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                          >
                            <span>{c.student?.goToWorkspace || "Go to Workspace"}</span>
                            <span>→</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenEnroll(rawCourse, cls)}
                            className="h-9 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full transition-all active:scale-95 shadow-sm"
                          >
                            <span>{c.student?.enrollBatch || "Enroll Batch"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tutor Info */}
        <div className="flex flex-col gap-8">

          {/* Instructor Bio */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-base font-black text-gray-950 tracking-tight">
              {c.student?.instructor || "Meet Your Instructor"}
            </h3>

            <div className="flex items-center gap-3.5">
              {teacher.avatarImageUrl ? (
                <img
                  className="w-12 h-12 rounded-full object-cover border border-gray-150"
                  src={teacher.avatarImageUrl}
                  alt={teacher.name || "Instructor"}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-100 text-[#990011] flex items-center justify-center font-black text-lg border border-red-200 shrink-0">
                  {(teacher.name || "T")[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <h4 className="font-extrabold text-gray-950 text-sm">
                  {teacher.name || "CatSpeak Instructor"}
                </h4>
                <span className="text-[10px] text-[#b20a1c] font-black uppercase">
                  {c.student?.seniorCoach || "CatSpeak Instructor"}
                </span>
              </div>
            </div>

            {teacher.introduction && (
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                {teacher.introduction}
              </p>
            )}

            <button
              onClick={notifyInDevelopment}
              className="w-full h-9 border border-gray-150 hover:border-gray-200 text-gray-700 text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Mail size={13} />
              <span>{c.student?.contactInstructor || c.student?.contactCoach || "Contact Coach"}</span>
            </button>
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
