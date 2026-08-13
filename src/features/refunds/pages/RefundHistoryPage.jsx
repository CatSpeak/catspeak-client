import React, { useState, useMemo } from "react"
import PageTitle from "@/shared/components/ui/PageTitle"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import Dropdown from "@/shared/components/ui/Dropdown"
import { Pagination } from "@/shared/components/ui/navigation"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetRefundHistoryQuery } from "../api/refundsApi"
import RefundHistoryTable from "../components/RefundHistoryTable"
import { REFUND_STATUS } from "../constants/refundConstants"
import { Filter, RefreshCw } from "lucide-react"

const ITEMS_PER_PAGE = 5

export default function RefundHistoryPage() {
  const { t } = useLanguage()
  const refundT = t.refunds || {}

  const { data: refunds = [], isLoading, refetch } = useGetRefundHistoryQuery()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Status dropdown options
  const statusOptions = [
    { value: "all", label: refundT.filterStatusAll || "Tất cả trạng thái" },
    { value: String(REFUND_STATUS.PENDING), label: refundT.statusPending || "Chờ Admin xử lý" },
    { value: String(REFUND_STATUS.APPROVED), label: refundT.statusApproved || "Đã duyệt & Thành công" },
    { value: String(REFUND_STATUS.REJECTED), label: refundT.statusRejected || "Admin từ chối" },
    { value: String(REFUND_STATUS.FAILED), label: refundT.statusFailed || "Lỗi chuyển khoản" },
  ]

  // Filtered refunds
  const filteredRefunds = useMemo(() => {
    return refunds.filter((item) => {
      const searchStr = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !searchQuery ||
        item.paymentId?.toString().toLowerCase().includes(searchStr) ||
        item.refundId?.toString().toLowerCase().includes(searchStr) ||
        item.reason?.toLowerCase().includes(searchStr)

      const matchesStatus =
        statusFilter === "all" || item.status?.toString() === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [refunds, searchQuery, statusFilter])

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE),
  )
  const paginatedRefunds = filteredRefunds.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (opt) => {
    setStatusFilter(opt?.value || "all")
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#E5E5E5] border-t-cath-red-700 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -mx-4 sm:-mx-6 lg:-mx-8 -my-8 px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-70px)]">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageTitle>{refundT.title || "Lịch sử Hoàn tiền"}</PageTitle>
          <p className="text-sm text-gray-500 mt-1">
            {refundT.subtitle || "Theo dõi trạng thái và yêu cầu hoàn tiền cho các giao dịch của bạn."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filters & Table container */}
      <div className="!justify-start gap-6 min-h-[500px]">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
          <div className="w-full sm:w-72">
            <SearchInput
              placeholder={refundT.searchPlaceholder || "Nhập mã đơn hàng hoặc ID..."}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="w-full sm:w-56">
            <Dropdown
              options={statusOptions}
              value={statusOptions.find((opt) => opt.value === statusFilter)}
              onChange={handleStatusFilterChange}
              placeholder={refundT.filterStatusAll || "Tất cả trạng thái"}
              icon={<Filter className="w-4 h-4 text-gray-400" />}
            />
          </div>
        </div>

        {/* Refund Table */}
        <RefundHistoryTable refunds={paginatedRefunds} t={t} />

        {/* Pagination */}
        {filteredRefunds.length > ITEMS_PER_PAGE && (
          <div className="mt-6">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChangePage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
