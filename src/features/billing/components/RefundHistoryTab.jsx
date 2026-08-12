import React, { useState, useMemo } from "react"
import { useGetRefundHistoryQuery } from "@/features/refunds/api/refundsApi"
import RefundHistoryTable from "@/features/refunds/components/RefundHistoryTable"
import RefundHistorySkeleton from "./RefundHistorySkeleton"
import { REFUND_STATUS } from "@/features/refunds/constants/refundConstants"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import Dropdown from "@/shared/components/ui/Dropdown"
import { Filter, RefreshCw } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { Pagination } from "@/shared/components/ui/navigation"
import { PillButton } from "@/shared/components/ui/buttons"

const ITEMS_PER_PAGE = 5

export default function RefundHistoryTab({ onRefreshRef }) {
  const { t } = useLanguage()
  const refundT = t.refunds || {}

  const { data: refunds = [], isLoading, refetch } = useGetRefundHistoryQuery()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const statusOptions = [
    { value: "all", label: refundT.filterStatusAll || "Tất cả trạng thái" },
    {
      value: String(REFUND_STATUS.PENDING),
      label: refundT.statusPending || "Chờ xử lý",
    },
    {
      value: String(REFUND_STATUS.APPROVED),
      label: refundT.statusApproved || "Đã duyệt",
    },
    {
      value: String(REFUND_STATUS.REJECTED),
      label: refundT.statusRejected || "Từ chối",
    },
    {
      value: String(REFUND_STATUS.FAILED),
      label: refundT.statusFailed || "Thất bại",
    },
  ]

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE),
  )
  const paginatedRefunds = filteredRefunds.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  if (isLoading) {
    return <RefundHistorySkeleton />
  }

  return (
    <div className="!justify-start gap-6 min-h-[500px]">
      {/* Refund Filters & Refresh Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="w-full sm:max-w-sm">
            <SearchInput
              placeholder={
                refundT.searchPlaceholder || "Nhập mã đơn hàng hoặc ID..."
              }
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
            />
          </div>

          <div className="w-full sm:w-auto">
            <Dropdown
              options={statusOptions}
              value={statusOptions.find((opt) => opt.value === statusFilter)}
              onChange={(opt) => {
                setStatusFilter(opt?.value || "all")
                setCurrentPage(1)
              }}
              placeholder={refundT.filterStatusAll || "Tất cả trạng thái"}
              triggerClassName="w-full sm:!min-w-[160px] text-sm"
              dropdownClassName="min-w-[180px]"
              icon={<Filter className="w-4 h-4 text-gray-400" />}
            />
          </div>
        </div>

        <PillButton
          variant="secondary"
          onClick={() => refetch()}
          startIcon={<RefreshCw />}
          className="shrink-0 self-start sm:self-auto"
        >
          Làm mới
        </PillButton>
      </div>

      {/* Refund Table */}
      <RefundHistoryTable refunds={paginatedRefunds} t={t} />

      {/* Refund Pagination */}
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
  )
}
