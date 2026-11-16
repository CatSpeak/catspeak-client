import React, { useContext, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Check, AlertTriangle } from "lucide-react"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import {
  useEnrollInCourseMutation,
  useGetExploreClassDetailQuery,
} from "@/store/api/coursesApi"
import {
  getClassEnrollmentIssue,
  getClassEnrollmentIssueMessage,
} from "../utils/courseUtils"

import PublicClassHero from "../components/public-class/PublicClassHero"
import PublicClassStatsBar from "../components/public-class/PublicClassStatsBar"
import PublicClassInstructor from "../components/public-class/PublicClassInstructor"
import PublicClassSidebarCTA from "../components/public-class/PublicClassSidebarCTA"
import PublicClassScheduleCard from "../components/public-class/PublicClassScheduleCard"
import ClassReviewSummary from "../components/public-class/ClassReviewSummary"
import RenderHTML from "@/shared/components/ui/RenderHTML"

const PublicClassDetailPage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const pc = c.publicClass || {}

  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const authModalCtx = useContext(AuthModalContext)
  const enrollmentGuardRef = useRef(false)

  const isWorkspace = location.pathname.startsWith("/workspace")

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate(isWorkspace ? "/workspace/explore-courses" : "/explore-courses")
    }
  }

  // Fetch Class Detail
  const {
    currentData: classResponse,
    isLoading,
    error,
  } = useGetExploreClassDetailQuery(id, { skip: !id })

  const [{ isLoading: isEnrolling }] = useEnrollInCourseMutation()

  const classData =
    classResponse &&
      typeof classResponse === "object" &&
      !Array.isArray(classResponse) &&
      classResponse.id
      ? classResponse
      : null

  const isEnrolled = classData?.isEnrolled === true
  const courseTitle = classData?.courseName || classData?.courseTitle || ""

  const enrollmentIssue = isEnrolled
    ? null
    : getClassEnrollmentIssue({ classData })
  const isUpcoming =
    enrollmentIssue === "upcoming" ||
    String(classData?.status || "").toUpperCase() === "UPCOMING"

  // Handle Enrollment Action
  const handleEnrollAction = async () => {
    if (isEnrolled) {
      navigate(`/workspace/learning/class/${id}`)
      return
    }

    if (isUpcoming || enrollmentIssue === "upcoming") {
      toast.error(
        pc.upcomingNotice || getClassEnrollmentIssueMessage("upcoming", pc),
      )
      return
    }

    if (enrollmentIssue === "full") {
      toast.error(pc.classFull || getClassEnrollmentIssueMessage("full", pc))
      return
    }

    if (enrollmentIssue === "closed") {
      toast.error(
        pc.enrollmentClosed || getClassEnrollmentIssueMessage("closed", pc),
      )
      return
    }

    if (enrollmentIssue) {
      toast.error(getClassEnrollmentIssueMessage(enrollmentIssue, pc))
      return
    }

    if (!isAuthenticated) {
      if (authModalCtx?.openAuthModal) {
        authModalCtx.openAuthModal("login", location.pathname)
      } else {
        toast.error("Vui lòng đăng nhập để đăng ký lớp học.")
      }
      return
    }

    if (enrollmentGuardRef.current || isEnrolling) {
      return
    }
    enrollmentGuardRef.current = true

    const basePath = isWorkspace ? "/workspace" : ""
    navigate(`${basePath}/explore-courses/class/${id}/checkout`)
  }

  if (isLoading) {
    return (
      <div className="min-h-[90vh] flex flex-col justify-center items-center gap-2">
        <LoadingSpinner className="w-10 h-10 text-[#b20a1c] dark:text-[#FF6B6B]" />
        <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">
          {pc.loading || "Đang tải thông tin lớp học..."}
        </p>
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/40 text-[#b20a1c] dark:text-[#FF6B6B] flex items-center justify-center font-bold text-xl">
          !
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {pc.notFoundTitle || "Không tìm thấy thông tin lớp học"}
        </h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm max-w-md">
          {pc.notFoundDesc ||
            "Lớp học có thể đã bị xóa hoặc đường dẫn không hợp lệ. Vui lòng quay lại danh sách lớp học để khám phá thêm."}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-2 bg-[#b20a1c] hover:bg-[#960817] dark:bg-[#FF6B6B] dark:hover:bg-[#ff8585] dark:text-[#1A1A1A] text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-colors text-sm cursor-pointer"
        >
          {pc.exploreOtherBtn || "Khám Phá Các Lớp Học Khác"}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen text-slate-900 dark:text-gray-100 pb-12">
        {/* Hero Section */}
        <PublicClassHero
          classData={classData}
          courseTitle={courseTitle}
          isEnrolled={isEnrolled}
          isUpcoming={isUpcoming}
          enrollmentIssue={enrollmentIssue}
          onEnroll={handleEnrollAction}
          onBack={handleBack}
        />

        {/* Overlapping Quick Stats Card */}
        <PublicClassStatsBar classData={classData} />

        {/* Review summary strip */}
        {id ? (
          <div className="mx-auto mt-3 flex max-w-7xl items-center justify-center px-4">
            <ClassReviewSummary classId={id} />
          </div>
        ) : null}

        {/* Main Content Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Column (About & Instructor) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* About / Class Overview */}
              <section id="about" className="scroll-mt-24">
                <div className="bg-white dark:bg-[#1A1A1A] border border-border dark:border-[#3F3F3F] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-tight mb-3">
                    {pc.overviewTitle || "Về lớp học"}
                  </h2>
                  {classData.description ? (
                    <RenderHTML
                      html={classData.description}
                      className="prose dark:prose-invert prose-slate max-w-none text-slate-700 dark:text-gray-300 font-medium leading-relaxed text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 dark:text-gray-400 font-medium leading-relaxed text-sm sm:text-base">
                      {pc.defaultDescription ||
                        "Lớp học mang đến môi trường học tập tương tác cao, kết hợp giữa lý thuyết nền tảng và các hoạt động thực hành giao tiếp sát với thực tế công việc."}
                    </p>
                  )}
                </div>
              </section>

              {/* Instructor Profile */}
              <PublicClassInstructor classData={classData} />
            </div>

            {/* Secondary Column (CTA & Schedule): Stacked below Instructor on mobile/tablet, Sticky on Desktop */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-20">
              <PublicClassSidebarCTA
                classData={classData}
                isEnrolled={isEnrolled}
                isUpcoming={isUpcoming}
                onEnroll={handleEnrollAction}
              />
              <PublicClassScheduleCard classData={classData} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default PublicClassDetailPage
