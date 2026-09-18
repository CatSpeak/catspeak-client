import React from "react"
import { toast } from "react-hot-toast"
import { UserCheck, UserX, Send, Loader2, Clock } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetWaitingQueueQuery,
  useAdmitWaitingMutation,
  useRejectWaitingMutation,
  useInviteToRoomMutation,
} from "@/store/api/roomsApi"
import { resolveCoHostErrorMessage } from "@/features/co-host/errors"
import { normalizeWaitingQueue } from "./waitingUtils"

/**
 * Ticket 03 — host/co-host "Chờ" tab in live.
 * Lists knock requests (pending) + decided entries, with Duyệt / Từ chối.
 *
 * @param {number} roomId live room id (Class rooms share the cath-api RoomId).
 * @param {Array<{accountId:number,name?:string,email?:string}>} externalPending
 *  Class pre-fill: Pending enrollments supplied by the Class screen are merged
 *  client-side (cath-api cannot join instructor enrollments). Duplicates
 *  already in the queue are hidden. Custom rooms rely solely on knock.
 */
const WaitingQueueTab = ({ roomId, externalPending = [] }) => {
  const { t } = useLanguage()
  const wq = t?.rooms?.videoCall?.waitingQueue || {}
  const pl = t?.rooms?.videoCall?.participantList || {}

  const { data, isLoading, refetch } = useGetWaitingQueueQuery(roomId, {
    skip: !roomId,
  })
  const [admitWaiting, { isLoading: isAdmitting }] = useAdmitWaitingMutation()
  const [rejectWaiting, { isLoading: isRejecting }] = useRejectWaitingMutation()
  const [inviteToRoom, { isLoading: isInviting }] = useInviteToRoomMutation()

  const queue = normalizeWaitingQueue(data)
  const pending = queue?.pending ?? []
  const pendingIds = new Set(pending.map((e) => String(e.accountId)))
  // Class pre-fill: show Pending enrollments not yet in the knock queue.
  const mergedExternal = (externalPending ?? []).filter(
    (p) => p?.accountId != null && !pendingIds.has(String(p.accountId))
  )

  const handleAdmit = async (targetAccountId) => {
    try {
      await admitWaiting({ id: roomId, targetAccountId: Number(targetAccountId) }).unwrap()
      toast.success(wq.admitSuccess || "Đã duyệt vào phòng.")
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(err, t, wq.forbiddenAdmit || pl.forbiddenKick || "Bạn không có quyền duyệt phòng chờ.")
      )
    }
  }

  const handleReject = async (targetAccountId) => {
    try {
      await rejectWaiting({ id: roomId, targetAccountId: Number(targetAccountId) }).unwrap()
      toast.success(wq.rejectSuccess || "Đã từ chối yêu cầu vào phòng.")
    } catch (err) {
      toast.error(
        resolveCoHostErrorMessage(err, t, wq.forbiddenAdmit || pl.forbiddenKick || "Bạn không có quyền duyệt phòng chờ.")
      )
    }
  }

  const handleInvite = async (targetAccountId) => {
    try {
      await inviteToRoom({ roomId, accountIds: [Number(targetAccountId)] }).unwrap()
      // Invite lifts the waiting-reject block backend-side — refresh the list.
      refetch()
      toast.success(wq.inviteSuccess || "Đã gửi lời mời vào phòng.")
    } catch (err) {
      toast.error(err?.data?.message || wq.inviteFailed || "Không thể gửi lời mời. Vui lòng thử lại.")
    }
  }

  const handleAdmitAll = async () => {
    if (pending.length === 0) return
    const toastId = toast.loading(wq.admittingAll || "Đang duyệt tất cả...")
    let successCount = 0
    for (const entry of pending) {
      try {
        await admitWaiting({ id: roomId, targetAccountId: Number(entry.accountId) }).unwrap()
        successCount++
      } catch (e) {
        console.error("Admit error for", entry.accountId, e)
      }
    }
    toast.dismiss(toastId)
    if (successCount > 0) {
      toast.success(wq.admitAllSuccess ? wq.admitAllSuccess.replace("{count}", String(successCount)) : `Đã duyệt ${successCount} người vào phòng.`)
    } else {
      toast.error(wq.admitAllFailed || "Không thể duyệt danh sách. Vui lòng thử lại.")
    }
  }

  const busy = isAdmitting || isRejecting || isInviting

  if (isLoading && !queue) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-neutral-400">
        <Loader2 size={22} className="animate-spin text-cath-red-700" />
        <span>{wq.loading || "Đang tải danh sách chờ..."}</span>
      </div>
    )
  }

  if (pending.length === 0 && mergedExternal.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Clock size={24} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-neutral-800">
              {wq.empty || "Chưa có ai đang chờ duyệt"}
            </span>
            <span className="text-xs text-neutral-500 max-w-xs">
              {wq.emptyDesc || "Những người tham gia gửi yêu cầu vào phòng sẽ xuất hiện tại đây."}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      {pending.length > 1 && (
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {pending.length} {wq.pendingCountLabel || "yêu cầu chờ"}
          </span>
          <button
            type="button"
            onClick={handleAdmitAll}
            disabled={busy}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 text-xs font-semibold text-white transition-all shadow-xs active:scale-[0.98] disabled:opacity-50"
          >
            <UserCheck size={13} />
            <span>{wq.admitAll || "Duyệt tất cả"}</span>
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-1.5">
        {pending.map((entry) => (
          <li
            key={entry.accountId}
            className="flex items-center justify-between gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 p-2.5 transition-colors hover:bg-amber-50/70"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-neutral-800">
                {wq.userLabel || "Người dùng"} #{entry.accountId}
              </p>
              <p className="text-[11px] text-neutral-500">
                {(wq.pendingLabel || "Đang chờ duyệt")}
                {entry.decidedBy != null ? ` • ${wq.rejectedLabel || "Đã từ chối trước đó"}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleAdmit(entry.accountId)}
                disabled={busy}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                <UserCheck size={14} />
                <span>{wq.admit || "Duyệt"}</span>
              </button>
              <button
                type="button"
                onClick={() => handleReject(entry.accountId)}
                disabled={busy}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-white px-2.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                <UserX size={14} />
                <span>{wq.reject || "Từ chối"}</span>
              </button>
            </div>
          </li>
        ))}

        {mergedExternal.map((p) => (
          <li
            key={`ext-${p.accountId}`}
            className="flex items-center justify-between gap-2.5 rounded-xl border border-neutral-200/90 bg-white p-2.5 transition-colors hover:bg-neutral-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-neutral-800">
                {p.name || `${wq.userLabel || "Người dùng"} #${p.accountId}`}
              </p>
              <p className="truncate text-[11px] text-neutral-500">
                {p.email || (wq.enrollmentPending || "Chờ duyệt ghi danh")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInvite(p.accountId)}
              disabled={busy}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white hover:bg-blue-700 active:scale-[0.97] transition-all disabled:opacity-50 shrink-0"
            >
              <Send size={14} />
              <span>{wq.invite || "Mời"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WaitingQueueTab
