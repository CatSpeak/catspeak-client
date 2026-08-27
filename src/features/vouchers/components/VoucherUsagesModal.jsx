import React, { useState } from "react"
import {
  X,
  Users,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"
import { useGetVoucherUsagesQuery } from "../api/vouchersApi"
import { formatCurrency, formatVoucherDate } from "../utils/voucherTransforms"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const VoucherUsagesModal = ({
  voucher,
  voucherId,
  isOpen = true,
  onClose,
}) => {
  const { t } = useLanguage()
  const vt = t.vouchers?.usages || {}

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const effectiveId = voucher?.id || voucherId

  const { data: usagesData, isLoading } = useGetVoucherUsagesQuery(
    {
      id: effectiveId,
      page,
      pageSize,
      search,
      status,
    },
    { skip: isOpen === false || !effectiveId },
  )

  if (isOpen === false || !effectiveId) return null

  const items = usagesData?.data || []
  const pagination = usagesData?.pagination || { page: 1, pageSize: 10, total: 0 }
  const totalPages = Math.ceil((pagination.total || 0) / pageSize) || 1

  const getStatusBadge = (st) => {
    switch (st) {
      case "Success":
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" />
            {vt.orderStatusSuccess || "Thành công"}
          </span>
        )
      case "Pending":
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-2.5 h-2.5" />
            {vt.orderStatusPending || "Đang xử lý"}
          </span>
        )
      case "Cancelled":
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-2.5 h-2.5" />
            {vt.orderStatusCancelled || "Đã hủy"}
          </span>
        )
      default:
        return <span className="text-[10px] text-slate-400">{st}</span>
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cath-red-50 text-cath-red-700 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {vt.title || "Lịch sử sử dụng Voucher"}
              </h3>
              <p className="text-xs text-slate-500">
                {vt.codeLabel || "Mã:"} <span className="font-mono font-bold">{voucher?.code}</span> • {voucher?.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={vt.searchPlaceholder || "Tìm kiếm theo tên hoặc email học viên..."}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cath-red-500/20 focus:border-cath-red-500"
            />
          </div>

          <div className="min-w-[140px]">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-cath-red-500/20 cursor-pointer"
            >
              <option value="">{vt.allStatuses || "Tất cả trạng thái"}</option>
              <option value="Success">{vt.orderStatusSuccess || "Thành công"}</option>
              <option value="Pending">{vt.orderStatusPending || "Đang xử lý"}</option>
              <option value="Cancelled">{vt.orderStatusCancelled || "Đã hủy"}</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner className="w-8 h-8 text-cath-red-700" />
              <p className="text-xs text-slate-400 mt-2 font-medium">
                {vt.loading || "Đang tải lịch sử sử dụng..."}
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                {vt.empty || "Chưa có học viên nào sử dụng voucher này."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase tracking-wider text-[10px] font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">{vt.student || "Học viên"}</th>
                  <th className="py-3 px-4">{vt.classTarget || "Lớp học"}</th>
                  <th className="py-3 px-4">{vt.discountApplied || "Số tiền giảm"}</th>
                  <th className="py-3 px-4">{vt.usedAt || "Thời gian"}</th>
                  <th className="py-3 px-4 text-right">{vt.orderStatus || "Trạng thái"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((usage) => (
                  <tr key={usage.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {usage.userAvatar ? (
                          <img
                            src={usage.userAvatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">
                            {usage.userName || vt.studentFallback || "Học viên"}
                          </p>
                          <p className="text-[10px] text-slate-400">{usage.userEmail}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-[200px]">
                      <p className="font-medium text-slate-800 truncate">
                        {usage.className || `Lớp #${usage.classId}`}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {vt.orderPrefix || "Đơn hàng: #"}
                        {usage.orderId}
                      </p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-600">
                      -{formatCurrency(usage.discountAmount || 0)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                      {formatVoucherDate(usage.usedAt, true)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {getStatusBadge(usage.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="flex items-center justify-between p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs">
          <span className="text-slate-500">
            {vt.totalPrefix || "Tổng cộng:"}{" "}
            <strong className="text-slate-800">{pagination.total}</strong>{" "}
            {vt.usagesSuffix || "lượt sử dụng"}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-medium">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoucherUsagesModal
