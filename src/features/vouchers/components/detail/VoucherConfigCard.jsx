import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Divider from "@/shared/components/ui/Divider"
import { formatCurrency } from "../../utils/voucherTransforms"
import { DISCOUNT_TYPES } from "../../constants/voucherConstants"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * VoucherConfigCard - Khối thông tin cấu hình & Tiền cọc của voucher
 * Readonly display according to specifications 2 & 3.
 */
const VoucherConfigCard = ({ voucher = {} }) => {
  const { t } = useLanguage()
  const vd = t?.vouchers?.detail || {}
  const vf = t?.vouchers?.form || {}
  const vt = t?.vouchers?.table || {}
  const { formatDate } = useTimezone()

  // 1. Discount type & value formatting
  const isPercent =
    voucher.discountType === DISCOUNT_TYPES.PERCENTAGE ||
    voucher.discountType === 1 ||
    voucher.discountType === "Percentage"

  const discountTypeLabel = isPercent
    ? vt.percent || "Phần trăm (%)"
    : vt.fixed || "Số tiền cố định (₫)"

  const discountValueDisplay = isPercent
    ? `${voucher.discountValue}%`
    : formatCurrency(voucher.discountValue)

  // 2. Validity date range
  let validityDisplay = vt.neverExpired || "Không giới hạn"
  if (!voucher.isNeverExpired) {
    const from = voucher.validFrom ? formatDate(voucher.validFrom) : null
    const to = voucher.validTo ? formatDate(voucher.validTo) : null
    if (from && to) {
      validityDisplay = `${from} - ${to}`
    } else if (from) {
      validityDisplay = `${vt.from || "Từ"} ${from}`
    } else if (to) {
      validityDisplay = `${vt.to || "Đến"} ${to}`
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
      return voucher.targetName || vd.specificClass || "Lớp học chỉ định"
    }
    if (voucher.scopeType === "SpecificCourses" || voucher.scopeType === 2) {
      return voucher.targetName || vd.specificCourse || "Khóa học chỉ định"
    }
    if (voucher.targetName) {
      return voucher.targetName
    }
    return vd.allClassesOrCourses || "Toàn bộ lớp / khóa học"
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
    <FluentCard className="space-y-6">
      {/* ─── Khối Thông tin cấu hình ─── */}
      <div className="space-y-4">
        <h4 className="font-bold text-primary">
          {vd.configTitle || "Thông tin cấu hình"}
        </h4>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.code || "Mã:"}
            </span>
            <span className="font-bold text-primary tracking-wide font-mono">
              {voucher.code || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.type || "Loại:"}
            </span>
            <span className="font-medium text-primary">
              {discountTypeLabel}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.value || "Giá trị:"}
            </span>
            <span className="font-bold text-cath-red-700">
              {discountValueDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.maxDiscount || "Giảm tối đa:"}
            </span>
            <span className="font-medium text-primary">
              {voucher.maxDiscountAmount
                ? formatCurrency(voucher.maxDiscountAmount)
                : vf.unlimited || "Không giới hạn"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.minOrder || "Đơn tối thiểu:"}
            </span>
            <span className="font-medium text-primary">
              {formatCurrency(voucher.minOrderAmount || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.validity || "Hiệu lực:"}
            </span>
            <span className="font-medium text-primary">
              {validityDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.appliedScope || "Áp dụng:"}
            </span>
            <span className="font-semibold text-primary text-right max-w-[200px] sm:max-w-[260px] truncate">
              {getAppliedScopeDisplay()}
            </span>
          </div>
        </div>
      </div>

      <Divider />

      {/* ─── Khối Tiền cọc ─── */}
      <div className="space-y-4">
        <h4 className="font-bold text-primary">
          {vd.depositTitle || "Tiền cọc"}
        </h4>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.depositPaid ? `${vd.depositPaid}:` : "Đã nạp:"}
            </span>
            <span className="font-bold text-primary">
              {formatCurrency(depositPaid)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.depositUsed ? `${vd.depositUsed}:` : "Đã dùng:"}
            </span>
            <span className="font-bold text-cath-red-700">
              {formatCurrency(depositUsed)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-secondary">
              {vd.depositRemaining ? `${vd.depositRemaining}:` : "Còn lại:"}
            </span>
            <span className="font-bold text-emerald-600">
              {formatCurrency(depositRemaining)}
            </span>
          </div>
        </div>
      </div>
    </FluentCard>
  )
}

export default VoucherConfigCard
