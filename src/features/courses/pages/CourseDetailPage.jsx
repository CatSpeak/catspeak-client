import React, { lazy, Suspense } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetCourseDetailQuery } from "@/store/api/coursesApi"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import { Tabs } from "@/shared/components/ui/navigation"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useAuth } from "@/features/auth"
import { useRoleOverride } from "../components/RoleSwitcher"
import TeacherClassOverviewTab from "./TeacherCourseDetailPageElements/TeacherClassOverviewTab"

const VouchersTab = lazy(
  () => import("@/features/vouchers/components/VouchersTab"),
)

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useLanguage()
  const c = t.courses || {}

  const { user } = useAuth()
  const { isTeacher } = useRoleOverride()

  // Fetch course details
  const {
    currentData: data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCourseDetailQuery(id, { skip: !id })

  const rawCourse =
    data && typeof data === "object" && !Array.isArray(data) && data.id
      ? data
      : null

  const isCourseTeacher = Boolean(
    isTeacher ||
      user?.isTeacher ||
      (user?.accountId &&
        [
          rawCourse?.teacherId,
          rawCourse?.instructorId,
          rawCourse?.teacher?.id,
          rawCourse?.teacher?.accountId,
        ].some((tid) => tid != null && String(tid) === String(user.accountId))),
  )

  const urlTab = searchParams.get("tab")
  const VALID_COURSE_TABS = ["overview", "vouchers"]
  const activeTab =
    urlTab && VALID_COURSE_TABS.includes(urlTab) ? urlTab : "overview"

  const handleTabChange = (tab) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    nextSearchParams.set("tab", tab)
    setSearchParams(nextSearchParams)
  }

  const courseTabs = [
    { value: "overview", label: c.courseDetail?.overview || "Overview" },
    ...(isCourseTeacher ? [{ value: "vouchers", label: c.courseDetail?.vouchers || "Vouchers" }] : []),
  ]

  if ((isLoading || isFetching) && data === undefined) {
    return (
      <div
        className="flex justify-center items-center min-h-[400px]"
        role="status"
      >
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
        <span>
          {c.courseDetail?.loadFailed || "Could not load the course details."}
        </span>
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
          {
            label: t.nav?.home || "Trang chủ",
            onClick: () => navigate("/workspace"),
          },
          {
            label: c.title || "Khóa học của tôi",
            onClick: () => navigate("/workspace/courses"),
          },
          {
            label: c.allCourses?.title || "All Courses",
            onClick: () => navigate("/workspace/courses"),
          },
          { label: c.student?.courseDetails || "Course Details" },
        ]}
      />

      {/* ─── Page Heading ─── */}
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">
        {c.student?.courseDetails || "Course Details"}
      </h1>

      {/* ─── Navigation Tabs ─── */}
      {isCourseTeacher && (
        <Tabs
          tabs={courseTabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          fullWidth={false}
          className="border-b border-border/80"
        />
      )}

      {/* ─── Tab Content ─── */}
      {activeTab === "overview" ? (
        <TeacherClassOverviewTab courseData={rawCourse} />
      ) : (
        <Suspense
          fallback={
            <LoadingSpinner className="flex justify-center items-center min-h-[240px]" />
          }
        >
          <VouchersTab scope="course" courseId={id} />
        </Suspense>
      )}
    </div>
  )
}

export default CourseDetailPage
