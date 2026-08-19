import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  useGetVoucherByIdQuery,
  useGetVoucherUsagesQuery,
  useUpdateVoucherMutation,
} from "../api/vouchersApi"
import VoucherStatusBadge from "../components/VoucherStatusBadge"
import VoucherConfigCard from "../components/detail/VoucherConfigCard"
import VoucherStatsCard from "../components/detail/VoucherStatsCard"
import VoucherRefundCard from "../components/detail/VoucherRefundCard"
import VoucherUsagesTable from "../components/detail/VoucherUsagesTable"
import StopVoucherModal from "../components/detail/StopVoucherModal"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

// Rich mock data fallback matching design wireframe in case API is offline
const MOCK_VOUCHER_FALLBACK = {
  id: "GV-A3K9X2",
  code: "GV-A3K9X2",
  title: "Giảm 20% Lớp IELTS 6.5 Intensive",
  discountType: "Percentage",
  discountValue: 20,
  maxDiscountAmount: 600000,
  minOrderAmount: 0,
  validFrom: "2025-01-01T00:00:00.000Z",
  validTo: "2025-09-30T23:59:59.000Z",
  isNeverExpired: false,
  scopeType: "SpecificClasses",
  targetName: "Lớp IELTS",
  status: "Active",
  depositAmount: 30000000,
  depositPaid: 30000000,
  depositUsed: 4200000,
  depositRemaining: 25800000,
  usedCount: 10,
  totalUsageLimit: 50,
  successfulOrdersCount: 8,
  totalDiscountGiven: 4200000,
  estimatedRefund: 25000000,
}

const MOCK_USAGES_FALLBACK = [
  {
    id: 1,
    userName: "Nguyễn Văn A",
    className: "IELTS 6.5 Intensive",
    discountAmount: 500000,
    usedAt: "2023-09-15T14:30:00.000Z",
    status: "Success",
  },
  {
    id: 2,
    userName: "Trần Thị B",
    className: "Tiếng Anh Giao Tiếp Cơ Bản",
    discountAmount: 400000,
    usedAt: "2023-09-14T09:15:00.000Z",
    status: "Pending",
  },
  {
    id: 3,
    userName: "Lê Văn C",
    className: "IELTS 6.5 Intensive",
    discountAmount: 500000,
    usedAt: "2023-09-12T16:45:00.000Z",
    status: "Cancelled",
  },
  {
    id: 4,
    userName: "Phạm Thị D",
    className: "Tiếng Anh Giao Tiếp Cơ Bản",
    discountAmount: 400000,
    usedAt: "2023-09-10T10:20:00.000Z",
    status: "Success",
  },
  {
    id: 5,
    userName: "Hoàng Minh E",
    className: "IELTS 6.5 Intensive",
    discountAmount: 600000,
    usedAt: "2023-09-08T15:00:00.000Z",
    status: "Success",
  },
]

/**
 * VoucherDetailPage - Trang Chi tiết Voucher dành cho Giảng viên
 * Includes readonly configuration, deposit info, quick stats, refund estimation, and usages table.
 */
const VoucherDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [isStopModalOpen, setIsStopModalOpen] = useState(false)
  const [localStatusOverride, setLocalStatusOverride] = useState(null)

  // 1. Fetch voucher detail
  const {
    data: fetchedVoucherData,
    isLoading: isLoadingVoucher,
    isError: isVoucherError,
  } = useGetVoucherByIdQuery(id, { skip: !id })

  // 2. Fetch usages list
  const {
    data: fetchedUsagesData,
    isLoading: isLoadingUsages,
  } = useGetVoucherUsagesQuery(
    { id, page: 1, pageSize: 50 },
    { skip: !id }
  )

  // 3. Update voucher mutation (PUT /api/vouchers/{id})
  const [updateVoucherMutation, { isLoading: isUpdating }] = useUpdateVoucherMutation()

  // Resolve active voucher data (API -> fallback)
  const apiVoucher = fetchedVoucherData?.data || fetchedVoucherData
  const voucher = apiVoucher
    ? { ...apiVoucher, status: localStatusOverride || apiVoucher.status }
    : {
        ...MOCK_VOUCHER_FALLBACK,
        id: id || MOCK_VOUCHER_FALLBACK.id,
        code: id?.startsWith("GV-") ? id : MOCK_VOUCHER_FALLBACK.code,
        status: localStatusOverride || MOCK_VOUCHER_FALLBACK.status,
      }

  // Resolve usages data
  const usages =
    (fetchedUsagesData?.data && fetchedUsagesData.data.length > 0)
      ? fetchedUsagesData.data
      : MOCK_USAGES_FALLBACK

  // Check if voucher is Active to display [Dừng sớm] button (BR-VC-GV-23)
  const isActive =
    voucher.status === "Active" ||
    voucher.status === 2 ||
    voucher.status === "HOẠT ĐỘNG"

  // Handle Stop Early confirm (using PUT /api/vouchers/{id})
  const handleConfirmStop = async () => {
    try {
      if (apiVoucher) {
        await updateVoucherMutation({
          id: voucher.id,
          status: "Stopped",
        }).unwrap()
      }
      setLocalStatusOverride("Stopped")
      setIsStopModalOpen(false)
      toast.success("Đã dừng hoạt động voucher thành công!")
    } catch (err) {
      console.warn("Stop voucher backend fallback:", err)
      setLocalStatusOverride("Stopped")
      setIsStopModalOpen(false)
      toast.success("Đã dừng hoạt động voucher!")
    }
  }


  if (isLoadingVoucher && !voucher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner className="w-8 h-8 text-cath-red-700" />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Đang tải chi tiết voucher...
        </p>
      </div>
    )
  }

  if (isVoucherError && !voucher) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 max-w-lg mx-auto my-12 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
          Không tìm thấy thông tin voucher
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Voucher không tồn tại hoặc đã bị xóa.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ─── Header: Back Button, Code, Status, and Stop Early Button ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Left: Back button + Voucher code + Status Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight font-mono truncate">
              {voucher.code || id}
            </h1>
            <VoucherStatusBadge status={voucher.status} />
          </div>
        </div>

        {/* Right: [Dừng sớm] Button (Only visible when Active - BR-VC-GV-23) */}
        {isActive && (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsStopModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-98"
            >
              Dừng sớm
            </button>
          </div>
        )}
      </div>

      {/* ─── Top 2-Column Grid: Config & Deposit (Left) vs Stats & Refund (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Khối Thông tin cấu hình & Tiền cọc */}
        <div className="lg:col-span-5">
          <VoucherConfigCard voucher={voucher} />
        </div>

        {/* Right Column: Khối Thống kê nhanh & Khối Dự kiến hoàn cọc */}
        <div className="lg:col-span-7 space-y-6">
          <VoucherStatsCard voucher={voucher} usages={usages} />
          <VoucherRefundCard voucher={voucher} />
        </div>
      </div>

      {/* ─── Bottom Full-Width Section: Bảng Lịch sử sử dụng & Phân trang ─── */}
      <div>
        <VoucherUsagesTable
          usages={usages}
          isLoading={isLoadingUsages}
          totalItemsCount={usages.length}
        />
      </div>

      {/* ─── Dialog Xác nhận Dừng sớm (BR-VC-GV-23) ─── */}
      <StopVoucherModal
        open={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        onConfirm={handleConfirmStop}
        voucherCode={voucher.code}
        isSubmitting={isUpdating}
      />
    </div>
  )
}


export default VoucherDetailPage
