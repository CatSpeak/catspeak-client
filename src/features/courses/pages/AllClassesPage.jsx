import React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useGetAllClassesQuery } from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { Breadcrumb, Pagination, Tabs } from "@/shared/components/ui/navigation"
import ClassTable from "../components/ClassTable"
import CourseTablePageHeader from "../components/CourseTablePageHeader"
import { usePaginatedSearch } from "../hooks/usePaginatedSearch"
import { mapClassTableRow } from "../utils/courseTransforms"
import { useTimezone } from "@/shared/hooks/useTimezone"

const AllClassesPage = () => {
  const { t } = useLanguage()
  const { formatDate, formatScheduleTime, formatScheduleDays } = useTimezone()
  const c = t.courses || {}
  const ac = c.allClasses || {}
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
  } = useGetAllClassesQuery({
    search: debouncedSearchQuery,
    status: activeTab === "all" ? "" : activeTab.toUpperCase(),
    page: currentPage,
    pageSize: 5,
  })

  const classes = (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))
    .map((cls, index) => mapClassTableRow(
      cls,
      index,
      {
        studentsRatio: ac.studentsRatio,
        free: c.free || "Miễn phí",
        tba: c.workspaceUi?.tba,
      },
      formatDate,
      formatScheduleTime,
      formatScheduleDays,
    ))
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
    { value: "not_started", label: ac.tabNotStarted || "Coming Soon" },
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
          {ac.refreshing || "Refreshing classes"}
        </span>
      )}
      <Breadcrumb
        items={[
          { label: c.title || "Khóa học của tôi", onClick: () => navigate("/workspace/courses") },
          { label: ac.tabAll || "All Classes" },
        ]}
      />

      <CourseTablePageHeader
        title={ac.title || "All Classes"}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={ac.searchPlaceholder || "Search..."}
        createLabel={c.createClass?.createClass || "Create Class"}
        onCreate={() => navigate("/workspace/classes/create-class")}
      />

      <div className="w-full overflow-x-auto scrollbar-hidden -mb-2">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          fullWidth={false}
          className="min-w-max border-b border-border"
        />
      </div>

      {error && data !== undefined && (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          {ac.refreshFailed || "The latest class data could not be loaded. The displayed list may be out of date."}
        </div>
      )}

      {isInitialLoading ? (
        <LoadingSpinner className="flex justify-center items-center py-12" />
      ) : error && data === undefined ? (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
          <span>{ac.loadFailed || "Classes could not be loaded. Please try again."}</span>
          <button type="button" onClick={refetch} className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white">
            {ac.retry || "Try again"}
          </button>
        </div>
      ) : classes.length > 0 ? (
        <div className="flex flex-col gap-2">
          <ClassTable
            classes={classes}
            t={t}
            onEdit={(item) => navigate(`/workspace/courses/edit-class/${encodeURIComponent(String(item.id))}`)}
          />

          <Pagination
            page={currentPage}
            totalPages={pagination.totalPages}
            onChangePage={setCurrentPage}
          />
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-dashed border-border">
          {ac.noResults || "No classes found."}
        </div>
      )}
    </div>
  )
}

export default AllClassesPage
