import React, { useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { Crown } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import CoHostModal from "./CoHostModal"
import CoHostBadge from "./CoHostBadge"

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
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const hasCoHost = coHost?.coHostAccountId != null
  const buttonLabel = hasCoHost ? "Quản lý co-host" : "Thêm Co-host"

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
          toast.success("Đã cập nhật quyền co-host.")
        } else {
          await onAssign?.({ coHostAccountId, permissions })
          toast.success("Đã thay thế co-host.")
        }
      } else {
        await onAssign?.({ coHostAccountId, permissions })
        toast.success("Đã phân công co-host.")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err?.data?.message || "Không thể phân công co-host. Vui lòng thử lại.")
    }
  }

  const handleRevoke = async () => {
    try {
      await onRevoke?.()
      toast.success("Đã gỡ phân công co-host.")
      setConfirmOpen(false)
      setModalOpen(false)
    } catch (err) {
      toast.error(err?.data?.message || "Không thể gỡ co-host. Vui lòng thử lại.")
    }
  }

  if (!isTeacher) {
    // Non-host view: only badge when they are the co-host is handled by parent.
    return hasCoHost ? <CoHostBadge /> : null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <PillButton
          variant="secondary"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Crown size={14} />
          {buttonLabel}
        </PillButton>
        {hasCoHost && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Gỡ co-host
          </button>
        )}
      </div>

      <CoHostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Phân công Co-host"
        candidates={candidates}
        initialAccountId={initialAccountId}
        initialPermissions={initialPermissions}
        confirmLabel={hasCoHost ? "Lưu thay đổi" : "Phân công Co-host"}
        isSaving={isSaving}
        serverError={serverError}
        onSubmit={handleSubmit}
      />

      {/* Revoke cần confirm riêng (SRS 1.1.3); X trên form chỉ clear, không revoke. */}
      <ConfirmationModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRevoke}
        title="Xác nhận gỡ co-host"
        message="Bạn có chắc muốn gỡ phân công co-host này? Hành động này không thể hoàn tác."
        cancelText="Hủy"
        confirmText="Xóa"
        confirmVariant="destructive"
        isPending={isRevoking}
      />
    </>
  )
}

export default CoHostManager
