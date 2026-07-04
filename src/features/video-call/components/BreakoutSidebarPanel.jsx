import React, { useState, useEffect, useRef } from "react"
import {
  X,
  Users,
  RefreshCw,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  Loader2,
  AlertCircle,
  MessageSquare,
  StopCircle,
  Volume2,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useSetupBreakoutGroupsMutation,
  useGetBreakoutStatusQuery,
  useStartBreakoutRoomsMutation,
  useStopBreakoutRoomsMutation,
  useJoinBreakoutRoomMutation,
  useMoveParticipantMutation,
  useStudentSwitchBreakoutRoomMutation,
  useToggleAllowChangeRoomMutation,
  useBroadcastBreakoutNotificationMutation,
} from "@/store/api/roomsApi"
import { enterBreakout, exitBreakout, updateLivekitToken } from "@/store/slices/videoCallSlice"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"

const BreakoutSidebarPanel = ({ sessionId, onClose }) => {
  const { t } = useLanguage()
  const dispatch = useDispatch()

  const { isBreakoutActive, breakoutRoomName, callInfo } = useSelector((s) => s.videoCall)
  const { participants: liveParticipants } = useVideoCallContext()
  
  const currentSubSessionId = callInfo?.sessionId
  const roomCreatorId = callInfo?.roomData?.creatorId
  const currentUserId = callInfo?.user?.accountId
  const isHost = Boolean(currentUserId && roomCreatorId && String(currentUserId) === String(roomCreatorId))

  // Fetch breakout status from backend (driven real-time via SignalR)
  const {
    data: status,
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useGetBreakoutStatusQuery(sessionId, {
    skip: !sessionId,
    refetchOnMountOrArgChange: true,
  })

  useEffect(() => {
    if (sessionId) {
      refetchStatus()
    }
  }, [sessionId, refetchStatus])

  // Mutations
  const [setupBreakoutGroups, { isLoading: isSaving }] = useSetupBreakoutGroupsMutation()
  const [startBreakoutRooms, { isLoading: isStarting }] = useStartBreakoutRoomsMutation()
  const [stopBreakoutRooms, { isLoading: isStopping }] = useStopBreakoutRoomsMutation()
  const [joinBreakoutRoom, { isLoading: isJoiningRoom }] = useJoinBreakoutRoomMutation()
  const [moveParticipant, { isLoading: isMovingPart }] = useMoveParticipantMutation()
  const [studentSwitchRoom, { isLoading: isSwitching }] = useStudentSwitchBreakoutRoomMutation()
  const [toggleAllowChangeRoom, { isLoading: isTogglingAllow }] = useToggleAllowChangeRoomMutation()
  const [broadcastNotification, { isLoading: isBroadcasting }] = useBroadcastBreakoutNotificationMutation()

  // Local Setup States
  const [roomCount, setRoomCount] = useState(2)
  const [allowChangeRoom, setAllowChangeRoom] = useState(false)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerDuration, setTimerDuration] = useState(10) // default 10 minutes
  const [maxParticipantsEnabled, setMaxParticipantsEnabled] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState(10)

  // Parse LiveKit metadata helper
  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  // Students list (excluding host) derived from live WebRTC participants
  const students = liveParticipants
    .map((p) => {
      const meta = parseMetadata(p.metadata)
      return {
        accountId: meta.accountId || (p.isLocal ? Number(callInfo?.user?.accountId) : null),
        username: p.name || meta.name || p.identity,
        identity: p.identity,
      }
    })
    .filter((s) => s.accountId && String(s.accountId) !== String(roomCreatorId))

  // Allocation State: Array of { roomName, accountIds: [] }
  const [allocations, setAllocations] = useState([])
  const [expandedRooms, setExpandedRooms] = useState({})

  // Initialize/Reset allocations when roomCount changes
  useEffect(() => {
    if (!status?.isBreakoutActive) {
      const initial = Array.from({ length: roomCount }, (_, i) => ({
        roomName: `Phòng ${i + 1}`,
        accountIds: [],
      }))
      setAllocations(initial)
      
      // Auto expand all rooms by default during setup
      const expandMap = { main: true }
      initial.forEach((r) => {
        expandMap[r.roomName] = true
      })
      setExpandedRooms(expandMap)
    }
  }, [roomCount, status?.isBreakoutActive])

  // Timer Countdown State
  const [countdownSeconds, setCountdownSeconds] = useState(null)
  
  useEffect(() => {
    if (status?.isBreakoutActive && status?.remainingSeconds !== null && status?.remainingSeconds !== undefined) {
      setCountdownSeconds(status.remainingSeconds)
    } else {
      setCountdownSeconds(null)
    }
  }, [status?.isBreakoutActive, status?.remainingSeconds])

  const isTimerRunning = countdownSeconds !== null && countdownSeconds > 0

  useEffect(() => {
    if (!isTimerRunning) return
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerRunning])

  // Format seconds to mm:ss
  const formatTimer = (seconds) => {
    if (seconds === null || seconds < 0) return ""
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  // Toggle Collapse
  const toggleRoomExpand = (roomName) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomName]: !prev[roomName],
    }))
  }

  // Shuffle / Auto allocation
  const handleShuffle = () => {
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
      const accountId = Number(student.accountId || student.id || student.identity)
      if (accountId) {
        newAllocations[roomIndex].accountIds.push(accountId)
      }
    })

    setAllocations(newAllocations)
    toast.success("Đã phân bổ ngẫu nhiên học viên!")
  }

  // Clear allocations
  const handleClearAll = () => {
    setAllocations((prev) =>
      prev.map((r) => ({
        ...r,
        accountIds: [],
      }))
    )
    toast.success("Đã xóa sạch phân phối học viên.")
  }

  // Handle single student reallocation in setup phase
  const handleMoveStudentSetup = (studentAccountId, targetRoomIndex) => {
    setAllocations((prev) =>
      prev.map((room, rIndex) => {
        const filtered = room.accountIds.filter((id) => id !== studentAccountId)
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

  // Start Breakout Rooms
  const handleStartBreakout = async () => {
    const totalAssigned = allocations.reduce((acc, curr) => acc + curr.accountIds.length, 0)
    if (totalAssigned === 0 && students.length > 0) {
      toast.error("Vui lòng phân bổ ít nhất một học viên vào phòng con.")
      return
    }

    try {
      // 1. Setup groups
      const setupPayload = {
        sessionId,
        groups: allocations.map((r) => ({
          roomName: r.roomName,
          accountIds: r.accountIds,
        })),
        timerDuration: timerEnabled ? timerDuration * 60 : null,
        allowParticipantChangeRoom: allowChangeRoom,
        maxParticipantsPerRoom: maxParticipantsEnabled ? maxParticipants : null,
      }

      await setupBreakoutGroups(setupPayload).unwrap()

      // 2. Start rooms
      await startBreakoutRooms(sessionId).unwrap()
      toast.success("Bắt đầu các phòng thảo luận nhỏ!")
      refetchStatus()
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || "Lỗi khởi chạy phòng nhỏ.")
    }
  }

  // Stop Breakout Rooms (Đóng phòng)
  const handleStopBreakouts = async () => {
    try {
      await stopBreakoutRooms(sessionId).unwrap()
      dispatch(exitBreakout())
      toast.success("Đã đóng tất cả các phòng thảo luận nhỏ.")
      refetchStatus()
    } catch (err) {
      console.error(err)
      toast.error("Lỗi đóng các phòng nhỏ.")
    }
  }

  // Relocate student in active phase (API call)
  const handleRelocateStudentActive = async (accountId, targetSubSessionId) => {
    try {
      await moveParticipant({ sessionId, accountId, targetSubSessionId }).unwrap()
      toast.success("Đã di chuyển học viên sang phòng mới.")
      refetchStatus()
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || "Lỗi di chuyển học viên.")
    }
  }

  // Host Join sub-room
  const handleHostJoin = async (subSessionId, roomName) => {
    try {
      const res = await joinBreakoutRoom({ sessionId, subSessionId }).unwrap()
      dispatch(enterBreakout({ subSessionId, roomName, token: res.token }))
      toast.success(`Đã tham gia: ${roomName}`)
    } catch (err) {
      console.error(err)
      toast.error("Lỗi tham gia phòng nhỏ.")
    }
  }

  // Host Return to Main Room
  const handleHostLeave = async () => {
    try {
      const res = await joinBreakoutRoom({ sessionId, subSessionId: sessionId }).unwrap()
      dispatch(exitBreakout())
      dispatch(updateLivekitToken(res.token))
      toast.success("Đã quay trở lại phòng chính.")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi quay trở lại phòng chính.")
    }
  }

  // Send broadcast announcement
  const [broadcastMsg, setBroadcastMsg] = useState("")
  const [showBroadcastInput, setShowBroadcastInput] = useState(false)

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault()
    if (!broadcastMsg.trim()) return

    try {
      await broadcastNotification({ sessionId, message: broadcastMsg.trim() }).unwrap()
      setBroadcastMsg("")
      setShowBroadcastInput(false)
      toast.success("Đã phát thông báo thành công tới tất cả các phòng!")
    } catch (err) {
      console.error(err)
      toast.error("Lỗi gửi thông báo.")
    }
  }

  // Render Setup View
  const renderSetupView = () => {
    // Unassigned students logic
    const assignedIds = allocations.reduce((acc, curr) => [...acc, ...curr.accountIds], [])
    const unassignedStudents = students.filter(
      (s) => !assignedIds.includes(Number(s.accountId || s.id || s.identity))
    )

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Settings Area */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-4 text-xs">
          {/* Room Count Selector */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Số lượng phòng</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRoomCount((c) => Math.max(2, c - 1))}
                className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                -
              </button>
              <span className="w-6 text-center font-bold text-slate-800">{roomCount}</span>
              <button
                type="button"
                onClick={() => setRoomCount((c) => Math.min(6, c + 1))}
                className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Shuffle / Clear buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleShuffle}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-3 w-3 text-slate-500" /> Trộn
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 transition text-red-600"
            >
              <Trash2 className="h-3 w-3" /> Xóa hết
            </button>
          </div>

          {/* Allow participants to change room */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Cho phép người tham gia đổi phòng</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowChangeRoom}
                onChange={(e) => setAllowChangeRoom(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 rounded-full bg-slate-300 border border-slate-400/60 shadow-inner transition-colors peer-focus:outline-none peer-checked:bg-emerald-500 peer-checked:border-emerald-600 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border after:border-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:after:translate-x-4 peer-checked:after:border-white" />
            </label>
          </div>

          {/* Timer Switch */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Hẹn giờ</span>
            <div className="flex items-center gap-2">
              {timerEnabled && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(Math.max(1, Number(e.target.value)))}
                    className="w-10 rounded border border-slate-200 py-0.5 text-center font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">phút</span>
                </div>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={timerEnabled}
                  onChange={(e) => setTimerEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 rounded-full bg-slate-300 border border-slate-400/60 shadow-inner transition-colors peer-focus:outline-none peer-checked:bg-emerald-500 peer-checked:border-emerald-600 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border after:border-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:after:translate-x-4 peer-checked:after:border-white" />
              </label>
            </div>
          </div>

          {/* Max Participants Switch */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Giới hạn thành viên</span>
            <div className="flex items-center gap-2">
              {maxParticipantsEnabled && (
                <div className="flex items-center gap-1 mr-1">
                  <button
                    type="button"
                    onClick={() => setMaxParticipants((m) => Math.max(1, m - 1))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 font-bold"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-slate-800">{maxParticipants}</span>
                  <button
                    type="button"
                    onClick={() => setMaxParticipants((m) => m + 1)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maxParticipantsEnabled}
                  onChange={(e) => setMaxParticipantsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 rounded-full bg-slate-300 border border-slate-400/60 shadow-inner transition-colors peer-focus:outline-none peer-checked:bg-emerald-500 peer-checked:border-emerald-600 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border after:border-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:after:translate-x-4 peer-checked:after:border-white" />
              </label>
            </div>
          </div>
        </div>

        {/* Room Allocations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/10">
          {/* Main Room / Unassigned List */}
          <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
            <button
              onClick={() => toggleRoomExpand("main")}
              className="flex w-full items-center justify-between text-xs font-bold text-slate-800"
            >
              <span>Phòng chính ({unassignedStudents.length} học viên)</span>
              {expandedRooms["main"] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expandedRooms["main"] && (
              <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-slate-200">
                {unassignedStudents.length === 0 ? (
                  <div className="text-[10px] text-slate-400 italic py-1">Tất cả học viên đã được phân phối</div>
                ) : (
                  unassignedStudents.map((student) => {
                    const studentId = Number(student.accountId || student.id || student.identity)
                    return (
                      <div key={studentId} className="flex items-center justify-between text-xs text-slate-700 py-1 bg-slate-50/50 px-2 rounded">
                        <span className="truncate max-w-[120px] font-semibold">{student.username || student.name || `User #${studentId}`}</span>
                        <select
                          onChange={(e) => handleMoveStudentSetup(studentId, Number(e.target.value))}
                          value=""
                          className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none"
                        >
                          <option value="" disabled>Phân bổ vào...</option>
                          {allocations.map((_, idx) => (
                            <option key={idx} value={idx}>
                              Phòng {idx + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Sub-rooms */}
          {allocations.map((room, roomIndex) => {
            const isExpanded = expandedRooms[room.roomName]
            return (
              <div key={roomIndex} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <button
                  onClick={() => toggleRoomExpand(room.roomName)}
                  className="flex w-full items-center justify-between text-xs font-bold text-slate-800"
                >
                  <span>{room.roomName} ({room.accountIds.length} học viên)</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-primary2/30">
                    {room.accountIds.length === 0 ? (
                      <div className="text-[10px] text-slate-400 italic py-2 text-center">Chưa có học viên nào</div>
                    ) : (
                      room.accountIds.map((studentId) => {
                        const student = students.find(
                          (s) => String(s.accountId || s.id || s.identity) === String(studentId)
                        )
                        return (
                          <div key={studentId} className="flex items-center justify-between text-xs text-slate-700 py-1 bg-slate-50 px-2 rounded">
                            <span className="truncate max-w-[120px] font-semibold">
                              {student?.username || student?.name || `User #${studentId}`}
                            </span>
                            <select
                              onChange={(e) => handleMoveStudentSetup(studentId, Number(e.target.value))}
                              value={roomIndex}
                              className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none"
                            >
                              {allocations.map((_, idx) => (
                                <option key={idx} value={idx}>
                                  Phòng {idx + 1}
                                </option>
                              ))}
                              <option value="-1">Phòng chính</option>
                            </select>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col">
          <PillButton
            onClick={handleStartBreakout}
            disabled={isSaving || isStarting}
            loading={isStarting}
            variant="primary"
            className="w-full text-sm h-11"
          >
            Mở phòng
          </PillButton>
        </div>
      </div>
    )
  }

  // Host Live Toggle Allow Participant Change Room
  const handleToggleAllowChange = async (newVal) => {
    try {
      await toggleAllowChangeRoom({ sessionId, allowParticipantChangeRoom: newVal }).unwrap()
      toast.success(newVal ? "Đã cho phép học viên tự do đổi phòng." : "Đã cố định danh sách phòng.")
    } catch (err) {
      console.error(err)
      toast.error("Không thể thay đổi cài đặt chuyển phòng.")
    }
  }

  // Student Self-Switch Room
  const handleStudentSwitchRoom = async (targetSubSessionId) => {
    try {
      const res = await studentSwitchRoom({
        sessionId,
        targetSubSessionId,
      }).unwrap()

      if (res?.token) {
        dispatch(updateLivekitToken(res.token))
        if (targetSubSessionId === sessionId || targetSubSessionId === 0) {
          dispatch(exitBreakout())
          toast.success("Đã quay lại phòng học chính")
        } else {
          const targetRoom = status?.breakoutSessions?.find((r) => r.sessionId === targetSubSessionId)
          const roomName = targetRoom?.roomName || "Phòng thảo luận"
          dispatch(enterBreakout({ subSessionId: targetSubSessionId, roomName, token: res.token }))
          toast.success(`Đã chuyển sang ${roomName}`)
        }
        refetchStatus()
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || err?.data || "Không thể chuyển phòng")
    }
  }

  // Render Active View
  const renderActiveView = () => {
    const isTeacherInSubRoom = currentSubSessionId !== sessionId

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Toggle participant change room checkbox */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Cho phép đổi phòng</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(status?.allowParticipantChangeRoom)}
                onChange={(e) => handleToggleAllowChange(e.target.checked)}
                disabled={!isHost || isTogglingAllow}
                className="sr-only peer"
              />
              <div className="relative w-9 h-5 rounded-full bg-slate-300 border border-slate-400/60 shadow-inner transition-colors peer-focus:outline-none peer-checked:bg-emerald-500 peer-checked:border-emerald-600 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border after:border-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-checked:after:translate-x-4 peer-checked:after:border-white" />
            </label>
          </div>

          {isTeacherInSubRoom && (
            <PillButton
              onClick={handleHostLeave}
              variant="outline"
              className="w-full h-9 text-xs"
              loading={isJoiningRoom}
            >
              <LogOut className="h-3.5 w-3.5" /> Rời phòng nhỏ về Phòng chính
            </PillButton>
          )}
        </div>

        {/* Active Rooms List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/10">
          {/* Main lobby in Active phase */}
          {/* Find students who are in the main room still */}
          {status && (
            <>
              {/* Rooms list */}
              {status.breakoutSessions?.map((room) => {
                const isHostInThisRoom = currentSubSessionId === room.sessionId
                const isExpanded = expandedRooms[room.roomName] ?? true

                return (
                  <div
                    key={room.sessionId}
                    className={`rounded-xl border p-3 transition shadow-sm bg-white ${
                      isHostInThisRoom ? "border-emerald-300 bg-emerald-50/10" : "border-slate-100"
                    }`}
                  >
                    <button
                      onClick={() => toggleRoomExpand(room.roomName)}
                      className="flex w-full items-center justify-between text-xs font-bold text-slate-800"
                    >
                      <span>
                        {room.roomName} ({room.participants?.length || 0}
                        {status.maxParticipantsPerRoom ? `/${status.maxParticipantsPerRoom}` : ""})
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {/* Participants inside this sub-room */}
                        <div className="space-y-1.5 pl-2 border-l border-slate-200">
                          {room.participants?.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic py-1 block">Chưa có ai</span>
                          ) : (
                            room.participants.map((p) => {
                              const isThisHost = String(p.accountId) === String(roomCreatorId)
                              return (
                                <div key={p.accountId} className="flex items-center justify-between text-xs text-slate-600 py-0.5 px-1 bg-slate-50/30 rounded">
                                  <span className="truncate max-w-[120px] font-semibold">{p.username}</span>
                                  {!isThisHost ? (
                                    <select
                                      onChange={(e) => handleRelocateStudentActive(p.accountId, Number(e.target.value))}
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
                                  ) : (
                                    <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-90">
                                      HOST
                                    </span>
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>

                        {/* Join sub-room button */}
                        {!isHostInThisRoom ? (
                          <PillButton
                            onClick={() => handleHostJoin(room.sessionId, room.roomName)}
                            variant="secondary"
                            className="w-full h-8 text-[11px] font-bold border border-orange-200 text-orange-600 hover:bg-orange-50/50 bg-white"
                          >
                            Tham gia
                          </PillButton>
                        ) : (
                          <div className="w-full text-center py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                            Đang ở đây
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Global actions (Broadcast & Stop) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 flex flex-col">
          {showBroadcastInput ? (
            <form onSubmit={handleBroadcastSubmit} className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Nhập thông báo gửi tới các phòng:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Học viên thảo luận trong 5 phút nữa..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-primary2 focus:ring-1 focus:ring-primary2"
                />
                <button
                  type="submit"
                  disabled={isBroadcasting || !broadcastMsg.trim()}
                  className="rounded-xl bg-primary2 hover:bg-primary2-dark text-white px-3 py-1.5 text-xs font-bold transition"
                >
                  Gửi
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowBroadcastInput(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 text-xs font-bold transition"
            >
              <MessageSquare className="h-4 w-4 text-slate-500" /> Gửi thông báo chung
            </button>
          )}

          <PillButton
            onClick={handleStopBreakouts}
            disabled={isStopping}
            loading={isStopping}
            variant="primary"
            className="w-full text-sm h-11 bg-red-600 hover:bg-red-700 hover:brightness-100 active:brightness-90 flex items-center justify-center gap-2"
          >
            <StopCircle className="h-4 w-4" /> Đóng phòng
          </PillButton>
        </div>
      </div>
    )
  }

  // Render Student View (For non-host participants)
  const renderStudentView = () => {
    const isStarted = Boolean(status?.isBreakoutActive || isBreakoutActive)
    const allowChange = status?.allowParticipantChangeRoom
    const isInSubRoom = currentSubSessionId && currentSubSessionId !== sessionId

    if (!isStarted) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">Chưa bắt đầu chia nhóm</h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-[220px] leading-relaxed">
            Giáo viên chưa mở phòng thảo luận nhóm nhỏ cho buổi học này.
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
        {/* Notice Banner */}
        <div className="p-3 border-b border-slate-100 bg-white space-y-2">
          {allowChange ? (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span>Giáo viên cho phép bạn tự do chuyển đổi giữa các phòng.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span>Danh sách phòng thảo luận đã được cố định.</span>
            </div>
          )}

          {isInSubRoom && (
            <PillButton
              onClick={() => handleStudentSwitchRoom(sessionId)}
              disabled={isSwitching}
              loading={isSwitching}
              variant="outline"
              className="w-full h-9 text-xs font-bold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-500" /> Quay lại Phòng học chính
            </PillButton>
          )}
        </div>

        {/* List of Breakout Rooms */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Danh sách phòng ({status?.breakoutSessions?.length || 0})</span>
            {status?.maxParticipantsPerRoom && (
              <span className="text-[10px] text-slate-400 font-normal">Tối đa {status.maxParticipantsPerRoom} người/phòng</span>
            )}
          </div>

          {status?.breakoutSessions?.map((room) => {
            const isUserInThisRoom = currentSubSessionId === room.sessionId
            const isFull = status.maxParticipantsPerRoom ? (room.participants?.length || 0) >= status.maxParticipantsPerRoom : false

            return (
              <div
                key={room.sessionId}
                className={`rounded-xl border p-3.5 transition-all shadow-xs bg-white ${
                  isUserInThisRoom ? "border-emerald-400 bg-emerald-50/20 ring-1 ring-emerald-400/30" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{room.roomName}</span>
                    {isUserInThisRoom && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Bạn đang ở đây
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {room.participants?.length || 0}
                    {status.maxParticipantsPerRoom ? `/${status.maxParticipantsPerRoom}` : ""}
                  </span>
                </div>

                {/* Participants list in this room */}
                <div className="mt-2.5 space-y-1 pl-2 border-l-2 border-slate-100">
                  {room.participants?.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">Chưa có ai trong phòng</span>
                  ) : (
                    room.participants.map((p) => {
                      const isMe = String(p.accountId) === String(callInfo?.user?.accountId)
                      return (
                        <div key={p.accountId} className="flex items-center justify-between text-xs py-0.5 text-slate-600">
                          <span className={`truncate ${isMe ? "font-bold text-primary2" : "font-medium text-slate-700"}`}>
                            {p.username} {isMe ? "(Bạn)" : ""}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Action button */}
                {!isUserInThisRoom && allowChange && (
                  <button
                    onClick={() => handleStudentSwitchRoom(room.sessionId)}
                    disabled={isSwitching || isFull}
                    className={`w-full mt-3 py-2 px-3 text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 ${
                      isFull
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-primary2 hover:bg-primary2-dark text-white active:scale-[0.99]"
                    }`}
                  >
                    {isSwitching ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isFull ? (
                      "Phòng đã đầy"
                    ) : (
                      <>
                        <LogIn className="h-3.5 w-3.5" /> Tham gia phòng
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const isStarted = status?.isBreakoutActive

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Sidebar Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 bg-white">
        <div className="flex items-center gap-2">
          {isStarted && isHost && (
            <button
              onClick={handleHostLeave}
              disabled={currentSubSessionId === sessionId}
              className="text-slate-400 hover:text-slate-600 rounded p-0.5 hover:bg-slate-50"
              title="Quay lại phòng chính"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
          <h3 className="text-sm font-bold text-slate-800">
            {isStarted ? "Phòng thảo luận" : "Phòng họp nhóm"}
          </h3>
          {isStarted && countdownSeconds !== null && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              <Clock className="h-3 w-3 text-slate-500" />
              {formatTimer(countdownSeconds)}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* View router */}
      {isLoadingStatus ? (
        <div className="flex h-full flex-col items-center justify-center p-6 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-primary2 mb-2" />
          <p className="text-xs font-semibold">Đang tải cấu hình chia phòng...</p>
        </div>
      ) : statusError ? (
        <div className="flex h-full flex-col items-center justify-center p-6 text-slate-400">
          <AlertCircle className="h-6 w-6 text-red-400 mb-2" />
          <p className="text-xs font-semibold">Lỗi tải dữ liệu phòng họp nhóm.</p>
        </div>
      ) : isHost ? (
        isStarted ? renderActiveView() : renderSetupView()
      ) : (
        renderStudentView()
      )}
    </div>
  )
}

export default BreakoutSidebarPanel
