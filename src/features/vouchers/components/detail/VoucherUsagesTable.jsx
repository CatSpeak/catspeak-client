import React, { useState, useMemo } from "react"
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"
import Popover from "@/shared/components/ui/Popover"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import { formatCurrency, formatVoucherDate } from "../../utils/voucherTransforms"

// Status Badge Helper according to specification 6
const renderUsageStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase()
  if (normalized === "success" || normalized === "2" || normalized === "thành công") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 tracking-wide">
        THÀNH CÔNG
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
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 tracking-wide">
        CHỜ THANH TOÁN
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
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 tracking-wide">
        ĐÃ HỦY
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
      {status}
    </span>
  )
}

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
        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
      />
    )
  }

  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // all | Success | Pending | Cancelled
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

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
        if (filterNormalized === "success" && !itemStatus.includes("success") && itemStatus !== "2" && itemStatus !== "thành công") {
          return false
        }
        if (filterNormalized === "pending" && !itemStatus.includes("pending") && itemStatus !== "1" && !itemStatus.includes("chờ")) {
          return false
        }
        if (filterNormalized === "cancelled" && !itemStatus.includes("cancel") && itemStatus !== "3" && !itemStatus.includes("hủy")) {
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

  // Generate pagination page numbers
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
            className="w-8 h-8 flex items-center justify-center text-xs text-slate-400"
          >
            ...
          </span>
        )
      }

      const isActive = p === currentPage
      return (
        <button
          key={`page-${p}`}
          type="button"
          onClick={() => setCurrentPage(p)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isActive
              ? "bg-cath-red-700 text-white shadow-xs"
              : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700"
          }`}
        >
          {p}
        </button>
      )
    })
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-5">
      {/* ─── Header: Title & Search/Filter ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
          Lịch sử sử dụng
        </h3>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm người dùng..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cath-red-500/20 focus:border-cath-red-500 transition-all"
            />
          </div>

          {/* Filter Popover */}
          <Popover
            placement="bottom-right"
            trigger={
              <button
                type="button"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  statusFilter !== "all"
                    ? "border-cath-red-300 bg-cath-red-50 text-cath-red-700 dark:bg-cath-red-950/40"
                    : "border-slate-200 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:text-zinc-400"
                }`}
                title="Lọc trạng thái"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            }
            content={(close) => (
              <MenuList className="w-44 p-1">
                <MenuItem
                  label="Tất cả trạng thái"
                  active={statusFilter === "all"}
                  onClick={() => {
                    setStatusFilter("all")
                    setCurrentPage(1)
                    close()
                  }}
                />
                <MenuItem
                  label="Thành công"
                  active={statusFilter === "Success"}
                  onClick={() => {
                    setStatusFilter("Success")
                    setCurrentPage(1)
                    close()
                  }}
                />
                <MenuItem
                  label="Chờ thanh toán"
                  active={statusFilter === "Pending"}
                  onClick={() => {
                    setStatusFilter("Pending")
                    setCurrentPage(1)
                    close()
                  }}
                />
                <MenuItem
                  label="Đã hủy"
                  active={statusFilter === "Cancelled"}
                  onClick={() => {
                    setStatusFilter("Cancelled")
                    setCurrentPage(1)
                    close()
                  }}
                />
              </MenuList>
            )}
          />
        </div>
      </div>

      {/* ─── Table Content ─── */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800">
              <th className="py-3 px-3 w-[18%] font-semibold">THỜI GIAN</th>
              <th className="py-3 px-3 w-[26%] font-semibold">NGƯỜI DÙNG</th>
              <th className="py-3 px-3 w-[24%] font-semibold">LỚP HỌC</th>
              <th className="py-3 px-3 w-[16%] font-semibold">SỐ TIỀN GIẢM</th>
              <th className="py-3 px-3 w-[16%] text-center font-semibold">TRẠNG THÁI</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Đang tải lịch sử sử dụng...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <User className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    Không tìm thấy lịch sử sử dụng phù hợp.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedItems.map((usage, idx) => (
                <tr
                  key={usage.id || `usage-${idx}`}
                  className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  {/* Thời gian */}
                  <td className="py-4 px-3 text-slate-600 dark:text-zinc-400 text-xs whitespace-nowrap">
                    {formatVoucherDate(usage.usedAt || usage.createdAt, true)}
                  </td>

                  {/* Người dùng */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={usage.userName || "Học viên"}
                        avatarUrl={usage.userAvatar}
                      />
                      <span className="font-bold text-slate-900 dark:text-zinc-100 truncate max-w-[150px] sm:max-w-[200px]">
                        {usage.userName || "Học viên"}
                      </span>
                    </div>
                  </td>

                  {/* Lớp học */}
                  <td className="py-4 px-3 text-slate-700 dark:text-zinc-300 font-medium">
                    <span className="truncate block max-w-[180px] sm:max-w-[240px]">
                      {usage.className || `Lớp học #${usage.classId || 1}`}
                    </span>
                  </td>

                  {/* Số tiền giảm */}
                  <td className="py-4 px-3 font-bold text-cath-red-700 dark:text-cath-red-400 whitespace-nowrap">
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
        <div>
          Hiển thị <strong className="text-slate-900 dark:text-zinc-200">{startRecord}</strong> đến{" "}
          <strong className="text-slate-900 dark:text-zinc-200">{endRecord}</strong> trong{" "}
          <strong className="text-slate-900 dark:text-zinc-200">{totalCount}</strong> kết quả
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {/* Prev Page Button */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numeric Page Buttons */}
            {renderPaginationButtons()}

            {/* Next Page Button */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoucherUsagesTable
