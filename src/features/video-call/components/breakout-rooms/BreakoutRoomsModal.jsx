import React, { useState, useEffect } from "react"
import { X, Users, RefreshCw, AlertCircle, Clock, Settings, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSetupBreakoutGroupsMutation, useStartBreakoutRoomsMutation } from "@/store/api/roomsApi"
import PillButton from "@/shared/components/ui/buttons/PillButton"

const BreakoutRoomsModal = ({ isOpen, onClose, sessionId, participants = [], roomCreatorId }) => {
  const { t } = useLanguage()
  const [setupBreakoutGroups, { isLoading: isSaving }] = useSetupBreakoutGroupsMutation()
  const [startBreakoutRooms, { isLoading: isStarting }] = useStartBreakoutRoomsMutation()

  // Form states
  const [roomCount, setRoomCount] = useState(2)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerDuration, setTimerDuration] = useState(10) // 10 minutes default
  const [allowChangeRoom, setAllowChangeRoom] = useState(false)
  const [maxParticipantsEnabled, setMaxParticipantsEnabled] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState(5)

  // Students list (excluding the teacher/host)
  const students = participants.filter((p) => p.identity !== String(roomCreatorId))

  // Local allocations state: Array of { roomName, accountIds: [] }
  const [allocations, setAllocations] = useState([])

  // Initialize/Reset allocations when roomCount changes
  useEffect(() => {
    const initial = Array.from({ length: roomCount }, (_, i) => ({
      roomName: `Phòng ${i + 1}`,
      accountIds: [],
    }))
    setAllocations(initial)
  }, [roomCount])

  // Random allocation helper
  const handleRandomAssign = () => {
    if (students.length === 0) {
      toast.error("Không có học viên nào hoạt động trong phòng học.")
      return
    }

    const shuffled = [...students].sort(() => Math.random() - 0.5)
    const newAllocations = Array.from({ length: roomCount }, (_, i) => ({
      roomName: `Phòng ${i + 1}`,
      accountIds: [],
    }))

    shuffled.forEach((student, index) => {
      const roomIndex = index % roomCount
      const accountId = Number(student.identity)
      if (accountId) {
        newAllocations[roomIndex].accountIds.push(accountId)
      }
    })

    setAllocations(newAllocations)
    toast.success("Phân chia ngẫu nhiên thành công!")
  }

  // Handle single student room relocation
  const handleMoveStudent = (studentAccountId, targetRoomIndex) => {
    setAllocations((prev) =>
      prev.map((room, rIndex) => {
        // Remove from source if present
        const filtered = room.accountIds.filter((id) => id !== studentAccountId)
        // Add to target if index matches
        if (rIndex === targetRoomIndex) {
          return {
            ...room,
            accountIds: [...filtered, studentAccountId],
          }
        }
        return {
          ...room,
          accountIds: filtered,
        }
      })
    )
  }

  // Handle save configurations
  const handleSave = async (startImmediately = false) => {
    // Validate that at least one student is assigned somewhere
    const totalAssigned = allocations.reduce((acc, curr) => acc + curr.accountIds.length, 0)
    if (totalAssigned === 0 && students.length > 0) {
      toast.error("Vui lòng phân bổ ít nhất một học viên vào phòng nhỏ.")
      return
    }

    try {
      const setupPayload = {
        sessionId,
        groups: allocations.map((r) => ({
          roomName: r.roomName,
          accountIds: r.accountIds,
        })),
        timerDuration: timerEnabled ? timerDuration * 60 : null, // Convert minutes to seconds
        allowParticipantChangeRoom: allowChangeRoom,
        maxParticipantsPerRoom: maxParticipantsEnabled ? maxParticipants : null,
      }

      await setupBreakoutGroups(setupPayload).unwrap()

      if (startImmediately) {
        await startBreakoutRooms(sessionId).unwrap()
        toast.success("Đã lưu cấu hình và bắt đầu phòng nhỏ thành công!")
        onClose()
      } else {
        toast.success("Lưu cấu hình chia phòng thành công!")
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || "Lỗi lưu cấu hình chia phòng.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden text-slate-800"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary2" />
            <h2 className="text-lg font-bold text-slate-900">Thiết lập Breakout Rooms</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Settings */}
          <div className="w-80 border-r border-slate-100 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Số lượng phòng</label>
              <select
                value={roomCount}
                onChange={(e) => setRoomCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary2 focus:ring-1 focus:ring-primary2"
              >
                {[2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Phòng Nhỏ
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Cấu hình phòng nhỏ</label>

              {/* Timer Config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Clock className="h-4 w-4 text-slate-400" /> Hẹn giờ thảo luận
                  </span>
                  <input
                    type="checkbox"
                    checked={timerEnabled}
                    onChange={(e) => setTimerEnabled(e.target.checked)}
                    className="h-4 w-4 rounded text-primary2 focus:ring-primary2"
                  />
                </div>
                {timerEnabled && (
                  <div className="flex items-center gap-2 pl-6">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(Math.max(1, Number(e.target.value)))}
                      className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-center"
                    />
                    <span className="text-xs text-slate-500">phút</span>
                  </div>
                )}
              </div>

              {/* Change Room Config */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Settings className="h-4 w-4 text-slate-400" /> Cho phép đổi nhóm
                </span>
                <input
                  type="checkbox"
                  checked={allowChangeRoom}
                  onChange={(e) => setAllowChangeRoom(e.target.checked)}
                  className="h-4 w-4 rounded text-primary2 focus:ring-primary2"
                />
              </div>

              {/* Max Participants Config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <ShieldAlert className="h-4 w-4 text-slate-400" /> Giới hạn thành viên
                  </span>
                  <input
                    type="checkbox"
                    checked={maxParticipantsEnabled}
                    onChange={(e) => setMaxParticipantsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded text-primary2 focus:ring-primary2"
                  />
                </div>
                {maxParticipantsEnabled && (
                  <div className="flex items-center gap-2 pl-6">
                    <input
                      type="number"
                      min={1}
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(Math.max(1, Number(e.target.value)))}
                      className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-center"
                    />
                    <span className="text-xs text-slate-500">thành viên/phòng</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleRandomAssign}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-semibold transition"
              >
                <RefreshCw className="h-4 w-4" /> Phân bổ ngẫu nhiên
              </button>
            </div>
          </div>

          {/* Right Panel: Rooms allocation */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/20">
            {students.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400">
                <AlertCircle className="h-10 w-10 mb-2" />
                <p className="text-sm">Chưa có học viên nào tham gia phòng học.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {allocations.map((room, roomIndex) => (
                  <div key={roomIndex} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-3">
                      <span className="font-bold text-slate-900 text-sm">{room.roomName}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                        {room.accountIds.length} học viên
                      </span>
                    </div>

                    {/* Room Students List */}
                    <div className="min-h-[120px] max-h-[160px] overflow-y-auto space-y-2 mb-2 pr-1">
                      {room.accountIds.length === 0 ? (
                        <div className="text-xs text-slate-400 italic text-center py-6">Kéo học viên vào đây hoặc phân ngẫu nhiên</div>
                      ) : (
                        room.accountIds.map((studentId) => {
                          const student = students.find((s) => s.identity === String(studentId))
                          if (!student) return null
                          const metadata = student.metadata ? JSON.parse(student.metadata) : {}
                          return (
                            <div key={studentId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-100/50">
                              <span className="text-xs font-semibold text-slate-700 truncate">{student.name || `User #${studentId}`}</span>
                              <select
                                value={roomIndex}
                                onChange={(e) => handleMoveStudent(studentId, Number(e.target.value))}
                                className="text-[10px] bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-600 focus:outline-none"
                              >
                                {allocations.map((_, idx) => (
                                  <option key={idx} value={idx}>
                                    Chuyển: Phòng {idx + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
          <PillButton
            onClick={onClose}
            variant="secondary"
            className="h-10 text-sm px-5"
          >
            Hủy
          </PillButton>
          <PillButton
            onClick={() => handleSave(false)}
            loading={isSaving}
            disabled={isSaving || isStarting}
            variant="outline"
            className="h-10 text-sm px-5"
          >
            Lưu cấu hình
          </PillButton>
          <PillButton
            onClick={() => handleSave(true)}
            loading={isStarting}
            disabled={isSaving || isStarting}
            variant="primary"
            className="h-10 text-sm px-5"
          >
            Bắt đầu nhóm nhỏ
          </PillButton>
        </div>
      </motion.div>
    </div>
  )
}

export default BreakoutRoomsModal
