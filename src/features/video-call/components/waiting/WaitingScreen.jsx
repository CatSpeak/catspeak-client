import React, { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { Loader2, UserX, DoorOpen, CheckCircle2, X } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useLanguage } from "@/shared/context/LanguageContext"
import { selectCurrentToken } from "@/store/slices/authSlice"
import {
  useGetMyWaitingStatusQuery,
  useKnockWaitingMutation,
  useCancelWaitingMutation,
  roomsApi,
} from "@/store/api/roomsApi"
import { useVideoChatSignalR } from "@/features/video-call/hooks/useVideoChatSignalR"
import { normalizeWaitingEntry, WAITING_STATUS } from "./waitingUtils"

/**
 * Ticket 04 — pre-join waiting screen. Shown BEFORE the LiveKit token is
 * fetched / mic-camera published. Pending → spinner + cancel; rejected →
 * notice; cancelled/no request → knock CTA.
 */
export const WaitingScreen = ({ entry, isKnocking, onKnock, onCancel }) => {
  const { t } = useLanguage()
  const wq = t?.rooms?.videoCall?.waitingQueue || {}
  const status = entry?.status ?? null

  return (
    <div className="absolute inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-white/95 px-6 text-center backdrop-blur-md">
      {status === WAITING_STATUS.PENDING ? (
        <>
          <Loader2 size={40} className="animate-spin text-amber-500" />
          <h2 className="text-lg font-bold text-neutral-900">
            {wq.waitingTitle || "Đang chờ duyệt vào phòng..."}
          </h2>
          <p className="max-w-sm text-sm text-neutral-500">
            {wq.waitingDesc ||
              "Yêu cầu của bạn đã được gửi. Màn hình sẽ tự động mở khi host/co-host duyệt."}
          </p>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <X size={16} />
              <span>{wq.cancel || "Hủy yêu cầu"}</span>
            </button>
          )}
        </>
      ) : status === WAITING_STATUS.REJECTED ? (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <UserX size={32} className="text-red-500" />
          </span>
          <h2 className="text-lg font-bold text-neutral-900">
            {wq.rejectedTitle || "Yêu cầu vào phòng bị từ chối"}
          </h2>
          <p className="max-w-sm text-sm text-neutral-500">
            {wq.rejectedHint ||
              "Bạn đã bị từ chối. Vui lòng chờ được mời lại mới có thể xin vào tiếp."}
          </p>
        </>
      ) : status === WAITING_STATUS.ADMITTED ? (
        <>
          <CheckCircle2 size={40} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-neutral-900">
            {wq.admittedTitle || "Đã được duyệt vào phòng!"}
          </h2>
        </>
      ) : (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <DoorOpen size={32} className="text-blue-600" />
          </span>
          <h2 className="text-lg font-bold text-neutral-900">
            {wq.knockTitle || "Xin vào phòng"}
          </h2>
          <p className="max-w-sm text-sm text-neutral-500">
            {status === WAITING_STATUS.CANCELLED
              ? wq.cancelledHint || "Yêu cầu đã hủy. Bạn có thể gõ cửa lại."
              : wq.knockDesc ||
                "Phòng đang bật chế độ duyệt. Hãy gõ cửa và chờ host/co-host cho vào."}
          </p>
          <button
            type="button"
            onClick={onKnock}
            disabled={isKnocking}
            className="mt-1 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isKnocking && <Loader2 size={16} className="animate-spin" />}
            <span>{wq.knock || "Gõ cửa xin vào"}</span>
          </button>
        </>
      )}
    </div>
  )
}

/**
 * Ticket 04 — pre-join approval gate (owns the knock + realtime personal
 * outcomes). Rendered by VideoCallProvider in the "approval" phase, before any
 * token is fetched. On admission it calls onAdmitted() so the caller proceeds
 * to the normal join/token path.
 */
export const PreJoinWaitingGate = ({ apiRoomId, onAdmitted, onCancel }) => {
  const { t } = useLanguage()
  const wq = t?.rooms?.videoCall?.waitingQueue || {}
  const token = useSelector(selectCurrentToken)
  const dispatch = useDispatch()

  const [knockWaiting, { isLoading: isKnocking }] = useKnockWaitingMutation()
  const [cancelWaiting] = useCancelWaitingMutation()

  const { data, isLoading } = useGetMyWaitingStatusQuery(apiRoomId, {
    skip: !apiRoomId,
  })

  const [entry, setEntry] = useState(null)
  const knockTriggered = useRef(false)
  const admittedRef = useRef(false)

  const admit = useCallback(() => {
    if (admittedRef.current) return
    admittedRef.current = true
    onAdmitted?.()
  }, [onAdmitted])

  // Prefer local realtime state; fall back to the server snapshot.
  const serverEntry = normalizeWaitingEntry(data)
  const effectiveEntry = entry ?? serverEntry

  const knockFailedMsg = wq.knockFailed

  // Auto-knock when there is no active request yet (once).
  useEffect(() => {
    if (!apiRoomId || isLoading || knockTriggered.current) return
    knockTriggered.current = true
    const status = normalizeWaitingEntry(data)?.status
    if (
      status === WAITING_STATUS.PENDING ||
      status === WAITING_STATUS.REJECTED ||
      status === WAITING_STATUS.ADMITTED
    ) {
      return
    }
    knockWaiting(apiRoomId)
      .unwrap()
      .then((res) => {
        const e = normalizeWaitingEntry(res)
        if (e) setEntry(e)
        if (e?.status === WAITING_STATUS.ADMITTED) admit()
      })
      .catch((err) => {
        const code = err?.data?.errorCode
        if (code === "ROOM_WAITING_REJECTED") {
          setEntry({ accountId: 0, status: WAITING_STATUS.REJECTED })
        } else {
          toast.error(err?.data?.message || knockFailedMsg)
        }
      })
  }, [apiRoomId, isLoading, data, knockWaiting, admit, knockFailedMsg])

  // Proceed as soon as admission is observed (snapshot or realtime).
  useEffect(() => {
    if (effectiveEntry?.status === WAITING_STATUS.ADMITTED) admit()
  }, [effectiveEntry?.status, admit])

  const handleEvent = useCallback((event) => {
    if (event === "WaitingAdmitted") {
      setEntry((prev) => ({ ...(prev || {}), status: WAITING_STATUS.ADMITTED }))
    } else if (event === "WaitingRejected") {
      setEntry((prev) => ({ ...(prev || {}), status: WAITING_STATUS.REJECTED }))
    } else if (event === "WaitingCancelled") {
      // Explicit cancelled status (never null) so the server snapshot cannot
      // resurrect a stale pending entry and re-trigger the admission path.
      setEntry((prev) => ({
        ...(prev || {}),
        status: WAITING_STATUS.CANCELLED,
      }))
      // Pull the authoritative waiting-status snapshot in line with the event.
      if (apiRoomId) {
        dispatch(
          roomsApi.util.invalidateTags([{ type: "WaitingQueue", id: apiRoomId }]),
        )
      }
    }
  }, [apiRoomId, dispatch])

  // Personal outcomes arrive on user_{accountId}; room group for queue changes.
  useVideoChatSignalR(null, token, handleEvent, apiRoomId)

  const handleCancel = async () => {
    try {
      if (apiRoomId) await cancelWaiting(apiRoomId).unwrap()
    } catch {
      /* best-effort */
    }
    onCancel?.()
  }

  const handleKnock = async () => {
    if (!apiRoomId) return
    try {
      const res = await knockWaiting(apiRoomId).unwrap()
      const e = normalizeWaitingEntry(res)
      if (e) setEntry(e)
      if (e?.status === WAITING_STATUS.ADMITTED) admit()
    } catch (err) {
      const code = err?.data?.errorCode
      toast.error(
        err?.data?.message ||
          (code === "ROOM_WAITING_REJECTED"
            ? wq.rejectedHint
            : code === "ROOM_LOCKED"
              ? wq.lockedHint
              : wq.knockFailed),
      )
    }
  }

  return (
    <WaitingScreen
      entry={effectiveEntry}
      isKnocking={isKnocking}
      onKnock={handleKnock}
      onCancel={handleCancel}
    />
  )
}

export default WaitingScreen
