import React, { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Gift, ArrowRight } from "lucide-react"
import { useGetVouchersQuery } from "@/features/vouchers/api/vouchersApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"

const formatVndNumber = (num, language = "vi") => {
  if (num == null || isNaN(Number(num)))
    return language === "vi" ? "0đ" : "0 VND"
  if (language === "vi") {
    return `${new Intl.NumberFormat("vi-VN").format(Number(num))}đ`
  }
  if (language === "zh") {
    return `${new Intl.NumberFormat("zh-CN").format(Number(num))} 越南盾`
  }
  return `${new Intl.NumberFormat("en-US").format(Number(num))} VND`
}

const getVoucherDiscountDisplay = (voucher, t, language = "vi") => {
  if (!voucher) return ""
  const vt = t?.vouchers || {}
  const discountLabel =
    vt.card?.discount ||
    (language === "en" ? "Off" : language === "zh" ? "优惠" : "Giảm")
  const isPercent =
    voucher.discountType === "Percentage" ||
    voucher.discountType === 1 ||
    String(voucher.discountType || "").toLowerCase() === "percentage"
  if (isPercent) {
    return `${discountLabel} ${voucher.discountValue}%`
  }
  const val = voucher.discountValue || voucher.maxDiscountAmount || 0
  return `${discountLabel} ${formatVndNumber(val, language)}`
}

const getVoucherScopeDisplay = (scopeType, t) => {
  const vt = t?.vouchers || {}
  const s = String(scopeType || "").toLowerCase()
  if (s === "all" || s === "1") return vt.scope?.All || "Cat Speak"
  if (s === "specificclasses" || s === "3")
    return vt.scope?.SpecificClasses || "Lớp học"
  if (s === "specificcourses" || s === "2")
    return vt.scope?.SpecificCourses || "Khóa học"
  return vt.scope?.All || "Cat Speak"
}

const getVoucherExpiryDisplay = (voucher, t, language = "vi") => {
  const vt = t?.vouchers || {}
  if (voucher?.isNeverExpired) {
    return (
      vt.card?.neverExpired ||
      (language === "en"
        ? "No Expiration"
        : language === "zh"
          ? "永久有效"
          : "Vô thời hạn")
    )
  }
  if (!voucher?.validTo) return "—"
  const d = new Date(voucher.validTo)
  if (isNaN(d.getTime())) return "—"
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const getVoucherStatusBadge = (voucher, t, language = "vi") => {
  const vt = t?.vouchers || {}
  const vs = vt.status || {}
  const status = voucher?.status
  const sStr = String(status || "")
    .trim()
    .toLowerCase()
  const now = Date.now()
  const validToTime = voucher?.validTo
    ? new Date(voucher.validTo).getTime()
    : null
  const isExpiringSoon =
    !voucher?.isNeverExpired &&
    validToTime &&
    validToTime - now <= 7 * 24 * 60 * 60 * 1000 &&
    validToTime > now
  const isUsageAlmostFull =
    !voucher?.isUnlimitedUsage &&
    voucher?.totalUsageLimit > 0 &&
    voucher?.usedCount / voucher?.totalUsageLimit >= 0.8

  if (sStr === "active" || sStr === "2" || sStr === "hoạt động") {
    if (isExpiringSoon || isUsageAlmostFull) {
      return {
        label:
          vs.expiringSoon ||
          (language === "en"
            ? "Expiring soon"
            : language === "zh"
              ? "即将过期"
              : "Sắp hết hạn"),
        className: "bg-[#b20a1c] text-white",
      }
    }
    return {
      label:
        vs.Active ||
        (language === "en"
          ? "Active"
          : language === "zh"
            ? "生效中"
            : "Đang hoạt động"),
      className: "bg-emerald-600 text-white",
    }
  }
  if (sStr === "draft" || sStr === "1") {
    return {
      label: vs.Draft || "Bản nháp",
      className: "bg-slate-100 text-slate-700",
    }
  }
  if (sStr === "disabled" || sStr === "3") {
    return {
      label: vs.Disabled || "Đã vô hiệu hóa",
      className: "bg-zinc-200 text-zinc-700",
    }
  }
  if (sStr === "expired" || sStr === "4") {
    return {
      label: vs.Expired || "Đã hết hạn",
      className: "bg-amber-100 text-amber-800",
    }
  }
  if (sStr === "exhausted" || sStr === "5") {
    return {
      label: vs.Exhausted || "Hết lượt dùng",
      className: "bg-purple-100 text-purple-800",
    }
  }
  if (sStr === "pendingdeposit" || sStr === "6") {
    return {
      label: vs.PendingDeposit || "Chờ nạp cọc",
      className: "bg-blue-100 text-blue-800",
    }
  }
  if (sStr === "pendingapproval" || sStr === "7") {
    return {
      label: vs.PendingApproval || "Chờ duyệt",
      className: "bg-yellow-100 text-yellow-800",
    }
  }
  if (sStr === "rejected" || sStr === "8") {
    return {
      label: vs.Rejected || "Bị từ chối",
      className: "bg-rose-100 text-rose-800",
    }
  }
  if (sStr === "stopped" || sStr === "9") {
    return {
      label: vs.Stopped || "Đã dừng",
      className: "bg-gray-200 text-gray-700",
    }
  }
  return {
    label: vs[status] || voucher?.status || "Hoạt động",
    className: "bg-emerald-600 text-white",
  }
}

const getVoucherUsagesText = (
  voucher,
  remaining,
  limit,
  isUnlimited,
  t,
  language = "vi",
) => {
  const vt = t?.vouchers || {}
  if (isUnlimited) {
    return (
      vt.card?.unlimitedUsages ||
      (language === "en"
        ? "Unlimited uses"
        : language === "zh"
          ? "无使用次数限制"
          : "Không giới hạn lượt")
    )
  }
  if (vt.card?.remainingUsages) {
    return vt.card.remainingUsages
      .replace("{{remaining}}", String(remaining))
      .replace("{{limit}}", String(limit))
  }
  if (language === "en") return `${remaining}/${limit} uses left`
  if (language === "zh") return `剩余 ${remaining}/${limit} 次`
  return `Còn ${remaining}/${limit} lượt`
}

const VoucherSection = ({
  classData = {},
  id,
  navigate: propNavigate,
  cd = {},
  className = "",
}) => {
  const navigateHook = useNavigate()
  const navigate = propNavigate || navigateHook
  const { t, language } = useLanguage()
  const c = t.courses || {}
  const vt = t.vouchers || {}

  const classTargetId = id || classData?.id

  const { data: vouchersResponse, isLoading: isLoadingVouchers } =
    useGetVouchersQuery(
      {
        classId: classTargetId,
        sponsorType: "Instructor",
        page: 1,
        pageSize: 10,
      },
      { skip: !classTargetId },
    )

  const activeVouchers = useMemo(() => {
    const list = Array.isArray(vouchersResponse?.data)
      ? vouchersResponse.data
      : []
    const activeList = list.filter((v) => {
      const s = String(v.status || "")
        .trim()
        .toLowerCase()
      return s === "active" || s === "2" || s === "hoạt động"
    })
    const candidates = activeList.length > 0 ? activeList : list
    return candidates.slice(0, 2)
  }, [vouchersResponse])

  const handleViewAll = () => {
    if (classTargetId) {
      navigate(
        `/workspace/courses/class/${encodeURIComponent(String(classTargetId))}?tab=vouchers`,
      )
    }
  }

  return (
    <div
      className={`bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-950 tracking-tight">
          {vt.card?.appliedTitle || cd.appliedVouchers || "Ưu đãi đang áp dụng"}
        </h3>
        <button
          type="button"
          onClick={handleViewAll}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#990011] hover:text-[#7a000e] transition-colors cursor-pointer group"
        >
          <span>
            {vt.card?.viewAll || cd.viewAll || c.viewAll || "Xem tất cả"}
          </span>
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {isLoadingVouchers ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner className="w-6 h-6 text-[#990011]" />
        </div>
      ) : activeVouchers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {activeVouchers.map((voucher) => {
            const used = Math.max(0, Number(voucher.usedCount) || 0)
            const limit = Math.max(0, Number(voucher.totalUsageLimit) || 0)
            const isUnlimited = Boolean(voucher.isUnlimitedUsage || limit <= 0)
            const remaining = isUnlimited ? 0 : Math.max(0, limit - used)
            const usedPercent = isUnlimited
              ? 0
              : limit > 0
                ? Math.min(100, Math.max(0, Math.round((used / limit) * 100)))
                : 0
            const statusInfo = getVoucherStatusBadge(voucher, t, language)

            return (
              <div
                key={voucher.id || voucher.code}
                className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between gap-3 relative hover:shadow-md transition-shadow"
              >
                {/* Top: Icon + Info + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Dashed Box with Gift Icon */}
                    <div className="w-14 h-14 shrink-0 rounded-2xl border border-dashed border-[#ff7700] bg-[#fff9f5] flex items-center justify-center text-[#ff7700]">
                      <Gift className="w-7 h-7 stroke-[1.8]" />
                    </div>

                    {/* Main details */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight truncate">
                        {voucher.code}
                      </h4>
                      <p className="text-sm font-bold text-[#990011]">
                        {getVoucherDiscountDisplay(voucher, t, language)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                        {getVoucherScopeDisplay(voucher.scopeType, t)} •{" "}
                        {vt.card?.exp || "HSD"}:{" "}
                        {getVoucherExpiryDisplay(voucher, t, language)}
                      </p>
                    </div>
                  </div>

                  {/* Status badge in top right */}
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md shrink-0 whitespace-nowrap ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Bottom: Progress Bar + Usages */}
                <div className="flex items-center gap-3 pt-1 w-full">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ff7700] rounded-full transition-all duration-300"
                      style={{ width: `${usedPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#ff7700] whitespace-nowrap shrink-0">
                    {getVoucherUsagesText(
                      voucher,
                      remaining,
                      limit,
                      isUnlimited,
                      t,
                      language,
                    )}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 text-xs font-medium bg-white/60 border border-dashed border-gray-200 rounded-2xl">
          {vt.card?.noAppliedVouchers ||
            cd.noAppliedVouchers ||
            "Chưa có ưu đãi nào đang áp dụng cho lớp học này."}
        </div>
      )}
    </div>
  )
}

export default VoucherSection
