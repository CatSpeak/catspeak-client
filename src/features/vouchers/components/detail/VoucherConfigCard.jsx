import React from "react"
import { formatCurrency } from "../../utils/voucherTransforms"
import { DISCOUNT_TYPES } from "../../constants/voucherConstants"
import { useTimezone } from "@/shared/hooks/useTimezone"

/**
 * VoucherConfigCard - Khối thông tin cấu hình & Tiền cọc của voucher
 * Readonly display according to specifications 2 & 3.
 */
const VoucherConfigCard = ({ voucher = {} }) => {
  const { formatDate } = useTimezone()

  // 1. Discount type & value formatting
  const isPercent =
    voucher.discountType === DISCOUNT_TYPES.PERCENTAGE ||
    voucher.discountType === 1 ||
    voucher.discountType === "Percentage"

  const discountTypeLabel = isPercent
    ? "Phần trăm (%)"
    : "Số tiền cố định (₫)"

  const discountValueDisplay = isPercent
    ? `${voucher.discountValue}%`
    : formatCurrency(voucher.discountValue)

  // 2. Validity date range
  let validityDisplay = "Không giới hạn"
  if (!voucher.isNeverExpired) {
    const from = voucher.validFrom ? formatDate(voucher.validFrom) : null
    const to = voucher.validTo ? formatDate(voucher.validTo) : null
    if (from && to) {
      validityDisplay = `${from} - ${to}`
    } else if (from) {
      validityDisplay = `Từ ${from}`
    } else if (to) {
      validityDisplay = `Đến ${to}`
    }
  }

  // 3. Target / Scope display
  const getAppliedScopeDisplay = () => {
    if (Array.isArray(voucher.classes) && voucher.classes.length > 0) {
      return voucher.classes.map((c) => c.name || `Lớp #${c.id}`).join(", ")
    }
    if (Array.isArray(voucher.courses) && voucher.courses.length > 0) {
      return voucher.courses.map((c) => c.name || `Khóa #${c.id}`).join(", ")
    }
    if (voucher.scopeType === "SpecificClasses" || voucher.scopeType === 3) {
      return voucher.targetName || "Lớp học chỉ định"
    }
    if (voucher.scopeType === "SpecificCourses" || voucher.scopeType === 2) {
      return voucher.targetName || "Khóa học chỉ định"
    }
    if (voucher.targetName) {
      return voucher.targetName
    }
    return "Toàn bộ lớp / khóa học"
  }

  // 4. Deposit calculations (BR-VC-GV-25)
  const depositPaid = Number(
    voucher.depositPaid ?? voucher.depositAmount ?? voucher.depositRequired ?? 0
  )
  const depositUsed = Number(
    voucher.depositUsed ?? voucher.totalDiscountGiven ?? 0
  )
  const depositRemaining = Math.max(0, depositPaid - depositUsed)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-6">
      {/* ─── Khối Thông tin cấu hình ─── */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
          Thông tin cấu hình
        </h3>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Mã:</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 tracking-wide font-mono">
              {voucher.code || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Loại:</span>
            <span className="font-medium text-slate-900 dark:text-zinc-200">
              {discountTypeLabel}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Giá trị:</span>
            <span className="font-bold text-cath-red-700 dark:text-cath-red-400">
              {discountValueDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Giảm tối đa:</span>
            <span className="font-medium text-slate-900 dark:text-zinc-200">
              {voucher.maxDiscountAmount
                ? formatCurrency(voucher.maxDiscountAmount)
                : "Không giới hạn"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Đơn tối thiểu:</span>
            <span className="font-medium text-slate-900 dark:text-zinc-200">
              {formatCurrency(voucher.minOrderAmount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Hiệu lực:</span>
            <span className="font-medium text-slate-900 dark:text-zinc-200">
              {validityDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Áp dụng:</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 text-right max-w-[200px] sm:max-w-[260px] truncate">
              {getAppliedScopeDisplay()}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Khối Tiền cọc ─── */}
      <div className="pt-5 border-t border-slate-100 dark:border-zinc-800 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
          Tiền cọc
        </h4>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Đã nạp:</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100">
              {formatCurrency(depositPaid)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Đã dùng:</span>
            <span className="font-bold text-cath-red-700 dark:text-cath-red-400">
              {formatCurrency(depositUsed)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-500 dark:text-zinc-400">Còn lại:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(depositRemaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoucherConfigCard
