import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import { Plus, Search } from "lucide-react"
import ClassTable from "../components/ClassTable"
import TablePagination from "../components/TablePagination"

import { useGetAllClassesQuery } from "@/store/api/coursesApi"
import { formatCurrencyVND, getCourseGradientAndIcon, formatUTCDate } from "../utils/courseUtils"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const AllClassesPage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const navigate = useNavigate()

  // Local state
  const [activeTab, setActiveTab] = useState("all") // "all", "teaching", "open", "archived"
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const ac = c.allClasses || {}

  // Handlers
  const handleCreateClass = () => {
    navigate("/workspace/courses/create-class")
  }

  const handleAction = () => {
    toast.success("Tính năng đang phát triển")
  }

  // Fetch paginated, filtered classes
  const { data, isLoading, error } = useGetAllClassesQuery({
    search: searchQuery,
    status: activeTab === "all" ? "" : activeTab.toUpperCase(),
    page: currentPage,
    pageSize: 5
  })

  const classesRaw = data?.data || []
  const pagination = data?.pagination || { page: 1, pageSize: 5, totalItems: 0, totalPages: 1 }

  // Map response items to format expected by ClassTable
  const classes = classesRaw.map((cls, index) => {
    const { gradient, icon } = getCourseGradientAndIcon(index)
    const progress = cls.totalSessions ? Math.round((cls.completedSessions / cls.totalSessions) * 100) : 0
    return {
      id: cls.id,
      courseTitle: cls.courseTitle || "N/A",
      classTitle: cls.title,
      status: cls.status,
      schedule: cls.schedule?.days?.join(", ") || "TBA",
      students: (ac.studentsRatio || "{{enrolled}} / {{slots}} students")
        .replace("{{enrolled}}", cls.enrolledStudents)
        .replace("{{slots}}", cls.slots),
      time: cls.schedule ? `${cls.schedule.startTime} - ${cls.schedule.endTime}` : "TBA",
      progress,
      startDate: formatUTCDate(cls.startDate, "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      endDate: formatUTCDate(cls.endDate, "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      price: formatCurrencyVND(cls.tuitionFee),
      icon,
      gradient,
      thumbnailUrl: cls.thumbnailUrl
    }
  })


  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumb ─── */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
          { label: c.title || "Khóa học của tôi", onClick: () => navigate("/workspace/courses") },
          { label: ac.title || "Toàn bộ lớp học" }
        ]}
      />

      {/* ─── Header & Search Section ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">
          {ac.title || "Toàn bộ lớp học"}
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
            onClick={handleCreateClass}
            className="flex items-center justify-center gap-2 bg-[#990011] hover:bg-[#80000e] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm active:scale-95 w-full sm:w-auto flex-shrink-0"
          >
            <Plus size={16} />
            <span>{c.createClass?.createClass || "Tạo lớp học"}</span>
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
          Error loading classes: {error.message || "Unknown error"}
        </div>
      ) : classes.length > 0 ? (
        <div className="flex flex-col gap-2">
          <ClassTable
            classes={classes}
            t={t}
            handleAction={handleAction}
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
          No classes found.
        </div>
      )}

    </div>
  )
}

export default AllClassesPage
