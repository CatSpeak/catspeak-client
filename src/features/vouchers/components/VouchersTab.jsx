import React, { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { useGetVouchersQuery } from "../api/vouchersApi"
import { useGetCourseDetailQuery } from "@/store/api/coursesApi"
import VoucherTable from "./VoucherTable"
import VoucherTableSkeleton from "./VoucherTableSkeleton"
import VoucherUsagesModal from "./VoucherUsagesModal"
import {
  SingleClassVoucherNoticeModal,
  NoClassesWarningModal,
} from "./CourseVoucherNoticeModal"
import Banner from "@/shared/components/ui/Banner"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { SearchInput } from "@/shared/components/ui/inputs"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * VouchersTab - Tab "Ưu đãi" for Class Detail and Course Detail pages (Requirement 2.1).
 * Displays list of vouchers applied to this class/course with revenue warning banner and direct creation.
 *
 * @param {string} scope - "class" | "course" (optional, auto-inferred from props)
 * @param {string|number} classId - ID of the class (when scope === "class")
 * @param {string|number} courseId - ID of the course (when scope === "course")
 * @param {string|number} targetId - Generic ID if passed alongside scope
 * @param {string} title - Section title (default: "Ưu đãi lớp học" or "Ưu đãi khóa học")
 */
const VouchersTab = ({
  scope = "class",
  classId,
  courseId,
  targetId,
  title,
}) => {
  const { t } = useLanguage()
  const vt = t.vouchers || {}
  const navigate = useNavigate()
  const [selectedVoucherForUsages, setSelectedVoucherForUsages] = useState(null)
  const [showSingleClassNoticeModal, setShowSingleClassNoticeModal] =
    useState(false)
  const [showNoClassesModal, setShowNoClassesModal] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [discountTypeFilter, setDiscountTypeFilter] = useState("all")

  const statusOptions = useMemo(
    () => [
      { value: "all", label: vt.allStatuses || "Tất cả trạng thái" },
      { value: "Active", label: vt.status?.Active || "Đang hoạt động" },
      { value: "Draft", label: vt.status?.Draft || "Bản nháp" },
      {
        value: "PendingDeposit",
        label: vt.status?.PendingDeposit || "Chờ đặt cọc",
      },
      {
        value: "PendingApproval",
        label: vt.status?.PendingApproval || "Chờ duyệt",
      },
      { value: "Expired", label: vt.status?.Expired || "Hết hạn" },
      { value: "Disabled", label: vt.status?.Disabled || "Vô hiệu hóa" },
    ],
    [vt],
  )

  const discountTypeOptions = useMemo(
    () => [
      { value: "all", label: vt.allDiscountTypes || "Tất cả loại" },
      { value: "Percentage", label: vt.table?.percent || "Phần trăm (%)" },
      { value: "FixedAmount", label: vt.table?.fixed || "Số tiền cố định (₫)" },
    ],
    [vt],
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  // Resolve active scope and ID
  const effectiveScope = classId ? "class" : courseId ? "course" : scope
  const effectiveClassId =
    classId || (effectiveScope === "class" ? targetId : null)
  const effectiveCourseId =
    courseId || (effectiveScope === "course" ? targetId : null)

  // Helper to extract IDs as strings from array of objects or IDs
  const getEntityIds = (list) => {
    if (!Array.isArray(list)) return []
    return list
      .map((item) => {
        if (item === null || item === undefined) return null
        if (typeof item === "object") return String(item.id ?? item._id ?? "")
        return String(item)
      })
      .filter(Boolean)
  }

  // Query params with courseId / classId filter from backend
  const queryParams = useMemo(
    () => ({
      page: 1,
      pageSize: 100,
      sponsorType: "Instructor",
      courseId: effectiveCourseId ? Number(effectiveCourseId) : undefined,
      classId: effectiveClassId ? Number(effectiveClassId) : undefined,
    }),
    [effectiveCourseId, effectiveClassId],
  )

  const {
    data: vouchersResponse,
    isLoading,
    isFetching,
  } = useGetVouchersQuery(queryParams)

  const rawList = vouchersResponse?.data || []

  // Instant in-memory client-side filter (Search, Status, DiscountType)
  const vouchersList = useMemo(() => {
    return rawList.filter((v) => {
      // 1. Search keyword filter
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.trim().toLowerCase()
        const codeMatch = (v.code || "").toLowerCase().includes(query)
        const titleMatch = (v.title || "").toLowerCase().includes(query)
        if (!codeMatch && !titleMatch) return false
      }

      // 2. Status filter
      if (statusFilter !== "all") {
        if (
          v.status !== statusFilter &&
          String(v.status) !== String(statusFilter)
        ) {
          return false
        }
      }

      // 3. Discount Type filter
      if (discountTypeFilter !== "all") {
        if (
          v.discountType !== discountTypeFilter &&
          String(v.discountType) !== String(discountTypeFilter)
        ) {
          return false
        }
      }

      return true
    })
  }, [
    rawList,
    debouncedSearch,
    statusFilter,
    discountTypeFilter,
  ])

  const { data: courseDetailData } = useGetCourseDetailQuery(
    effectiveCourseId,
    {
      skip: !effectiveCourseId,
    },
  )
  const courseClasses = useMemo(() => {
    const raw = courseDetailData?.data || courseDetailData
    return raw?.classes || []
  }, [courseDetailData])

  const courseName = useMemo(() => {
    const raw = courseDetailData?.data || courseDetailData
    return raw?.name || raw?.title || ""
  }, [courseDetailData])

  // Handle navigate to Create Voucher with class/course pre-selected
  const handleCreateVoucher = () => {
    if (
      effectiveScope === "course" ||
      (!effectiveClassId && effectiveCourseId)
    ) {
      const classList = courseClasses || []
      if (classList.length === 0) {
        setShowNoClassesModal(true)
        return
      }
      if (classList.length === 1) {
        setShowSingleClassNoticeModal(true)
        return
      }
      navigate(
        `/workspace/vouchers/create?courseId=${effectiveCourseId}&courseName=${encodeURIComponent(courseName)}`,
      )
      return
    }

    // Class context
    const params = new URLSearchParams()
    if (effectiveClassId) params.set("classId", String(effectiveClassId))
    if (effectiveCourseId) params.set("courseId", String(effectiveCourseId))
    const query = params.toString()
    navigate(`/workspace/vouchers/create${query ? `?${query}` : ""}`)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ─── Revenue Warning Alert Banner (BR-VC-GV-17 & Wireframe 1) ─── */}
      <Banner variant="info">
        {vt.tabBanner ||
          "Voucher do bạn tạo sẽ được trừ vào doanh thu của bạn. Nền tảng vẫn thu 10% trên học phí gốc."}
      </Banner>

      {/* ─── Actions & Filters Bar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
          <div className="w-full sm:w-60">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={vt.searchPlaceholder || "Tìm theo mã hoặc tên..."}
            />
          </div>

          <div className="w-full sm:w-auto">
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={vt.allStatuses || "Tất cả trạng thái"}
              triggerClassName="w-full sm:!min-w-[150px] text-xs"
              dropdownClassName="min-w-[170px]"
            />
          </div>

          <div className="w-full sm:w-auto">
            <Dropdown
              options={discountTypeOptions}
              value={discountTypeFilter}
              onChange={setDiscountTypeFilter}
              placeholder={vt.allDiscountTypes || "Tất cả loại"}
              triggerClassName="w-full sm:!min-w-[130px] text-xs"
              dropdownClassName="min-w-[160px]"
            />
          </div>
        </div>

        <PillButton onClick={handleCreateVoucher} startIcon={<Plus />}>
          {vt.createVoucher || "Tạo voucher mới"}
        </PillButton>
      </div>

      {/* ─── Table Content ─── */}
      {isLoading ? (
        <VoucherTableSkeleton rows={5} />
      ) : (
        <VoucherTable
          vouchers={vouchersList}
          isLoading={isLoading || isFetching}
          onViewDetails={(v) => navigate(`/workspace/vouchers/${v.id}`)}
          onViewUsages={(v) => setSelectedVoucherForUsages(v)}
          onEditDraft={(v) => navigate(`/workspace/vouchers/edit/${v.id}`)}
        />
      )}

      {/* ─── Usages History Modal ─── */}
      {selectedVoucherForUsages && (
        <VoucherUsagesModal
          voucher={selectedVoucherForUsages}
          onClose={() => setSelectedVoucherForUsages(null)}
        />
      )}

      {/* ─── Modal: Single-Class Course Notice ─── */}
      <SingleClassVoucherNoticeModal
        open={showSingleClassNoticeModal}
        onClose={() => setShowSingleClassNoticeModal(false)}
        courseId={effectiveCourseId}
        courseName={courseName}
        courseClasses={courseClasses}
      />

      {/* ─── Modal: No Classes in Course Warning ─── */}
      <NoClassesWarningModal
        open={showNoClassesModal}
        onClose={() => setShowNoClassesModal(false)}
        courseId={effectiveCourseId}
        courseName={courseName}
      />
    </div>
  )
}

export default VouchersTab
