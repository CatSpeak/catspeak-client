import React, { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Breadcrumb, Tabs } from "@/shared/components/ui/navigation"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useGetTeacherAllTeachingTasksCombinedQuery } from "@/store/api/coursesApi"
import TeachingTasksTable from "../components/assignments/TeachingTasksTable"
import { defaultCourseThumbnail } from "../utils/courseUtils"

const AllTeachingTasksPage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "urgent"

  const {
    currentData: data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetTeacherAllTeachingTasksCombinedQuery()

  // const data = [
  //   {
  //     taskType: "Grading",
  //     assignmentId: 125,
  //     quizId: null,
  //     taskName: "Chấm bài nộp",
  //     classId: 10,
  //     className: "Lớp Toán 10A1",
  //     courseId: 3,
  //     pendingCount: 12,
  //     status: "Urgent",
  //     daysSinceDue: 0,
  //     createdAt: "2026-08-22T08:30:00Z"
  //   },
  //   {
  //     taskType: "Grading",
  //     assignmentId: 126,
  //     quizId: null,
  //     taskName: "Chấm bài nộp",
  //     classId: 11,
  //     className: "Lớp Toán 10A2",
  //     courseId: 3,
  //     pendingCount: 5,
  //     status: "Required",
  //     daysSinceDue: 1,
  //     createdAt: "2026-08-21T10:00:00Z"
  //   },
  //   {
  //     taskType: "QuizGrading",
  //     assignmentId: null,
  //     quizId: 48,
  //     taskName: "Chấm bài kiểm tra",
  //     classId: 12,
  //     className: "Lớp Toán 10A3",
  //     courseId: 3,
  //     pendingCount: 8,
  //     status: "Later",
  //     daysSinceDue: 0,
  //     createdAt: "2026-08-20T14:15:00Z"
  //   }
  // ]

  // const isLoading = false
  // const isFetching = false
  // const error = null
  // const refetch = () => {}

  const tasks = useMemo(() => {
    const rawTasks = Array.isArray(data) ? data : []
    // Filter logic based on tab status
    return rawTasks.filter(task => {
      const taskStatus = (task.status || "").toLowerCase()
      if (activeTab === "urgent") return taskStatus === "urgent"
      if (activeTab === "required") return taskStatus === "required"
      if (activeTab === "later") return taskStatus === "later"
      return true
    })
  }, [data, activeTab])

  const tabs = [
    { value: "urgent", label: c.taskTabUrgent || "Urgent" },
    { value: "required", label: c.taskTabRequired || "Required" },
    { value: "later", label: c.taskTabLater || "Later" },
  ]

  const handleTabChange = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("tab", tab)
      return next
    })
  }

  const isInitialLoading = isLoading || (isFetching && data === undefined)

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
          { label: c.myCoursesTab || "Khóa học của tôi", onClick: () => navigate("/workspace/courses") },
          { label: c.allTeachingTasksTitle || "Việc giảng dạy" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {c.allTeachingTasksTitle || "Việc giảng dạy"}
        </h1>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hidden -mb-2 mt-4">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          fullWidth={true}
          className="min-w-max border-b border-border"
        />
      </div>

      {isInitialLoading ? (
        <LoadingSpinner className="flex justify-center items-center py-12" />
      ) : error ? (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
          <span>{c.taskLoadError || "Failed to load teaching tasks. Please try again."}</span>
          <button type="button" onClick={refetch} className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white">
            {c.taskRetry || "Try again"}
          </button>
        </div>
      ) : tasks.length > 0 ? (
        <div className="flex flex-col gap-2 mt-4">
          <TeachingTasksTable tasks={tasks} defaultCourseThumbnail={defaultCourseThumbnail} />
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-dashed border-border mt-4">
          {c.taskNoResults || "No tasks found."}
        </div>
      )}
    </div>
  )
}

export default AllTeachingTasksPage
