import React, { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, User } from "lucide-react"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import Dropdown from "@/shared/components/ui/Dropdown"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import FluentCard from "@/shared/components/ui/FluentCard"
import {
  formatCurrency,
  formatVoucherDate,
} from "../../utils/voucherTransforms"
import { useLanguage } from "@/shared/context/LanguageContext"

// User Avatar with initials fallback (e.g. "NT" for "Nguyễn Văn A")
const UserAvatar = ({ name = "", avatarUrl = "" }) => {
  const getInitials = (fullName) => {
    if (!fullName) return "U"
    const parts = fullName.trim().split(" ")
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase()
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
      />
    )
  }

  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-border flex items-center justify-center text-xs font-bold shrink-0">
      {getInitials(name)}
    </div>
  )
}

/**
 * VoucherUsagesTable - Bảng Lịch sử sử dụng & Phân trang
 * Specification 6 & 7.
 */
const VoucherUsagesTable = ({
  usages = [],
  isLoading = false,
  totalItemsCount,
}) => {
  const { t } = useLanguage()
  const vu = t?.vouchers?.usages || {}
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // all | Success | Pending | Cancelled
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Status Filter Options for Dropdown
  const statusOptions = useMemo(
    () => [
      { value: "all", label: vu.allStatuses || "Tất cả trạng thái" },
      { value: "Success", label: vu.orderStatusSuccess || "Thành công" },
      {
        value: "Pending",
        label:
          vu.orderStatusWaitingPayment ||
          vu.orderStatusPending ||
          "Chờ thanh toán",
      },
      { value: "Cancelled", label: vu.orderStatusCancelled || "Đã hủy" },
    ],
    [vu],
  )

  // Status Badge Helper
  const renderUsageStatusBadge = (status) => {
    const normalized = String(status || "").toLowerCase()
    if (
      normalized === "success" ||
      normalized === "2" ||
      normalized === "thành công"
    ) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wide">
          {vu.orderStatusSuccess?.toUpperCase() || "THÀNH CÔNG"}
        </span>
      )
    }
    if (
      normalized === "pending" ||
      normalized === "1" ||
      normalized === "chờ thanh toán" ||
      normalized === "đang xử lý"
    ) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 tracking-wide">
          {vu.orderStatusWaitingPayment?.toUpperCase() ||
            vu.orderStatusPending?.toUpperCase() ||
            "CHỜ THANH TOÁN"}
        </span>
      )
    }
    if (
      normalized === "cancelled" ||
      normalized === "canceled" ||
      normalized === "3" ||
      normalized === "đã hủy"
    ) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 tracking-wide">
          {vu.orderStatusCancelled?.toUpperCase() || "ĐÃ HỦY"}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
        {status}
      </span>
    )
  }

  // Filter usages client-side if full list is passed
  const filteredUsages = useMemo(() => {
    return usages.filter((item) => {
      // 1. Search filter by user name or email
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchName = item.userName?.toLowerCase().includes(query)
        const matchEmail = item.userEmail?.toLowerCase().includes(query)
        const matchClass = item.className?.toLowerCase().includes(query)
        if (!matchName && !matchEmail && !matchClass) return false
      }

      // 2. Status filter
      if (statusFilter !== "all") {
        const itemStatus = String(item.status || "").toLowerCase()
        const filterNormalized = statusFilter.toLowerCase()
        if (
          filterNormalized === "success" &&
          !itemStatus.includes("success") &&
          itemStatus !== "2" &&
          itemStatus !== "thành công"
        ) {
          return false
        }
        if (
          filterNormalized === "pending" &&
          !itemStatus.includes("pending") &&
          itemStatus !== "1" &&
          !itemStatus.includes("chờ")
        ) {
          return false
        }
        if (
          filterNormalized === "cancelled" &&
          !itemStatus.includes("cancel") &&
          itemStatus !== "3" &&
          !itemStatus.includes("hủy")
        ) {
          return false
        }
      }

      return true
    })
  }, [usages, searchTerm, statusFilter])

  const totalCount = totalItemsCount || filteredUsages.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsages.slice(start, start + pageSize)
  }, [filteredUsages, currentPage, pageSize])

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalCount)

  // Generate pagination page numbers matching IconButton styling
  const renderPaginationButtons = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage, "...", totalPages)
      }
    }

    return pages.map((p, idx) => {
      if (p === "...") {
        return (
          <span
            key={`ellipsis-${idx}`}
            className="px-1 text-sm text-slate-400 font-semibold select-none shrink-0"
          >
            …
          </span>
        )
      }

      const isActive = p === currentPage
      return (
        <IconButton
          key={`page-${p}`}
          size="sm"
          variant={isActive ? "primary" : "ghost"}
          onClick={() => setCurrentPage(p)}
          title={`Trang ${p}`}
        >
          <span className="text-sm font-semibold">{p}</span>
        </IconButton>
      )
    })
  }

  const paginationShowingText = vu.showingResults
    ? vu.showingResults
        .replace("{{start}}", startRecord)
        .replace("{{end}}", endRecord)
        .replace("{{total}}", totalCount)
    : `Hiển thị ${startRecord} đến ${endRecord} trong ${totalCount} kết quả`

  return (
    <FluentCard className="space-y-4">
      {/* ─── Header: Title & Search/Filter ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h4 className="font-bold">{vu.title || "Lịch sử sử dụng"}</h4>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val)
                setCurrentPage(1)
              }}
              placeholder={vu.searchUserPlaceholder || "Tìm người dùng..."}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="w-full sm:w-auto">
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val)
                setCurrentPage(1)
              }}
              placeholder={vu.allStatuses || "Tất cả trạng thái"}
              triggerClassName="w-full sm:!min-w-[160px] text-xs"
              dropdownClassName="min-w-[170px]"
            />
          </div>
        </div>
      </div>

      {/* ─── Table Content ─── */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-sm sm:text-base">
          <thead>
            <tr className="text-xs uppercase tracking-wider font-bold text-secondary border-b border-border">
              <th className="py-3 px-3 w-[18%] font-semibold">
                {vu.timeHeader || "THỜI GIAN"}
              </th>
              <th className="py-3 px-3 w-[26%] font-semibold">
                {vu.userHeader || "NGƯỜI DÙNG"}
              </th>
              <th className="py-3 px-3 w-[24%] font-semibold">
                {vu.classHeader || "LỚP HỌC"}
              </th>
              <th className="py-3 px-3 w-[16%] font-semibold">
                {vu.discountHeader || "SỐ TIỀN GIẢM"}
              </th>
              <th className="py-3 px-3 w-[16%] text-center font-semibold">
                {vu.statusHeader || "TRẠNG THÁI"}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  {vu.loading || "Đang tải lịch sử sử dụng..."}
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4">
                  <EmptyState
                    variant="component"
                    icon={User}
                    title={
                      vu.noUsagesFound ||
                      "Không tìm thấy lịch sử sử dụng phù hợp."
                    }
                  />
                </td>
              </tr>
            ) : (
              paginatedItems.map((usage, idx) => (
                <tr
                  key={usage.id || `usage-${idx}`}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Thời gian */}
                  <td className="py-4 px-3 text-slate-600 text-sm whitespace-nowrap">
                    {formatVoucherDate(usage.usedAt || usage.createdAt, true)}
                  </td>

                  {/* Người dùng */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={
                          usage.userName || vu.studentFallback || "Học viên"
                        }
                        avatarUrl={usage.userAvatar}
                      />
                      <span className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-[200px]">
                        {usage.userName || vu.studentFallback || "Học viên"}
                      </span>
                    </div>
                  </td>

                  {/* Lớp học */}
                  <td className="py-4 px-3 text-slate-700 font-medium">
                    <span className="truncate block max-w-[180px] sm:max-w-[240px]">
                      {usage.className || `Lớp học #${usage.classId || 1}`}
                    </span>
                  </td>

                  {/* Số tiền giảm */}
                  <td className="py-4 px-3 font-bold text-cath-red-700 whitespace-nowrap">
                    {formatCurrency(usage.discountAmount || 0)}
                  </td>

                  {/* Trạng thái */}
                  <td className="py-4 px-3 text-center whitespace-nowrap">
                    {renderUsageStatusBadge(usage.status || usage.orderStatus)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Footer Pagination ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border text-sm text-secondary">
        <div>{paginationShowingText}</div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Prev Page Button */}
            <IconButton
              size="sm"
              variant="ghost"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title="Trang trước"
            >
              <ChevronLeft />
            </IconButton>

            {/* Numeric Page Buttons */}
            {renderPaginationButtons()}

            {/* Next Page Button */}
            <IconButton
              size="sm"
              variant="ghost"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title="Trang sau"
            >
              <ChevronRight />
            </IconButton>
          </div>
        )}
      </div>
    </FluentCard>
  )
}

export default VoucherUsagesTable
