import React, { useState } from "react"
import { Users, PhoneOff, ArrowRight, MessageSquare, LogIn, LogOut, Loader2, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useDispatch, useSelector } from "react-redux"
import {
  useGetBreakoutStatusQuery,
  useStopBreakoutRoomsMutation,
  useJoinBreakoutRoomMutation,
  useMoveParticipantMutation,
  useBroadcastBreakoutNotificationMutation,
} from "@/store/api/roomsApi"
import { enterBreakout, exitBreakout, updateLivekitToken } from "@/store/slices/videoCallSlice"

const BreakoutSidebar = ({ sessionId }) => {
  const { t } = useLanguage()
  const dispatch = useDispatch()

  const { isBreakoutActive: isLocalBreakoutActive, callInfo } = useSelector((s) => s.videoCall)
  const currentSubSessionId = callInfo?.sessionId

  // Fetch breakout status from backend
  const { data: status, isLoading, error } = useGetBreakoutStatusQuery(sessionId, {
    pollingInterval: 15000, // Poll every 15s as fallback, but SignalR invalidates it anyway
  })

  const [stopBreakoutRooms, { isLoading: isStopping }] = useStopBreakoutRoomsMutation()
  const [joinBreakoutRoom, { isLoading: isJoiningRoom }] = useJoinBreakoutRoomMutation()
  const [moveParticipant, { isLoading: isMovingPart }] = useMoveParticipantMutation()
  const [broadcastNotification, { isLoading: isBroadcasting }] = useBroadcastBreakoutNotificationMutation()

  const [broadcastMsg, setBroadcastMsg] = useState("")

  // Handle Stop Breakout Rooms
  const handleStopBreakouts = async () => {
    try {
      await stopBreakoutRooms(sessionId).unwrap()
      dispatch(exitBreakout())
      toast.success("Đã kết thúc chia nhóm phòng nhỏ.")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi kết thúc phòng nhỏ.")
    }
  }

  // Handle Teacher Hopping into a breakout room
  const handleTeacherJoin = async (subSessionId, roomName) => {
    try {
      const res = await joinBreakoutRoom({ sessionId, subSessionId }).unwrap()
      dispatch(enterBreakout({ subSessionId, roomName, token: res.token }))
      toast.success(`Đã tham gia: ${roomName}`)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi tham gia phòng nhỏ.")
    }
  }

  // Handle Teacher returning to Main Room
  const handleTeacherLeave = async () => {
    try {
      const res = await joinBreakoutRoom({ sessionId, subSessionId: sessionId }).unwrap()
      dispatch(exitBreakout())
      dispatch(updateLivekitToken(res.token))
      toast.success("Đã quay trở lại phòng học chính.")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi quay lại phòng học chính.")
    }
  }

  // Handle Student relocation via dropdown
  const handleRelocateStudent = async (accountId, targetSubSessionId) => {
    try {
      await moveParticipant({ sessionId, accountId, targetSubSessionId }).unwrap()
      toast.success("Đã di chuyển học viên.")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi di chuyển học viên.")
    }
  }

  // Handle Send global broadcast message
  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!broadcastMsg.trim()) return

    try {
      await broadcastNotification({ sessionId, message: broadcastMsg.trim() }).unwrap()
      setBroadcastMsg("")
      toast.success("Đã phát thông báo thành công!")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi phát thông báo.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-primary2 mb-2" />
        <p className="text-xs">Đang tải danh sách phòng nhỏ...</p>
      </div>
    )
  }

  if (error || !status) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-slate-400">
        <AlertCircle className="h-6 w-6 text-red-400 mb-2" />
        <p className="text-xs">Không thể kết nối danh sách chia phòng.</p>
      </div>
    )
  }

  const isTeacherInSubRoom = currentSubSessionId !== sessionId

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Sidebar Header */}
      <div className="border-b border-slate-100 p-4 bg-slate-50/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Breakout Rooms Đang hoạt động</span>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold animate-pulse">
            LIVE
          </span>
        </div>
        
        {isTeacherInSubRoom ? (
          <button
            onClick={handleTeacherLeave}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 text-xs font-bold transition mb-2"
          >
            <LogOut className="h-3.5 w-3.5" /> Rời phòng nhỏ về Phòng chính
          </button>
        ) : null}

        <button
          onClick={handleStopBreakouts}
          disabled={isStopping}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 text-xs font-bold transition"
        >
          <PhoneOff className="h-3.5 w-3.5" /> Kết thúc chia nhóm
        </button>
      </div>

      {/* Breakout Rooms List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {status.breakoutSessions?.map((room) => {
          const isHostInThisRoom = currentSubSessionId === room.sessionId

          return (
            <div
              key={room.sessionId}
              className={`rounded-xl border p-3 transition shadow-sm ${
                isHostInThisRoom
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "border-slate-100 bg-slate-50/40"
              }`}
            >
              {/* Room title & join button */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{room.roomName}</h4>
                  <span className="text-[10px] text-slate-500">{room.participants?.length || 0} học viên</span>
                </div>

                {!isHostInThisRoom ? (
                  <button
                    onClick={() => handleTeacherJoin(room.sessionId, room.roomName)}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary2 hover:text-primary2-dark px-2.5 py-1 rounded-lg border border-primary2/20 hover:bg-primary2/5 bg-white transition"
                  >
                    <LogIn className="h-3 w-3" /> Vào phòng
                  </button>
                ) : (
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-bold">
                    Đang ở đây
                  </span>
                )}
              </div>

              {/* Participants list */}
              <div className="space-y-1.5 pl-2 border-l border-slate-200">
                {room.participants?.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">Trống</span>
                ) : (
                  room.participants.map((p) => (
                    <div key={p.accountId} className="flex items-center justify-between text-[11px] text-slate-600 py-0.5">
                      <span className="truncate max-w-[120px] font-medium">{p.username}</span>
                      <select
                        onChange={(e) => handleRelocateStudent(p.accountId, Number(e.target.value))}
                        value={room.sessionId}
                        className="text-[9px] bg-white border border-slate-200 rounded px-1 py-0.5 focus:outline-none text-slate-500"
                      >
                        {status.breakoutSessions.map((br) => (
                          <option key={br.sessionId} value={br.sessionId}>
                            {br.roomName}
                          </option>
                        ))}
                        <option value={sessionId}>Phòng chính</option>
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Broadcast Announcement Bar */}
      <form onSubmit={handleBroadcast} className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Phát thông báo toàn phòng
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập thông báo gửi tới tất cả..."
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-primary2 focus:ring-1 focus:ring-primary2"
          />
          <button
            type="submit"
            disabled={isBroadcasting || !broadcastMsg.trim()}
            className="rounded-xl bg-primary2 hover:bg-primary2-dark text-white px-3 py-1.5 text-xs font-bold transition shadow-sm shadow-primary2/10"
          >
            Gửi
          </button>
        </div>
      </form>
    </div>
  )
}

export default BreakoutSidebar
