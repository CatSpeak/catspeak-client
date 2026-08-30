import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"
import { PillButton } from "@/shared/components/ui/buttons"
import FluentCard from "@/shared/components/ui/FluentCard"
import {
  useGetVoucherByIdQuery,
  useGetVoucherUsagesQuery,
  useStopVoucherMutation,
} from "../api/vouchersApi"
import VoucherStatusBadge from "../components/VoucherStatusBadge"
import VoucherConfigCard from "../components/detail/VoucherConfigCard"
import VoucherStatsCard from "../components/detail/VoucherStatsCard"
import VoucherRefundCard from "../components/detail/VoucherRefundCard"
import VoucherUsagesTable from "../components/detail/VoucherUsagesTable"
import VoucherDetailSkeleton from "../components/detail/VoucherDetailSkeleton"
import StopVoucherModal from "../components/detail/StopVoucherModal"

const VoucherDetailPage = () => {
  const { t } = useLanguage()
  const { id } = useParams()
  const navigate = useNavigate()

  const [isStopModalOpen, setIsStopModalOpen] = useState(false)
  const [localStatusOverride, setLocalStatusOverride] = useState(null)

  // 1. Fetch voucher detail
  const {
    data: fetchedVoucherData,
    isLoading: isLoadingVoucher,
    isError: isVoucherError,
    refetch: refetchVoucher,
  } = useGetVoucherByIdQuery(id)

  // 2. Fetch voucher usage history
  const { data: fetchedUsagesData, isLoading: isLoadingUsages } =
    useGetVoucherUsagesQuery({ voucherId: id, page: 1, pageSize: 20 })

  // 3. Stop Voucher Mutation (BR-VC-GV-23)
  const [stopVoucherMutation, { isLoading: isStopping }] =
    useStopVoucherMutation()

  const rawVoucher = fetchedVoucherData?.data || fetchedVoucherData

  const voucher = rawVoucher
    ? {
        ...rawVoucher,
        status: localStatusOverride || rawVoucher.status,
      }
    : null

  const usages = fetchedUsagesData?.data || []

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate("/workspace/courses")
    }
  }

  const handleConfirmStop = async () => {
    try {
      await stopVoucherMutation(id).unwrap()
      setLocalStatusOverride("Stopped")
      toast.success(
        t?.vouchers?.modals?.stopSuccess || "Đã dừng voucher thành công!",
      )
      setIsStopModalOpen(false)
      refetchVoucher()
    } catch (err) {
      console.error("[VoucherDetailPage] Stop voucher error:", err)
      const rawMsg = err?.data?.message || err?.data?.data?.message
      toast.error(
        rawMsg ||
          t?.vouchers?.modals?.stopError ||
          "Có lỗi xảy ra khi dừng voucher. Vui lòng thử lại.",
      )
    }
  }

  const isActive = voucher?.status === "Active" || voucher?.status === 2
  const isDraft =
    voucher?.status === "Draft" ||
    voucher?.status === 1 ||
    voucher?.status === "BẢN NHÁP"

  if (isLoadingVoucher) {
    return <VoucherDetailSkeleton />
  }

  if (isVoucherError && !voucher) {
    return (
      <div className="flex-1 w-full flex items-center justify-center py-12 px-4 my-auto animate-in fade-in zoom-in-95 duration-200">
        <FluentCard className="w-full max-w-md text-center flex flex-col items-center justify-center shadow-xs p-6">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="font-bold text-2xl text-primary tracking-tight mb-2">
            {t?.vouchers?.notFound || "Không tìm thấy thông tin voucher"}
          </h2>
          <p className="text-base text-secondary mb-6 max-w-sm">
            {t?.vouchers?.notFoundDesc ||
              "Voucher không tồn tại hoặc bạn không có quyền truy cập."}
          </p>
          <PillButton type="button" variant="primary" onClick={handleGoBack}>
            {t?.vouchers?.back || "Quay lại"}
          </PillButton>
        </FluentCard>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 text-base animate-in fade-in duration-300">
      {/* Back Button */}
      <PillButton
        variant="secondary"
        onClick={handleGoBack}
        startIcon={<ArrowLeft />}
        className="w-fit"
      >
        {t?.vouchers?.back || "Quay lại"}
      </PillButton>

      {/* Header: Title + Code + Status Badge + Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <PageTitle>{voucher?.title || voucher?.code || id}</PageTitle>
          {voucher && <VoucherStatusBadge status={voucher.status} />}
        </div>

        {/* Actions on Header */}
        <div className="flex items-center justify-end gap-2">
          {/* Active: Dừng sớm (BR-VC-GV-23) */}
          {isActive && (
            <PillButton
              type="button"
              variant="secondary"
              textColor="#dc2626"
              onClick={() => setIsStopModalOpen(true)}
            >
              {t?.vouchers?.actions?.stopEarly || "Dừng sớm"}
            </PillButton>
          )}

          {/* Draft: Chỉnh sửa */}
          {isDraft && (
            <PillButton
              type="button"
              variant="secondary"
              onClick={() =>
                navigate(`/workspace/vouchers/edit/${voucher?.id || id}`)
              }
            >
              {t?.vouchers?.actions?.edit || "Chỉnh sửa"}
            </PillButton>
          )}
        </div>
      </div>

      {/* Top 2-Column Grid: Config & Deposit (Left) vs Stats & Refund (Right) */}
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

      {/* Bottom Full-Width Section: Bảng Lịch sử sử dụng */}
      <div>
        <VoucherUsagesTable
          usages={usages}
          isLoading={isLoadingUsages}
          totalItemsCount={usages.length}
        />
      </div>

      {/* Dialog Xác nhận Dừng sớm (BR-VC-GV-23) */}
      <StopVoucherModal
        open={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        onConfirm={handleConfirmStop}
        voucherCode={voucher?.code}
        isSubmitting={isStopping}
      />
    </div>
  )
}

export default VoucherDetailPage
