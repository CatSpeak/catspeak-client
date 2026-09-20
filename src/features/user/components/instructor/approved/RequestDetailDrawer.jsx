import React, { useState } from "react"
import { ArrowDown, Clock, Download, Info, Languages } from "lucide-react"
import ProfileDrawer from "@/features/user/components/instructor/ProfileDrawer"
import {
  useDeleteLanguageRequestMutation,
  useGetLanguageRequestDetailQuery,
} from "@/store/api/instructorApi"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { toast } from "@/shared/utils/toastBridge"
import { parseApiError } from "@/shared/utils/apiError"
import { fileNameFromUrl, formatUtcDate, pick, requestStatus } from "./utils"

const STATUS_STYLES = {
  Approved: {
    labelKey: "approvedStatusApproved",
    className: "bg-[#ECFDF3] text-[#039855]",
  },
  Pending: {
    labelKey: "approvedStatusPending",
    className: "bg-[#FFF7E8] text-[#D97706]",
  },
  Rejected: {
    labelKey: "approvedStatusRejected",
    className: "bg-[#FEF3F2] text-[#F52235]",
  },
  Cancelled: {
    labelKey: "approvedStatusCancelled",
    className: "bg-[#F2F4F7] text-[#667085]",
  },
}

const FileRow = ({ url, downloadLabel }) =>
  url ? (
    <div className="flex h-[52px] items-center gap-2.5 rounded-[7px] border border-[#D0D5DD] px-2.5">
      <span className="flex h-[30px] w-7 shrink-0 items-center justify-center rounded-[5px] border border-[#D0D5DD] bg-[#FFF1F2] text-[7px] font-bold text-[#F52235]">
        PDF
      </span>
      <span
        className="min-w-0 flex-1 truncate text-xs font-medium text-[#101828]"
        title={fileNameFromUrl(url)}
      >
        {fileNameFromUrl(url)}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={downloadLabel}
        className="shrink-0 text-[#101828] transition-colors hover:text-[#F52235]"
      >
        <Download size={18} />
      </a>
    </div>
  ) : (
    <span className="text-xs text-[#98A2B3]">—</span>
  )

const SectionCard = ({ levelLabel, level, credentialLabel, credentialUrl, downloadLabel }) => (
  <div className="flex flex-col gap-2.5 rounded-lg border border-[#D0D5DD] px-4 py-3.5">
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-medium text-[#667085]">
        {levelLabel}
      </span>
      <span className="text-xs font-medium text-[#101828]">
        {level || "—"}
      </span>
    </div>
    <div className="h-px w-full bg-[#E4E7EC]" />
    <span className="text-[11px] font-medium text-[#667085]">
      {credentialLabel}
    </span>
    <FileRow url={credentialUrl} downloadLabel={downloadLabel} />
  </div>
)

/**
 * "Chi tiết yêu cầu cập nhật" drawer: shows the live info vs the requested
 * info for a language update request, and lets the teacher cancel it while it
 * is still pending (soft-delete on the backend).
 */
const RequestDetailDrawer = ({
  open,
  onClose,
  requestId,
  request,
  onDeleted,
  t,
}) => {
  const ins = t.profile?.instructor || {}
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: detailData, isLoading } = useGetLanguageRequestDetailQuery(
    requestId,
    { skip: !requestId },
  )

  const [deleteLanguageRequest, { isLoading: isDeleting }] =
    useDeleteLanguageRequestMutation()

  const detail = detailData?.data ?? detailData
  const source = detail || request || null

  const status = requestStatus(source)
  const isPending = status === "Pending"
  const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.Pending

  const language = pick(source, "language", "Language")
  const languageLabel = t.courses?.student?.languages?.[language] || language
  const currentLevel = pick(
    source,
    "previousLevel",
    "PreviousLevel",
    "currentLevel",
    "CurrentLevel",
  )
  const newLevel = pick(source, "level", "Level")
  const currentCredentialUrl = pick(
    source,
    "previousCredentialUrl",
    "PreviousCredentialUrl",
  )
  const newCredentialUrl = pick(source, "credentialUrl", "CredentialUrl")
  const createdAt = pick(source, "createdAt", "CreatedAt")
  const rejectReason = pick(
    source,
    "rejectionReason",
    "RejectionReason",
    "rejectReason",
    "RejectReason",
    "reason",
    "Reason",
  )

  const handleConfirmDelete = async () => {
    if (!requestId) return
    try {
      await deleteLanguageRequest(requestId).unwrap()
      setConfirmOpen(false)
      toast.success(ins.approvedRequestDeleted || "Đã xóa đơn yêu cầu")
      onDeleted?.()
    } catch (err) {
      const { message } = parseApiError(err)
      toast.error(
        message ||
          ins.approvedRequestDeleteError ||
          "Không thể xóa đơn yêu cầu. Vui lòng thử lại.",
      )
    }
  }

  return (
    <>
      <ProfileDrawer
        open={open && !confirmOpen}
        onClose={onClose}
        title={ins.approvedRequestDetailTitle || "Chi tiết yêu cầu cập nhật"}
        secondaryLabel={
          isPending
            ? ins.approvedRequestDelete || "Xóa đơn yêu cầu"
            : undefined
        }
        onSecondary={isPending ? () => setConfirmOpen(true) : undefined}
        primaryLabel={ins.approvedRequestClose || "Đóng"}
        onPrimary={onClose}
      >
        <div className="flex flex-col gap-2.5">
          <span
            className={`inline-flex h-[30px] w-fit items-center gap-1.5 rounded-[7px] px-2.5 text-[11px] font-semibold ${statusConfig.className}`}
          >
            {isPending && <Clock size={12} />}
            {ins[statusConfig.labelKey] || status}
          </span>

          <div className="flex items-center gap-2.5">
            <Languages size={18} className="shrink-0 text-[#667085]" />
            <span className="truncate text-[15px] font-semibold text-[#101828]">
              {languageLabel || "—"}
            </span>
          </div>

          <span className="text-sm font-semibold text-[#101828]">
            {ins.approvedRequestCurrentInfo || "Thông tin hiện tại"}
          </span>
          <SectionCard
            levelLabel={ins.approvedLevelCol || "Trình độ"}
            level={currentLevel}
            credentialLabel={ins.approvedCredentialCol || "Chứng chỉ"}
            credentialUrl={currentCredentialUrl}
            downloadLabel={ins.download || "Tải xuống"}
          />

          <div className="flex h-8 w-full items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F4F7] text-[#667085]">
              <ArrowDown size={16} />
            </span>
          </div>

          <span className="text-sm font-semibold text-[#101828]">
            {ins.approvedRequestWantedInfo || "Thông tin yêu cầu"}
          </span>
          <SectionCard
            levelLabel={ins.approvedRequestNewLevel || "Trình độ mới"}
            level={newLevel}
            credentialLabel={
              ins.approvedRequestNewCredential || "Chứng chỉ mới"
            }
            credentialUrl={newCredentialUrl}
            downloadLabel={ins.download || "Tải xuống"}
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#101828]">
              {ins.approvedSentAt || "Ngày gửi"}
            </span>
            <span className="font-medium text-[#101828]">
              {formatUtcDate(createdAt) || "—"}
            </span>
          </div>

          {isLoading && !source && (
            <div className="flex items-center justify-center py-6">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#990011] border-t-transparent" />
            </div>
          )}

          {isPending && (
            <div className="flex items-start gap-2.5 rounded-[7px] bg-[#FFF7E8] px-3.5 py-3">
              <Info size={18} className="mt-0.5 shrink-0 text-[#D97706]" />
              <span className="text-[10px] leading-4 text-[#D97706]">
                {ins.approvedRequestPendingInfo ||
                  "Yêu cầu của bạn đang chờ quản trị viên xem xét. Thông tin đã được duyệt hiện tại vẫn đang có hiệu lực."}
              </span>
            </div>
          )}

          {status === "Rejected" && rejectReason && (
            <div className="flex flex-col gap-1 rounded-[7px] bg-[#FEF3F2] px-3.5 py-3">
              <span className="text-[11px] font-semibold text-[#F52235]">
                {ins.approvedRequestRejectReason ||
                  ins.rejectReason ||
                  "Lý do từ chối"}
              </span>
              <span className="text-xs text-[#F52235]">{rejectReason}</span>
            </div>
          )}
        </div>
      </ProfileDrawer>

      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={ins.approvedRequestDeleteTitle || "Xóa đơn yêu cầu"}
        message={
          ins.approvedRequestDeleteMessage ||
          "Bạn có chắc chắn muốn xóa đơn yêu cầu này không? Hành động này không thể hoàn tác."
        }
        cancelText={ins.approvedCancelEdit || "Hủy"}
        confirmText={ins.approvedRequestDeleteConfirm || "Xóa"}
        isPending={isDeleting}
      />
    </>
  )
}

export default RequestDetailDrawer
