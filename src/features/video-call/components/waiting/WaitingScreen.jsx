import React, { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { Loader2, UserX, DoorOpen, X, ArrowLeft } from "lucide-react"
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

const formatDuration = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`

/**
 * Live elapsed counter for the pending state — proves the request is still
 * alive. Mounted with a key so it restarts cleanly for each new request; the
 * interval lives in an async callback, so no setState happens in the effect
 * body.
 */
const WaitingElapsed = ({ label }) => {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <p className="mt-3 text-xs font-medium tabular-nums text-neutral-400">
      {label.replace("{time}", formatDuration(seconds))}
    </p>
  )
}

/**
 * Ticket 04 — pre-join waiting screen (knock / pending / rejected), rendered
 * BEFORE the LiveKit token is fetched so no mic/camera publishes while waiting.
 * Admitted is not a screen: the caller joins immediately and surfaces a toast
 * (see PreJoinWaitingGate), so this renders nothing for that status.
 *
 * UX: one focused card over a blurred scrim, a distinct icon + copy per state,
 * a live elapsed timer while pending (so the wait never feels frozen), and a
 * recovery action on rejection (guideline: never a dead-end error).
 */
export const WaitingScreen = ({
  entry,
  roomName,
  isKnocking,
  onKnock,
  onCancel,
}) => {
  const { t } = useLanguage()
  const wq = t?.rooms?.videoCall?.waitingQueue || {}
  const status = entry?.status ?? null

  const isPending = status === WAITING_STATUS.PENDING
  const isRejected = status === WAITING_STATUS.REJECTED

  if (status === WAITING_STATUS.ADMITTED) return null

  const title = isPending
    ? wq.waitingTitle || "Đang chờ duyệt vào phòng..."
    : isRejected
      ? wq.rejectedTitle || "Yêu cầu vào phòng bị từ chối"
      : wq.knockTitle || "Xin vào phòng"

  const description = isPending
    ? wq.waitingDesc ||
      "Yêu cầu của bạn đã được gửi. Màn hình sẽ tự động mở khi host/co-host duyệt."
    : isRejected
      ? wq.rejectedHint ||
        "Bạn đã bị từ chối. Vui lòng chờ được mời lại mới có thể xin vào tiếp."
      : status === WAITING_STATUS.CANCELLED
        ? wq.cancelledHint || "Yêu cầu đã hủy. Bạn có thể gõ cửa lại."
        : wq.knockDesc ||
          "Phòng đang bật chế độ duyệt. Hãy gõ cửa và chờ host/co-host cho vào."

  const badgeClass = isPending
    ? "bg-amber-50 text-amber-600"
    : isRejected
      ? "bg-red-50 text-red-600"
      : "bg-cath-red-700/10 text-cath-red-700"

  const secondaryLabel = isRejected
    ? wq.back || "Quay lại"
    : isPending
      ? wq.cancel || "Hủy yêu cầu"
      : wq.back || "Quay lại"

  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center bg-white/80 px-4 backdrop-blur-md">
      <div
        role={isRejected ? "alert" : isPending ? "status" : undefined}
        aria-live={isRejected ? "assertive" : isPending ? "polite" : undefined}
        aria-busy={isPending || isKnocking ? "true" : undefined}
        aria-labelledby="waiting-room-title"
        aria-describedby="waiting-room-desc"
        className="w-full max-w-sm animate-enter rounded-2xl border border-neutral-200/80 bg-white p-6 text-center shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] motion-reduce:animate-none"
      >
        <span
          aria-hidden="true"
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${badgeClass}`}
        >
          {isPending ? (
            <Loader2 size={26} className="animate-spin" />
          ) : isRejected ? (
            <UserX size={26} />
          ) : (
            <DoorOpen size={26} />
          )}
        </span>

        <h2
          id="waiting-room-title"
          className="mt-4 text-lg font-bold text-neutral-900"
        >
          {title}
        </h2>

        {roomName && (
          <span className="mx-auto mt-2 flex max-w-[85%] items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            <DoorOpen size={13} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{roomName}</span>
          </span>
        )}

        <p
          id="waiting-room-desc"
          className="mt-3 text-sm leading-relaxed text-neutral-500"
        >
          {description}
        </p>

        {isPending && (
          <WaitingElapsed
            key={entry?.requestedAt || status}
            label={wq.waitingElapsed || "Đang chờ {time}"}
          />
        )}

        <div className="mt-5 flex flex-col gap-2">
          {!isPending && !isRejected && (
            <button
              type="button"
              onClick={onKnock}
              disabled={isKnocking}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-cath-red-700 px-5 text-sm font-semibold text-white transition hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isKnocking ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <DoorOpen size={16} aria-hidden="true" />
              )}
              <span>{wq.knock || "Gõ cửa xin vào"}</span>
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/40 ${
                isPending || isRejected
                  ? "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {isRejected ? (
                <ArrowLeft size={16} aria-hidden="true" />
              ) : isPending ? (
                <X size={16} aria-hidden="true" />
              ) : (
                <ArrowLeft size={16} aria-hidden="true" />
              )}
              <span>{secondaryLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Ticket 04 — pre-join approval gate (owns the knock + realtime personal
 * outcomes). Rendered by VideoCallProvider in the "approval" phase, before any
 * token is fetched. On admission it calls onAdmitted() so the caller proceeds
 * to the normal join/token path.
 */
export const PreJoinWaitingGate = ({
  apiRoomId,
  roomName,
  onAdmitted,
  onCancel,
}) => {
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
    // Admitted UX: a toast instead of a full waiting screen.
    const waitingCopy = t?.rooms?.videoCall?.waitingQueue
    toast.success(
      waitingCopy?.admittedToast ||
        waitingCopy?.admittedTitle ||
        "Đã được duyệt vào phòng!",
    )
    onAdmitted?.()
  }, [onAdmitted, t])

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
      toast.error(
        t?.rooms?.videoCall?.waitingQueue?.rejectedTitle ||
          "Yêu cầu vào phòng bị từ chối",
      )
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
  }, [apiRoomId, dispatch, t])

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
      // Rejection is a terminal state: show the rejected screen (with a
      // recovery action) and announce it with a toast.
      if (code === "ROOM_WAITING_REJECTED") {
        setEntry({ accountId: 0, status: WAITING_STATUS.REJECTED })
        toast.error(wq.rejectedTitle || "Yêu cầu vào phòng bị từ chối")
        return
      }
      toast.error(
        err?.data?.message ||
          (code === "ROOM_LOCKED" ? wq.lockedHint : wq.knockFailed),
      )
    }
  }

  return (
    <WaitingScreen
      entry={effectiveEntry}
      roomName={roomName}
      isKnocking={isKnocking}
      onKnock={handleKnock}
      onCancel={handleCancel}
    />
  )
}

export default WaitingScreen
