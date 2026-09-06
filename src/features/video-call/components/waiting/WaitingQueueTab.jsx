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
    pollingInterval: 10000,
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

  const busy = isAdmitting || isRejecting || isInviting

  if (isLoading && !queue) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
        <Loader2 size={16} className="animate-spin" />
        <span>{wq.loading || "Đang tải danh sách chờ..."}</span>
      </div>
    )
  }

  if (pending.length === 0 && mergedExternal.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
        <Clock size={28} className="text-neutral-300" />
        <p className="text-sm text-neutral-500">{wq.empty || "Chưa có ai đang chờ duyệt."}</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-1 p-1">
      {pending.map((entry) => (
        <li
          key={entry.accountId}
          className="flex items-center gap-2 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-800">
              {wq.userLabel || "Người dùng"} #{entry.accountId}
            </p>
            <p className="text-xs text-neutral-500">
              {(wq.pendingLabel || "Đang chờ duyệt")}
              {entry.decidedBy != null ? ` • ${wq.rejectedLabel || "Đã từ chối trước đó"}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAdmit(entry.accountId)}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <UserCheck size={14} />
            <span>{wq.admit || "Duyệt"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleReject(entry.accountId)}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-white px-2.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
          >
            <UserX size={14} />
            <span>{wq.reject || "Từ chối"}</span>
          </button>
        </li>
      ))}

      {mergedExternal.map((p) => (
        <li
          key={`ext-${p.accountId}`}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-800">
              {p.name || `${wq.userLabel || "Người dùng"} #${p.accountId}`}
            </p>
            <p className="truncate text-xs text-neutral-500">
              {p.email || (wq.enrollmentPending || "Chờ duyệt ghi danh")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleInvite(p.accountId)}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={14} />
            <span>{wq.invite || "Mời"}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default WaitingQueueTab
