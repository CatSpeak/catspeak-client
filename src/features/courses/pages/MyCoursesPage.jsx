import React, { useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { BookOpen, FilterX, GraduationCap, Plus, SlidersHorizontal } from "lucide-react"
import { toast } from "react-hot-toast"

import {
  useGetAllCoursesQuery,
  useGetAllClassesQuery,
  useDeleteClassMutation,
} from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { Breadcrumb, Tabs } from "@/shared/components/ui/navigation"

import CourseManagementCard from "../components/CourseManagementCard"
import CourseSelectFilter from "../components/CourseSelectFilter"
import EmptyCoursesState from "../components/EmptyCoursesState"
import ViewModeToggle from "../components/shared/ViewModeToggle"
import { useDeleteCourse } from "../hooks/useDeleteCourse"
import {
  filterByStatus,
  mapTeacherCourseSummary,
  mapTeacherClassSummary,
} from "../utils/courseTransforms"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { copyShareLink } from "@/shared/utils/shareUtils"

const MyCoursesPage = ({ initialTab = "courses" }) => {
  const { t } = useLanguage()
  const { formatDate, formatScheduleTime, formatScheduleDays } = useTimezone()
  const navigate = useNavigate()
  const c = t.courses || {}
  const mc = c.myCourses || {}

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || initialTab || "courses"
  const viewMode = searchParams.get("view") || "grid"
  const statusFilter = searchParams.get("status") || "all"

  const isCoursesTab = activeTab === "courses"

  const statusOptions = [
    { value: "all", label: mc.statusAll || "All Status" },
    { value: "teaching", label: c.teachingStatus || "Teaching" },
    { value: "open", label: c.openEnrollmentStatus || "Open" },
    { value: "not_started", label: c.notStartedStatus || "Not Started" },
    { value: "archived", label: c.archive || "Archived" },
  ]

  const mainTabs = useMemo(() => [
    {
      id: "courses",
      value: "courses",
      label: c.myCoursesTab || "Khóa học của tôi",
      icon: BookOpen,
    },
    {
      id: "classes",
      value: "classes",
      label: c.myClassesTab || "Lớp học của tôi",
      icon: GraduationCap,
    },
  ], [c.myCoursesTab, c.myClassesTab])

  const handleTabChange = (tabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("tab", tabId)
      return next
    })
  }

  const setViewMode = (mode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("view", mode)
      return next
    })
  }

  const setStatusFilter = (status) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("status", status)
      return next
    })
  }

  // Course Deletion Handler
  const deleteCourseHelper = useDeleteCourse(t)

  // Class Deletion Handler
  const [classDeleteTarget, setClassDeleteTarget] = useState(null)
  const classDeleteGuardRef = useRef(false)
  const [deleteClass, { isLoading: isDeletingClass }] = useDeleteClassMutation()

  const handleConfirmClassDelete = async () => {
    if (!classDeleteTarget?.id || classDeleteGuardRef.current) return

    classDeleteGuardRef.current = true
    try {
      await deleteClass({
        id: classDeleteTarget.id,
        courseId: classDeleteTarget.courseId,
      }).unwrap()
      toast.success(
        c.classDetail?.toastCancelSuccess || "Class deleted successfully!",
      )
    } catch {
      toast.error(
        c.classDetail?.toastCancelFailed || "Failed to delete class!",
      )
    } finally {
      classDeleteGuardRef.current = false
      setClassDeleteTarget(null)
    }
  }

  const handleCloseClassDeleteModal = () => {
    if (isDeletingClass) return
    setClassDeleteTarget(null)
  }

  // Fetch Courses (skipped if activeTab !== 'courses')
  const {
    currentData: coursesData,
    isLoading: isCoursesLoading,
    isFetching: isCoursesFetching,
    error: coursesError,
    refetch: refetchCourses,
  } = useGetAllCoursesQuery(
    {
      page: 1,
      pageSize: 6,
      status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
    },
    { skip: activeTab !== "courses" },
  )

  // Fetch Classes (skipped if activeTab !== 'classes')
  const {
    currentData: classesData,
    isLoading: isClassesLoading,
    isFetching: isClassesFetching,
    error: classesError,
    refetch: refetchClasses,
  } = useGetAllClassesQuery(
    {
      page: 1,
      pageSize: 6,
      status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
    },
    { skip: activeTab !== "classes" },
  )

  const isLoading = isCoursesTab
    ? isCoursesLoading || (isCoursesFetching && coursesData === undefined)
    : isClassesLoading || (isClassesFetching && classesData === undefined)

  const isRefreshing = isCoursesTab ? isCoursesFetching : isClassesFetching
  const error = isCoursesTab
    ? coursesData === undefined && coursesError
    : classesData === undefined && classesError
  const refreshError = isCoursesTab ? coursesError : classesError

  const coursesRaw = useMemo(
    () => (Array.isArray(coursesData?.data) ? coursesData.data : []),
    [coursesData],
  )

  const classesRaw = useMemo(
    () => (Array.isArray(classesData?.data) ? classesData.data : []),
    [classesData],
  )

  const courseList = useMemo(
    () => coursesRaw.map((course, index) => mapTeacherCourseSummary(
      course,
      index,
      {
        classCount: c.classCount,
        noClasses: c.noClasses || "Chưa có lớp",
        studentsCount: c.studentsCount,
        free: c.free || "Miễn phí",
        tba: c.workspaceUi?.tba,
      },
      formatDate,
    )),
    [coursesRaw, c.classCount, c.noClasses, c.studentsCount, c.free, c.workspaceUi?.tba, formatDate],
  )

  const classList = useMemo(
    () => classesRaw.map((cls, index) => mapTeacherClassSummary(
      cls,
      index,
      {
        notAvailable: c.workspaceUi?.notAvailable,
        studentsRatio: c.allClasses?.studentsRatio,
        tba: c.workspaceUi?.tba,
      },
      formatDate,
      formatScheduleTime,
      formatScheduleDays,
    )),
    [
      classesRaw,
      c.allClasses?.studentsRatio,
      c.workspaceUi?.notAvailable,
      c.workspaceUi?.tba,
      formatDate,
      formatScheduleTime,
      formatScheduleDays,
    ],
  )

  const filteredDisplayList = useMemo(
    () => filterByStatus(isCoursesTab ? courseList : classList, statusFilter),
    [isCoursesTab, courseList, classList, statusFilter],
  )

  const tabs = [
    { id: "courses", label: c.myCoursesTab || "My Courses", icon: BookOpen },
    { id: "classes", label: c.myClassesTab || "My Classes", icon: GraduationCap },
  ]

  const courseCardLabels = {
    editCourse: c.editCourse || "Edit Course",
    deleteCourse: c.courseDetail?.deleteCourse || "Delete Course",
    createdDate: c.createdDate || "Created Date",
    manageDetails: c.manageDetails || "Manage Details",
    progress: c.progress || "Progress",
    courseLabel: c.course || "Course",
    share: c.courseDetail?.shareCourse || c.share || "Share",
    classLabel: c.class || "Class",
    classCount: c.classCount || "{{count}} classes",
    actionsFor: c.actionsForCourse || "Actions for {{title}}",
  }

  const classCardLabels = {
    editCourse: c.editClass || "Edit Class",
    deleteCourse: c.createClass?.deleteClass || "Delete Class",
    createdDate: c.createdDate || "Created Date",
    manageDetails: c.manageDetails || "Manage Details",
    progress: c.progress || "Progress",
    courseLabel: c.course || "Course",
    share: c.classDetail?.shareClass || c.share || "Share",
    classLabel: c.class || "Class",
    standaloneClass: c.createClass?.standaloneClass || "Lớp độc lập",
    classCount: c.classCount || "{{count}} classes",
    actionsFor: c.actionsForCourse || "Actions for {{title}}",
  }

  const handleShare = async (item) => {
    const itemId = item.id || item._id
    const shareUrl = isCoursesTab ? `${window.location.origin}/explore-courses/details/${itemId}` : `${window.location.origin}/explore-courses/class/${itemId}`
    await copyShareLink({
      url: shareUrl,
      successMessage: c.courseDetail?.linkCopied || "Link copied!",
      errorMessage: c.courseDetail?.linkCopyFailed || "Failed to copy link",
    })
  }

  return (
    <div className="flex flex-col gap-4 text-[#2e2e2e]">
      {isRefreshing && (
        <span role="status" className="sr-only">
          {isCoursesTab
            ? (mc.refreshingCourses || "Refreshing course overview")
            : (mc.refreshingClasses || "Refreshing class overview")}
        </span>
      )}
      {refreshError && !error && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          {isCoursesTab
            ? (mc.refreshCoursesFailed || "Some course data could not be refreshed. The displayed information may be out of date.")
            : (mc.refreshClassesFailed || "Some class data could not be refreshed. The displayed information may be out of date.")}
        </div>
      )}

      {/* ─── Breadcrumb ─── */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Home", onClick: () => navigate("/workspace") },
          { label: isCoursesTab ? (c.myCoursesTab || "My Courses") : (c.myClassesTab || "My Classes") },
        ]}
      />

      {/* ─── Header & Primary Action ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {isCoursesTab ? (c.myCoursesTab || "My Courses") : (c.myClassesTab || "My Classes")}
        </h1>

        {isCoursesTab ? (
          <button
            type="button"
            onClick={() => navigate("/workspace/courses/create")}
            className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>{c.createCourse?.title || "Create Course"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/workspace/classes/create-class")}
            className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>{c.createClass?.createClass || "Create Class"}</span>
          </button>
        )}
      </div>

      {/* ─── Navigation Tabs & Controls ─── */}
      <div className="flex items-end justify-between border-b border-gray-200/90 mt-3 mb-3">
        {/* Left Tabs */}
        <Tabs
          tabs={mainTabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          fullWidth={false}
          className="border-b-0 -mb-[1px]"
        />

        {/* Right Filter & View Mode Controls */}
        <div className="flex items-center gap-3 pb-2">
          <CourseSelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            trigger={(isOpen, _, toggle) => (
              <button
                type="button"
                onClick={toggle}
                title={mc.filterStatus || "Lọc theo trạng thái"}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                  isOpen || statusFilter !== "all"
                    ? "border-[#b20a1c] bg-rose-50 text-[#b20a1c] ring-2 ring-rose-100"
                    : "border-[#b20a1c]/40 bg-white text-[#b20a1c] hover:bg-rose-50/50 hover:border-[#b20a1c]"
                }`}
              >
                <SlidersHorizontal size={18} />
              </button>
            )}
          />
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* ─── Content ─── */}
      {isLoading ? (
        <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
      ) : error ? (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3 mt-4">
          <span>
            {isCoursesTab
              ? (mc.loadCoursesFailed || "The course overview could not be loaded. Please try again.")
              : (mc.loadClassesFailed || "The class overview could not be loaded. Please try again.")}
          </span>
          <button
            type="button"
            onClick={() => (isCoursesTab ? refetchCourses() : refetchClasses())}
            className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white cursor-pointer"
          >
            {mc.retry || "Try again"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 mt-1">
          {filteredDisplayList.length === 0 ? (
            <EmptyCoursesState
              icon={statusFilter !== "all" ? FilterX : (isCoursesTab ? BookOpen : GraduationCap)}
              title={
                statusFilter !== "all"
                  ? (isCoursesTab
                    ? (mc.noFilteredCoursesTitle || "No matching courses found")
                    : (mc.noFilteredClassesTitle || "No matching classes found"))
                  : (isCoursesTab
                    ? (mc.noCoursesTitle || "Start Your Teaching Journey")
                    : (mc.noClassesTitle || "Ready to Set Up Your First Class?"))
              }
              message={
                statusFilter !== "all"
                  ? (isCoursesTab
                    ? (mc.noFilteredCoursesDesc || "No courses match the selected status filter. Try changing or clearing your filter to view other courses.")
                    : (mc.noFilteredClassesDesc || "No classes match the selected status filter. Try changing or clearing your filter to view other classes."))
                  : (isCoursesTab
                    ? (mc.noCoursesDesc || "You haven't created any courses yet. Create your first course to structure modules, upload materials, and manage classes.")
                    : (mc.noClassesDesc || "You don't have any active classes right now. Create a class to schedule live sessions, track attendance, and assign coursework."))
              }
              isFiltered={statusFilter !== "all"}
              onResetFilter={statusFilter !== "all" ? () => setStatusFilter("all") : undefined}
              resetFilterLabel={mc.resetFilter || "Reset Filter"}
              action={
                statusFilter === "all" ? (
                  <button
                    type="button"
                    onClick={() => navigate(isCoursesTab ? "/workspace/courses/create" : "/workspace/classes/create-class")}
                    className="h-9 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>
                      {isCoursesTab ? (c.createCourse?.title || "Create Course") : (c.createClass?.createClass || "Create Class")}
                    </span>
                  </button>
                ) : null
              }
            />
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {filteredDisplayList.map((item) => (
                <CourseManagementCard
                  key={item.id}
                  item={item}
                  type={isCoursesTab ? "course" : "class"}
                  viewMode={viewMode}
                  labels={isCoursesTab ? courseCardLabels : classCardLabels}
                  onOpen={() => navigate(
                    isCoursesTab
                      ? `/workspace/courses/details/${encodeURIComponent(String(item.id))}`
                      : `/workspace/courses/class/${encodeURIComponent(String(item.id))}`,
                  )}
                  onEdit={() => navigate(
                    isCoursesTab
                      ? `/workspace/courses/edit/${encodeURIComponent(String(item.id))}`
                      : `/workspace/courses/edit-class/${encodeURIComponent(String(item.id))}`,
                  )}
                  onDelete={() => {
                    if (isCoursesTab) {
                      deleteCourseHelper.setTargetId(item.id)
                    } else {
                      setClassDeleteTarget({
                        id: item.id,
                        courseId: item.courseId,
                      })
                    }
                  }}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}

          {filteredDisplayList.length > 0 && (
            <button
              type="button"
              onClick={() => navigate(isCoursesTab ? "/workspace/courses/all" : "/workspace/classes/all-classes")}
              className="text-sm font-semibold text-[#b20a1c] hover:underline self-center py-4 cursor-pointer"
            >
              {c.myCourses?.viewAll || "Xem tất cả"}
            </button>
          )}
        </div>
      )}

      {/* ─── Modals ─── */}
      <ConfirmationModal
        open={deleteCourseHelper.isOpen}
        onClose={() => {
          if (deleteCourseHelper.isDeleting) return
          deleteCourseHelper.handleCancel()
        }}
        onConfirm={deleteCourseHelper.handleConfirm}
        isPending={deleteCourseHelper.isDeleting}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />

      <ConfirmationModal
        open={Boolean(classDeleteTarget)}
        onClose={handleCloseClassDeleteModal}
        onConfirm={handleConfirmClassDelete}
        isPending={isDeletingClass}
        title={c.createClass?.deleteClass || "Delete Class"}
        message={c.createClass?.confirmDeleteClassMsg || "Are you sure you want to delete this class?"}
        confirmText={c.createClass?.deleteConfirmButton || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default MyCoursesPage
