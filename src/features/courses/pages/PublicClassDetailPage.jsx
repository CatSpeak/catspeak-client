import React, { useContext, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Check } from "lucide-react"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import {
  useGetExploreClassDetailQuery,
  useEnrollInCourseMutation
} from "@/store/api/coursesApi"
import { getSafeMediaUrl, getClassEnrollmentIssue, getClassEnrollmentIssueMessage } from "../utils/courseUtils"

import PublicClassHero from "../components/public-class/PublicClassHero"
import PublicClassStatsBar from "../components/public-class/PublicClassStatsBar"
// import PublicClassOutcomes from "../components/public-class/PublicClassOutcomes"
// import PublicClassSyllabus from "../components/public-class/PublicClassSyllabus"
import PublicClassInstructor from "../components/public-class/PublicClassInstructor"
// import PublicClassReviews from "../components/public-class/PublicClassReviews"
import PublicClassSidebarCTA from "../components/public-class/PublicClassSidebarCTA"
// import PublicClassFAQ from "../components/public-class/PublicClassFAQ"
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

  // Fetch Class Detail
  const {
    currentData: classResponse,
    isLoading,
    error,
    refetch
  } = useGetExploreClassDetailQuery(id, { skip: !id })

  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation()

  const classData = classResponse && typeof classResponse === "object" && !Array.isArray(classResponse) && classResponse.id
    ? classResponse
    : null

  const isEnrolled = classData?.isEnrolled === true
  const courseTitle = classData?.courseName || classData?.courseTitle || ""

  const enrollmentIssue = isEnrolled
    ? null
    : getClassEnrollmentIssue({ classData })
  const isUpcoming = enrollmentIssue === "upcoming" || String(classData?.status || "").toUpperCase() === "UPCOMING"

  const tuitionValue = classData?.tuitionFee ?? classData?.price

  // Handle Enrollment Action
  const handleEnrollAction = async () => {
    if (isEnrolled) {
      // Go to learning class view
      navigate(`/workspace/learning/class/${id}`)
      return
    }

    if (isUpcoming || enrollmentIssue === "upcoming") {
      toast.error(pc.upcomingNotice || getClassEnrollmentIssueMessage("upcoming", pc))
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

    // Authenticated -> Enroll
    try {
      const result = await enrollInCourse({ classId: id, courseId: classData?.courseId }).unwrap()
      const resultPayload = (
        result
        && typeof result === "object"
        && !Array.isArray(result)
        && Object.prototype.hasOwnProperty.call(result, "data")
      )
        ? result.data
        : result

      if (resultPayload?.checkoutUrl) {
        const checkoutUrl = getSafeMediaUrl(resultPayload.checkoutUrl)
        if (!checkoutUrl) throw new Error("Invalid checkout URL")
        toast.success("Đang chuyển hướng đến trang thanh toán...")
        window.location.assign(checkoutUrl)
      } else {
        toast.success("Đăng ký lớp học thành công!")
        refetch()
      }
    } catch (err) {
      toast.error(err?.data?.message || "Đăng ký không thành công. Vui lòng thử lại sau.")
    } finally {
      enrollmentGuardRef.current = false
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4 bg-slate-50">
        <LoadingSpinner className="w-10 h-10 text-[#b20a1c]" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          {pc.loading || "Đang tải thông tin lớp học..."}
        </p>
      </div>
    )
  }

  if (error || !classData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-[#b20a1c] flex items-center justify-center font-black text-xl">
          !
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          {pc.notFoundTitle || "Không tìm thấy thông tin lớp học"}
        </h2>
        <p className="text-slate-500 text-sm max-w-md">
          {pc.notFoundDesc || "Lớp học có thể đã bị xóa hoặc đường dẫn không hợp lệ. Vui lòng quay lại danh sách lớp học để khám phá thêm."}
        </p>
        <button
          type="button"
          onClick={() => navigate(isWorkspace ? "/workspace/explore-courses" : "/explore-courses")}
          className="mt-2 bg-[#b20a1c] hover:bg-[#960817] text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-colors text-sm"
        >
          {pc.exploreOtherBtn || "Khám Phá Các Lớp Học Khác"}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 lg:pb-16">
      {/* Hero Section */}
      <PublicClassHero
        classData={classData}
        courseTitle={courseTitle}
        isEnrolled={isEnrolled}
        isEnrolling={isEnrolling}
        isUpcoming={isUpcoming}
        onEnroll={handleEnrollAction}
      />

      {/* Overlapping Quick Stats Card */}
      <PublicClassStatsBar classData={classData} />

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Detail Column */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            {/* About / Class Overview */}
            <section id="about" className="scroll-mt-24">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mb-4">
                  {pc.overviewTitle || "Giới Thiệu Chi Tiết Về Lớp Học"}
                </h2>
                {classData.description ? (
                  <RenderHTML
                    html={classData.description}
                    className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed text-sm sm:text-base"
                  />
                ) : (
                  <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
                    {pc.defaultDescription || "Lớp học mang đến môi trường học tập tương tác cao, kết hợp giữa lý thuyết nền tảng và các hoạt động thực hành giao tiếp sát với thực tế công việc."}
                  </p>
                )}
              </div>
            </section>

            {/* Instructor Profile */}
            <PublicClassInstructor classData={classData} />

            {/* FAQ */}
            {/* <PublicClassFAQ /> */}
          </div>

          {/* Sticky Sidebar Column (Desktop) */}
          <div className="hidden lg:block lg:col-span-4">
            <PublicClassSidebarCTA
              classData={classData}
              isEnrolled={isEnrolled}
              isEnrolling={isEnrolling}
              isUpcoming={isUpcoming}
              onEnroll={handleEnrollAction}
            />
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA Bar (Mobile & Tablet) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 p-4 shadow-2xl flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            {c.tuition || pc.tuitionFeeFull || "Học phí trọn gói"}
          </span>
          <span className="text-lg font-black text-slate-950">
            {tuitionValue != null ? `${Number(tuitionValue).toLocaleString()} VNĐ` : (pc.tbaFee || "Chưa xác định")}
          </span>
        </div>

        {isEnrolled ? (
          <button
            type="button"
            onClick={handleEnrollAction}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 text-sm"
          >
            <Check size={16} /> {c.enterClass || pc.enterClass || "Vào Lớp Học"}
          </button>
        ) : isUpcoming ? (
          <button
            type="button"
            onClick={handleEnrollAction}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 text-sm cursor-pointer shadow-md"
          >
            {pc.upcomingLabel || c.upcomingStatus || "Sắp diễn ra"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEnrollAction}
            disabled={isEnrolling}
            className="bg-[#b20a1c] hover:bg-[#960817] disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold px-6 py-3 rounded-2xl flex items-center gap-2 text-sm"
          >
            {isEnrolling ? (pc.processing || "Đang xử lý...") : (c.enrollNow || pc.enrollNow || "Đăng Ký Ngay")}
          </button>
        )}
      </div>
    </div>
  )
}

export default PublicClassDetailPage
