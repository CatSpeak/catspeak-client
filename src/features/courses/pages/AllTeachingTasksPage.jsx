import React, { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Breadcrumb, Tabs } from "@/shared/components/ui/navigation"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useGetTeacherAllTeachingTasksCombinedQuery } from "@/store/api/coursesApi"
import TeachingTasksTable from "../components/assignments/TeachingTasksTable"
import { defaultCourseThumbnail } from "../utils/courseUtils"

import Pagination from "@/shared/components/ui/navigation/Pagination"

const AllTeachingTasksPage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "urgent"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = 10

  const {
    currentData: pagedResult,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTeacherAllTeachingTasksCombinedQuery({
    page,
    limit,
    status: activeTab,
  })

  const data = pagedResult?.items || []
  const totalPages = pagedResult?.totalPages || 0

  const tasks = useMemo(() => {
    return Array.isArray(data) ? data : []
  }, [data])

  const tabs = [
    { value: "urgent", label: c.taskTabUrgent || "Urgent" },
    { value: "required", label: c.taskTabRequired || "Required" },
    { value: "later", label: c.taskTabLater || "Later" },
  ]

  const handleTabChange = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("tab", tab)
      next.set("page", "1") // Reset to page 1 on tab change
      return next
    })
  }

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("page", newPage.toString())
      return next
    })
  }

  const isInitialLoading = isLoading || (isFetching && data === undefined)

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] dark:text-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">
          {c.allTeachingTasksTitle || "Việc giảng dạy"}
        </h1>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hidden -mb-2 mt-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          fullWidth={true}
          className="min-w-max border-b border-border dark:border-[#3F3F3F]"
        />
      </div>

      {isInitialLoading ? (
        <LoadingSpinner className="flex justify-center items-center py-12" />
      ) : error ? (
        <div role="alert" className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
          <span>{c.taskLoadError || "Failed to load teaching tasks. Please try again."}</span>
          <button type="button" onClick={refetch} className="rounded-xl bg-[#990011] dark:bg-[#FF6B6B] hover:bg-[#80000e] dark:hover:bg-[#ff8585] px-4 py-2 text-xs font-bold text-white dark:text-[#1A1A1A]">
            {c.taskRetry || "Try again"}
          </button>
        </div>
      ) : tasks.length > 0 ? (
        <div className="flex flex-col gap-2 mt-4">
          <TeachingTasksTable tasks={tasks} defaultCourseThumbnail={defaultCourseThumbnail} />
          {totalPages > 1 && (
            <div className="mt-4 px-2">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChangePage={handlePageChange}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-500 font-semibold bg-gray-50/50 dark:bg-[#1A1A1A] rounded-2xl border border-dashed border-border dark:border-[#3F3F3F] mt-4">
          {c.taskNoResults || "No tasks found."}
        </div>
      )}
    </div>
  )
}

export default AllTeachingTasksPage
