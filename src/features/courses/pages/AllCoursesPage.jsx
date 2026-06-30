import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Plus, Search } from "lucide-react"
import CourseTable from "../components/CourseTable"
import TablePagination from "../components/TablePagination"

import { useGetAllCoursesQuery } from "@/store/api/coursesApi"
import { formatCurrencyVND, getCourseGradientAndIcon, formatUTCDate } from "../utils/courseUtils"
import { useDeleteCourse } from "../hooks/useDeleteCourse"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const AllCoursesPage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const navigate = useNavigate()

  // Local state
  const [activeTab, setActiveTab] = useState("all") // "all", "teaching", "open", "archived"
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const ac = c.allCourses || {}

  // Hook for delete course flow
  const deleteHelper = useDeleteCourse(t)

  // Handlers
  const handleCreateCourse = () => {
    navigate("/workspace/courses/create")
  }

  // Fetch paginated, filtered courses
  const { data, isLoading, error } = useGetAllCoursesQuery({
    search: searchQuery,
    status: activeTab === "all" ? "" : activeTab,
    page: currentPage,
    pageSize: 5
  })

  const coursesRaw = data?.data || []
  const pagination = data?.pagination || { page: 1, pageSize: 5, totalItems: 0, totalPages: 1 }

  // Map response items to format expected by CourseTable
  const courses = coursesRaw.map((course, index) => {
    const { gradient, icon } = getCourseGradientAndIcon(index)
    return {
      id: course.id,
      title: course.title,
      classCount: (c.classCount || "{{count}} classes").replace("{{count}}", course.classCount),
      students: (c.studentsCount || "{{count}} students").replace("{{count}}", course.totalStudents),
      progress: course.status === "ARCHIVED" ? 100 : (course.status === "OPEN" ? 0 : 54),
      startDate: formatUTCDate(course.startDate, "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      endDate: formatUTCDate(course.endDate, "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      price: `${formatCurrencyVND(course.priceRange?.min)} - ${formatCurrencyVND(course.priceRange?.max)}`,
      status: course.status,
      icon,
      gradient,
      thumbnailUrl: course.thumbnailUrl
    }
  })


  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumb ─── */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
          { label: c.title || "Khóa học của tôi", onClick: () => navigate("/workspace/courses") },
          { label: ac.title || "Toàn bộ khóa học" }
        ]}
      />

      {/* ─── Header & Search Section ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">
          {ac.title || "Toàn bộ khóa học"}
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={ac.searchPlaceholder || "Search..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full h-10 pl-4 pr-10 bg-[#F2F2F2]/60 hover:bg-[#F2F2F2]/80 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-400"
            />
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateCourse}
            className="flex items-center justify-center gap-2 bg-[#990011] hover:bg-[#80000e] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm active:scale-95 w-full sm:w-auto flex-shrink-0"
          >
            <Plus size={16} />
            <span>{c.createCourse?.title || "Tạo khóa học"}</span>
          </button>
        </div>
      </div>

      {/* ─── Filter Sub-Tabs ─── */}
      <div className="flex gap-6 border-b border-gray-100 pb-px text-sm font-bold text-gray-400">
        <button
          onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
          className={`pb-3 transition-all relative ${activeTab === "all"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {ac.tabAll || "All"}
        </button>
        <button
          onClick={() => { setActiveTab("teaching"); setCurrentPage(1); }}
          className={`pb-3 transition-all relative ${activeTab === "teaching"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {ac.tabTeaching || "Teaching"}
        </button>
        <button
          onClick={() => { setActiveTab("open"); setCurrentPage(1); }}
          className={`pb-3 transition-all relative ${activeTab === "open"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {ac.tabOpen || "Open Enrollment"}
        </button>
        <button
          onClick={() => { setActiveTab("archived"); setCurrentPage(1); }}
          className={`pb-3 transition-all relative ${activeTab === "archived"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {ac.tabArchived || "Archived"}
        </button>
      </div>

      {/* ─── Table View ─── */}
      {isLoading ? (
        <LoadingSpinner className="flex justify-center items-center py-12" />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
          Error loading courses: {error.message || "Unknown error"}
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
          No courses found.
        </div>
      )}

      <ConfirmationModal
        open={deleteHelper.isOpen}
        onClose={deleteHelper.handleCancel}
        onConfirm={deleteHelper.handleConfirm}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default AllCoursesPage
