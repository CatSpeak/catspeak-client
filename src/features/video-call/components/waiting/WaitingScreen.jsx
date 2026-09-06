import React, { useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { Loader2, UserX, DoorOpen, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import {
  useGetMyWaitingStatusQuery,
  useKnockWaitingMutation,
} from "@/store/api/roomsApi"
import { normalizeWaitingEntry, knockWithToast, WAITING_STATUS } from "./waitingUtils"

/**
 * Ticket 03 — waiter screen (both Class and Custom rooms).
 * Presentational lobby: knock CTA (no request yet), waiting state (pending),
 * rejected state (knock blocked until invited/admitted again).
 */
export const WaitingScreen = ({ roomId, entry, onKnocked }) => {
  const { t } = useLanguage()
  const wq = t?.rooms?.videoCall?.waitingQueue || {}
  const [knockWaiting, { isLoading: isKnocking }] = useKnockWaitingMutation()

  const handleKnock = async () => {
    await knockWithToast({ roomId, knockWaiting, t })
    onKnocked?.()
  }

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
            {wq.waitingDesc || "Yêu cầu của bạn đã được gửi. Màn hình sẽ tự động mở khi host/co-host duyệt."}
          </p>
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
            {wq.rejectedHint || "Bạn đã bị từ chối. Vui lòng chờ được mời lại mới có thể xin vào tiếp."}
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
            {wq.knockDesc || "Phòng đang bật chế độ duyệt. Hãy gõ cửa và chờ host/co-host cho vào."}
          </p>
          <button
            type="button"
            onClick={handleKnock}
            disabled={isKnocking || !roomId}
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
 * Ticket 03 — lobby gate overlay for VideoCallRoom.
 * Host/co-host bypass (backend also returns admitted for them).
 * Members with no request (null) see the room normally — backward compatible.
 * Pending/rejected viewers see the WaitingScreen until admitted.
 */
export const WaitingGate = ({ children }) => {
  const { t } = useLanguage()
  const wq = t?.rooms?.videoCall?.waitingQueue || {}
  const { id: roomId, room, user, isHost: isHostFromContext } = useVideoCallContext()
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  const { data } = useGetMyWaitingStatusQuery(roomId, {
    skip: !roomId || isHost,
    pollingInterval: 10000,
  })
  const entry = normalizeWaitingEntry(data)
  const prevStatus = useRef(entry?.status)

  useEffect(() => {
    const s = entry?.status
    if (prevStatus.current !== s && s === WAITING_STATUS.ADMITTED) {
      toast.success(wq.admittedToast || "Đã được duyệt vào phòng!")
    }
    prevStatus.current = s
  }, [entry?.status, wq.admittedToast])

  const blocked =
    entry?.status === WAITING_STATUS.PENDING || entry?.status === WAITING_STATUS.REJECTED

  return (
    <div className="relative flex h-full w-full flex-col">
      {children}
      {blocked && <WaitingScreen roomId={roomId} entry={entry} />}
    </div>
  )
}

export default WaitingScreen
