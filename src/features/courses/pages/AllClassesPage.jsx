import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"

import { useGetAllClassesQuery } from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

import ClassTable from "../components/ClassTable"
import CourseTablePageHeader from "../components/CourseTablePageHeader"
import CourseTabs from "../components/CourseTabs"
import TablePagination from "../components/shared/TablePagination"
import { mapClassTableRow } from "../utils/courseTransforms"

const AllClassesPage = () => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const ac = c.allClasses || {}
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setCurrentPage(1)
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [searchQuery])

  const { data, isLoading, error } = useGetAllClassesQuery({
    search: debouncedSearchQuery,
    status: activeTab === "all" ? "" : activeTab.toUpperCase(),
    page: currentPage,
    pageSize: 5,
  })

  const classes = (data?.data || []).map((cls, index) => mapClassTableRow(cls, index, ac))
  const pagination = data?.pagination || { page: 1, pageSize: 5, totalItems: 0, totalPages: 1 }
  const tabs = [
    { value: "all", label: ac.tabAll || "All" },
    { value: "teaching", label: ac.tabTeaching || "Teaching" },
    { value: "open", label: ac.tabOpen || "Open Enrollment" },
    { value: "archived", label: ac.tabArchived || "Archived" },
  ]

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
  }

  const handleAction = () => {
    toast.success("Tinh nang dang phat trien")
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Home", onClick: () => navigate("/workspace") },
          { label: c.title || "My Courses", onClick: () => navigate("/workspace/courses") },
          { label: ac.title || "All Classes" },
        ]}
      />

      <CourseTablePageHeader
        title={ac.title || "All Classes"}
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder={ac.searchPlaceholder || "Search..."}
        createLabel={c.createClass?.createClass || "Create Class"}
        onCreate={() => navigate("/workspace/courses/create-class")}
      />

      <CourseTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        className="gap-6 border-b border-gray-100 pb-px"
      />

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
