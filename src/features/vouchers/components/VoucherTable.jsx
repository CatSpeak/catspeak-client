import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  MoreVertical,
  Eye,
  Edit3,
  Ticket,
  Ban,
  QrCode,
  AlertCircle,
} from "lucide-react"
import { toast } from "react-hot-toast"
import DataTable from "@/shared/components/ui/DataTable"
import Popover from "@/shared/components/ui/Popover"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import { IconButton } from "@/shared/components/ui/buttons"
import VoucherStatusBadge from "./VoucherStatusBadge"
import VoucherCard from "./VoucherCard"
import StopVoucherModal from "./detail/StopVoucherModal"
import TransferInfoModal from "./detail/TransferInfoModal"
import RejectionReasonModal from "./detail/RejectionReasonModal"
import { useStopVoucherMutation } from "../api/vouchersApi"
import { formatCurrency } from "../utils/voucherTransforms"
import { DISCOUNT_TYPES } from "../constants/voucherConstants"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const VoucherTable = ({
  vouchers = [],
  isLoading = false,
  onViewDetails,
  onViewUsages,
  onEditDraft,
  className = "",
}) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const vt = t.vouchers || {}
  const { formatDate } = useTimezone()

  // Modal States
  const [selectedVoucherForStop, setSelectedVoucherForStop] = useState(null)
  const [selectedVoucherForTransfer, setSelectedVoucherForTransfer] =
    useState(null)
  const [selectedVoucherForRejection, setSelectedVoucherForRejection] =
    useState(null)

  // API Mutations
  const [stopVoucherMutation, { isLoading: isStopping }] =
    useStopVoucherMutation()

  const handleViewDetails = (voucher) => {
    if (onViewDetails) {
      onViewDetails(voucher)
    } else {
      navigate(`/workspace/vouchers/${voucher.id}`)
    }
  }

  // Handle Stop Early confirm (POST /api/vouchers/{id}/stop)
  const handleConfirmStop = async () => {
    if (!selectedVoucherForStop) return
    try {
      await stopVoucherMutation(selectedVoucherForStop.id).unwrap()
      toast.success(
        vt.modals?.stopSuccess || "Đã dừng hoạt động voucher thành công!",
      )
    } catch (err) {
      console.error("Stop voucher error:", err)
      const msg =
        err?.data?.message ||
        err?.data?.data?.message ||
        vt.modals?.stopError ||
        "Có lỗi xảy ra khi dừng voucher. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setSelectedVoucherForStop(null)
    }
  }

  const columns = [
    {
      key: "code",
      label: vt.table?.code || "Mã voucher",
      headerClassName: "w-[16%]",
      className: "w-[16%] font-bold",
    },
    {
      key: "discountType",
      label: vt.table?.discountType || "Loại giảm",
      headerClassName: "w-[14%]",
      className: "w-[14%]",
      render: (voucher) => {
        const isPercent =
          voucher.discountType === DISCOUNT_TYPES.PERCENTAGE ||
          voucher.discountType === 1 ||
          voucher.discountType === "Percentage"

        return isPercent
          ? vt.table?.percent || "Phần trăm"
          : vt.table?.fixed || "Cố định"
      },
    },
    {
      key: "discount",
      label: vt.table?.discount || "Giá trị",
      headerClassName: "w-[18%]",
      className: "w-[18%] font-bold text-cath-red-700",
      render: (voucher) => {
        const isPercent =
          voucher.discountType === DISCOUNT_TYPES.PERCENTAGE ||
          voucher.discountType === 1 ||
          voucher.discountType === "Percentage"

        return isPercent
          ? `${voucher.discountValue}%`
          : formatCurrency(voucher.discountValue)
      },
    },
    {
      key: "validity",
      label: vt.table?.validity || "Hiệu lực",
      headerClassName: "w-[20%]",
      className: "w-[20%]",
      render: (voucher) => {
        if (voucher.isNeverExpired) {
          return <span>{vt.table?.neverExpired || "Không giới hạn"}</span>
        }
        const from = voucher.validFrom ? formatDate(voucher.validFrom) : null
        const to = voucher.validTo ? formatDate(voucher.validTo) : null

        if (from && to) {
          return `${from} - ${to}`
        }
        if (from) {
          return `${vt.table?.from || "Từ"} ${from}`
        }
        if (to) {
          return `${vt.table?.to || "Đến"} ${to}`
        }
        return "-"
      },
    },
    {
      key: "usage",
      label: vt.table?.usage || "Đã dùng",
      headerClassName: "w-[12%]",
      className: "w-[12%]",
      render: (voucher) => {
        const used = voucher.usedCount || 0
        const limit = voucher.totalUsageLimit || 0
        return `${used} / ${limit > 0 ? limit : "∞"}`
      },
    },
    {
      key: "status",
      label: vt.table?.status || "Trạng thái",
      headerClassName: "w-[12%]",
      className: "w-[12%]",
      render: (voucher) => <VoucherStatusBadge status={voucher.status} />,
    },
    {
      key: "actions",
      label: <span className="sr-only">{vt.table?.actions || "Thao tác"}</span>,
      headerClassName: "w-[8%] text-right",
      className: "w-[8%] whitespace-nowrap text-right",
      render: (voucher) => {
        const status = voucher.status
        const isActive =
          status === "Active" || status === 2 || status === "HOẠT ĐỘNG"
        const isPendingDeposit =
          status === "PendingDeposit" ||
          status === "PendingApproval" ||
          status === 6 ||
          status === 7
        const isRejected = status === "Rejected" || status === 8
        const isDraft = status === "Draft" || status === 1

        return (
          <div
            className="flex items-center justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            <Popover
              placement="bottom-right"
              trigger={
                <IconButton
                  size="sm"
                  variant="ghost"
                  title={vt.table?.actions || "Thao tác"}
                >
                  <MoreVertical />
                </IconButton>
              }
              content={(close) => (
                <MenuList>
                  {/* 1. Trạng thái Hoạt động: Dừng sớm */}
                  {isActive && (
                    <MenuItem
                      label={vt.actions?.stopEarly || "Dừng sớm"}
                      icon={<Ban />}
                      className="text-rose-600"
                      onClick={() => {
                        close()
                        setSelectedVoucherForStop(voucher)
                      }}
                    />
                  )}

                  {/* 2. Trạng thái Chờ nạp cọc / Chờ duyệt: Xem thông tin chuyển khoản (BR-VC-GV-21) */}
                  {isPendingDeposit && (
                    <MenuItem
                      label={
                        vt.actions?.viewTransferInfo ||
                        "Xem thông tin chuyển khoản"
                      }
                      icon={<QrCode />}
                      onClick={() => {
                        close()
                        setSelectedVoucherForTransfer(voucher)
                      }}
                    />
                  )}

                  {/* 3. Trạng thái Bị từ chối: Xem lý do từ chối */}
                  {isRejected && (
                    <MenuItem
                      label={
                        vt.actions?.viewRejectionReason || "Xem lý do từ chối"
                      }
                      icon={<AlertCircle />}
                      onClick={() => {
                        close()
                        setSelectedVoucherForRejection(voucher)
                      }}
                    />
                  )}

                  {/* 4. Trạng thái Bản nháp: Chỉnh sửa */}
                  {isDraft && (
                    <MenuItem
                      label={vt.actions?.edit || "Chỉnh sửa"}
                      icon={<Edit3 />}
                      onClick={() => {
                        close()
                        if (onEditDraft) {
                          onEditDraft(voucher)
                        } else {
                          navigate(`/workspace/vouchers/edit/${voucher.id}`)
                        }
                      }}
                    />
                  )}

                  {/* 5. Trạng thái Hết lượt / Hết hạn / Đã dừng / Vô hiệu hóa: Xem chi tiết */}
                  {!isActive &&
                    !isPendingDeposit &&
                    !isRejected &&
                    !isDraft && (
                      <MenuItem
                        label={vt.actions?.viewDetails || "Xem chi tiết"}
                        icon={<Eye />}
                        onClick={() => {
                          close()
                          handleViewDetails(voucher)
                        }}
                      />
                    )}
                </MenuList>
              )}
            />
          </div>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={vouchers}
        rowKey={(voucher) => voucher.id}
        headerRowClassName="bg-slate-50/80 text-secondary border-b border-border text-sm font-semibold"
        onRowClick={(voucher) => handleViewDetails(voucher)}
        emptyTitle={vt.emptyTitle || "Chưa có voucher nào"}
        emptyDescription={
          vt.emptySubtitle ||
          "Bạn chưa tạo mã voucher nào phù hợp với bộ lọc hiện tại."
        }
        emptyIcon={<Ticket className="w-8 h-8 text-cath-red-600" />}
        className={className}
        renderMobileCard={(voucher) => (
          <VoucherCard
            voucher={voucher}
            onViewDetails={handleViewDetails}
            onEditDraft={onEditDraft}
            onOpenTransfer={() => setSelectedVoucherForTransfer(voucher)}
            onOpenRejection={() => setSelectedVoucherForRejection(voucher)}
            onOpenStop={() => setSelectedVoucherForStop(voucher)}
          />
        )}
      />

      {/* ─── Modals triggered from Popover Actions ─── */}
      {/* 1. Modal Dừng sớm (Hoạt động) */}
      <StopVoucherModal
        open={Boolean(selectedVoucherForStop)}
        onClose={() => setSelectedVoucherForStop(null)}
        onConfirm={handleConfirmStop}
        voucherCode={selectedVoucherForStop?.code}
        isSubmitting={isStopping}
      />

      {/* 2. Modal Thông tin chuyển khoản (Chờ nạp cọc) */}
      <TransferInfoModal
        open={Boolean(selectedVoucherForTransfer)}
        onClose={() => setSelectedVoucherForTransfer(null)}
        voucher={selectedVoucherForTransfer || {}}
      />

      {/* 3. Modal Xem lý do từ chối (Bị từ chối) */}
      <RejectionReasonModal
        open={Boolean(selectedVoucherForRejection)}
        onClose={() => setSelectedVoucherForRejection(null)}
        voucher={selectedVoucherForRejection || {}}
      />
    </>
  )
}

export default VoucherTable
