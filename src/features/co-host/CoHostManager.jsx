import React, { useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { CheckCircle2, Crown, Plus, UserPlus } from "lucide-react"
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
 * - variant: "default" (page header) | "card" (compact card footer row)
 * - isTeacher: gate assign/revoke UI
 * - onAssign({ coHostAccountId, permissions })
 * - onUpdate({ permissions })
 * - onRevoke()
 * - pending flags
 */
const CoHostManager = ({
  roomName = "",
  roomType = "room",
  variant = "default",
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

  // Compact variants resolve the assigned co-host from the candidate list.
  const assignedCandidate = useMemo(
    () =>
      candidates.find(
        (c) => String(c.accountId) === String(coHost?.coHostAccountId),
      ),
    [candidates, coHost],
  )
  const assignedName =
    assignedCandidate?.name || coHost?.coHostName || coHost?.name || ""
  const assignedInitials = assignedName
    ? assignedName.trim().slice(0, 2).toUpperCase()
    : ""

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
          roomType,
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
          roomType,
        ),
      )
    }
  }

  if (!isTeacher) {
    // Non-host view: only badge when they are the co-host is handled by parent.
    return hasCoHost ? <CoHostBadge /> : null
  }

  const modals = (
    <>
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

  if (variant === "card") {
    return (
      <>
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {hasCoHost ? (
              <>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[10px] font-bold text-white shadow-sm">
                  {assignedInitials || <Crown size={13} aria-hidden="true" />}
                </span>
                <div className="min-w-0 leading-tight">
                  <p
                    className="truncate text-[11px] font-bold text-gray-800"
                    title={assignedName || undefined}
                  >
                    {assignedName ||
                      t.rooms?.assignedCoHost ||
                      "Đã phân công Co-host"}
                  </p>
                  {assignedName && (
                    <p className="text-[10px] font-semibold text-[#8B5A2B]">
                      Co-host
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-[#EDC589] bg-amber-50 text-[#8B5A2B]">
                  <UserPlus size={13} aria-hidden="true" />
                </span>
                <p className="truncate text-[11px] font-medium text-gray-500">
                  {t.rooms?.coHost?.emptyShort || emptyLabel}
                </p>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-amber-600 bg-amber-50 px-2.5 text-[11px] font-bold text-[#8B5A2B] shadow-sm transition-all duration-150 hover:bg-amber-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
            >
              {hasCoHost ? (
                <Crown size={11} aria-hidden="true" />
              ) : (
                <Plus size={11} aria-hidden="true" />
              )}
              {hasCoHost
                ? t.rooms?.coHost?.manageShort ||
                  t.rooms?.coHost?.manage ||
                  "Quản lý"
                : t.rooms?.coHost?.add || "Thêm Co-host"}
            </button>
            {hasCoHost && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex h-7 items-center rounded-full px-2 text-[11px] font-semibold text-red-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                {t.rooms?.coHost?.remove || "Gỡ"}
              </button>
            )}
          </div>
        </div>
        {modals}
      </>
    )
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
              <Crown size={12} className="shrink-0" aria-hidden="true" />
            ) : (
              <UserPlus size={12} className="shrink-0" aria-hidden="true" />
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
      {modals}
    </>
  )
}

export default CoHostManager
