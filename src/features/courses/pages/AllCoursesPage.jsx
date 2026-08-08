import React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useGetAllCoursesQuery } from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"

import CourseTable from "../components/CourseTable"
import CourseTablePageHeader from "../components/CourseTablePageHeader"
import CourseTabs from "../components/CourseTabs"
import TablePagination from "../components/shared/TablePagination"
import { useDeleteCourse } from "../hooks/useDeleteCourse"
import { usePaginatedSearch } from "../hooks/usePaginatedSearch"
import { mapCourseTableRow } from "../utils/courseTransforms"
import { useTimezone } from "@/shared/hooks/useTimezone"

const AllCoursesPage = () => {
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const c = t.courses || {}
  const ac = c.allCourses || {}
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "all"
  const {
    currentPage,
    debouncedSearchQuery,
    searchQuery,
    setCurrentPage,
    setSearchQuery,
  } = usePaginatedSearch()
  const {
    currentData: data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetAllCoursesQuery({
    search: debouncedSearchQuery,
    status: activeTab === "all" ? "" : activeTab.toUpperCase(),
    page: currentPage,
    pageSize: 5,
  })

  const courses = (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))
    .map((course, index) => mapCourseTableRow(
      course,
      index,
      {
        classCount: c.classCount,
        studentsCount: c.studentsCount,
        tba: c.workspaceUi?.tba,
      },
      formatDate,
    ))
  const deleteHelper = useDeleteCourse(t, () => {
    if (courses.length === 1 && currentPage > 1) {
      setCurrentPage((page) => Math.max(1, page - 1))
    }
  })
  const pagination = data?.pagination || { page: 1, pageSize: 5, totalItems: 0, totalPages: 1 }
  const isInitialLoading = (
    isLoading
    || (isFetching && data === undefined)
  )
  const tabs = [
    { value: "all", label: ac.tabAll || "All" },
    { value: "teaching", label: ac.tabTeaching || "Teaching" },
    { value: "open", label: ac.tabOpen || "Open Enrollment" },
    { value: "archived", label: ac.tabArchived || "Archived" },
  ]

  const handleTabChange = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("tab", tab)
      return next
    })
    setCurrentPage(1)
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {isFetching && !isInitialLoading && (
        <span role="status" className="sr-only">
          {ac.refreshing || "Refreshing courses"}
        </span>
      )}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Home", onClick: () => navigate("/workspace") },
          { label: c.title || "My Courses", onClick: () => navigate("/workspace/courses") },
          { label: ac.title || "All Courses" },
        ]}
      />

      <CourseTablePageHeader
        title={ac.title || "All Courses"}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={ac.searchPlaceholder || "Search..."}
        createLabel={c.createCourse?.title || "Create Course"}
        onCreate={() => navigate("/workspace/courses/create")}
      />

      <CourseTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        className="gap-6 border-b border-gray-100 pb-px"
      />

      {error && data !== undefined && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          {ac.refreshFailed || "The latest course data could not be loaded. The displayed list may be out of date."}
        </div>
      )}

      {isInitialLoading ? (
        <LoadingSpinner className="flex justify-center items-center py-12" />
      ) : error && data === undefined ? (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
          <span>{ac.loadFailed || "Courses could not be loaded. Please try again."}</span>
          <button type="button" onClick={refetch} className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white">
            {ac.retry || "Try again"}
          </button>
        </div>
      ) : courses.length > 0 ? (
        <div className="flex flex-col gap-2">
          <CourseTable
            courses={courses}
            t={t}
            onDelete={(id) => deleteHelper.setTargetId(id)}
          />

          <TablePagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalItems}
            limit={pagination.pageSize}
            onPageChange={setCurrentPage}
            t={t}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          {ac.noResults || "No courses found."}
        </div>
      )}

      <ConfirmationModal
        open={deleteHelper.isOpen}
        onClose={deleteHelper.handleCancel}
        onConfirm={deleteHelper.handleConfirm}
        isPending={deleteHelper.isDeleting}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default AllCoursesPage
