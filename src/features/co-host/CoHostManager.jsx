import React, { useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { CheckCircle2, Crown, UserPlus } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import CoHostModal from "./CoHostModal"
import CoHostBadge from "./CoHostBadge"
import { resolveCoHostErrorMessage } from "./errors"

/**
 * Reusable co-host manager (ticket 01).
 * Props:
 * - coHost: current dto | null (null = none assigned)
 * - candidates: [{ accountId, name, email, badge? }]
 * - isTeacher: gate assign/revoke UI
 * - onAssign({ coHostAccountId, permissions })
 * - onUpdate({ permissions })
 * - onRevoke()
 * - pending flags
 */
const CoHostManager = ({
  roomName = "",
  roomType = "room",
  coHost,
  candidates = [],
  isTeacher = false,
  onAssign,
  onUpdate,
  onRevoke,
  isSaving = false,
  isRevoking = false,
  serverError = "",
}) => {
  const { t } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [revokeSuccessOpen, setRevokeSuccessOpen] = useState(false)

  const hasCoHost = coHost?.coHostAccountId != null
  const buttonLabel = hasCoHost ? (t.rooms?.coHost?.manage || "Quản lý co-host") : (t.rooms?.coHost?.add || "Thêm Co-host")
  const emptyLabel =
    roomType === "class"
      ? (t.rooms?.coHost?.emptyClass ||
        "Chưa có Co-host được phân công cho lớp học")
      : (t.rooms?.coHost?.emptyRoom ||
        "Chưa có Co-host được phân công cho phòng này")

  const initialAccountId = coHost?.coHostAccountId ?? null
  const initialPermissions = useMemo(
    () => coHost?.permissions ?? [],
    [coHost],
  )

  const handleSubmit = async ({ coHostAccountId, permissions }) => {
    try {
      if (hasCoHost) {
        // Same person -> update permissions; different person -> replace (assign).
        const samePerson =
          String(coHost?.coHostAccountId) === String(coHostAccountId)
        if (samePerson) {
          await onUpdate?.({ permissions })
          toast.success(t.rooms?.coHost?.permissionsUpdated || "Đã cập nhật quyền co-host.")
        } else {
          await onAssign?.({ coHostAccountId, permissions })
          toast.success(t.rooms?.coHost?.replaced || "Đã thay thế co-host.")
        }
      } else {
        await onAssign?.({ coHostAccountId, permissions })
        toast.success(t.rooms?.coHost?.assigned || "Đã phân công co-host.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          err?.data?.message || t.rooms?.coHost?.assignError || "Không thể phân công co-host. Vui lòng thử lại.",
        ),
      )
    }
  }

  const handleRevoke = async () => {
    try {
      await onRevoke?.()
      setConfirmOpen(false)
      setModalOpen(false)
      setRevokeSuccessOpen(true)
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(
          err,
          t,
          err?.data?.message || t.rooms?.coHost?.revokeError || "Không thể gỡ co-host. Vui lòng thử lại.",
        ),
      )
    }
  }

  if (!isTeacher) {
    // Non-host view: only badge when they are the co-host is handled by parent.
    return hasCoHost ? <CoHostBadge /> : null
  }

  return (
    <>
      <div className="flex w-full flex-col gap-2">
        {!hasCoHost && (
          <div className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50/70 px-3 py-2 text-xs font-medium text-gray-500">
            {emptyLabel}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 active:scale-[0.97] transition-all duration-150 shadow-sm"
          >
            {hasCoHost ? (
              <Crown size={12} className="shrink-0" />
            ) : (
              <UserPlus size={12} className="shrink-0" />
            )}
            {buttonLabel}
          </button>
          {hasCoHost && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline transition-colors duration-150"
            >
              {t.rooms?.coHost?.remove || "Gỡ"}
            </button>
          )}
        </div>
      </div>

      <CoHostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t.rooms?.coHost?.assignCoHost || "Phân công Co-host"}
        roomName={roomName}
        roomType={roomType}
        candidates={candidates}
        initialAccountId={initialAccountId}
        initialPermissions={initialPermissions}
        confirmLabel={hasCoHost ? (t.rooms?.coHost?.saveChanges || "Lưu thay đổi") : (t.rooms?.coHost?.assignCoHost || "Phân công Co-host")}
        isSaving={isSaving}
        serverError={serverError}
        onSubmit={handleSubmit}
      />

      {/* Revoke cần confirm riêng (SRS 1.1.3); X trên form chỉ clear, không revoke. */}
      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRevoke}
        title={t.rooms?.coHost?.confirmRevokeTitle || "Xác nhận gỡ co-host"}
        message={t.rooms?.coHost?.confirmRevokeMessage || "Bạn có chắc muốn gỡ phân công co-host này? Hành động này không thể hoàn tác."}
        cancelText={t.rooms?.coHost?.cancel || "Hủy"}
        confirmText={t.rooms?.coHost?.delete || "Xóa"}
        confirmVariant="destructive"
        isPending={isRevoking}
      />

      {/* Modal thành công sau khi thu hồi (SRS 1.1.3); phân công/update giữ toast. */}
      <Modal
        open={revokeSuccessOpen}
        onClose={() => setRevokeSuccessOpen(false)}
        showCloseButton={false}
        bodyClassName="p-6 !mb-0"
        className="max-w-md"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 animate-in zoom-in-75">
            <CheckCircle2 size={30} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1.5">
            {t.rooms?.coHost?.revokeSuccessTitle || "Đã gỡ phân công Co-host!"}
          </h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm leading-relaxed">
            {t.rooms?.coHost?.revokeSuccessMessage ||
              "Phân công Co-host đã được gỡ thành công."}
          </p>
          <PillButton
            onClick={() => setRevokeSuccessOpen(false)}
            className="w-full"
          >
            {t.rooms?.coHost?.done || "Hoàn tất"}
          </PillButton>
        </div>
      </Modal>
    </>
  )
}

export default CoHostManager
