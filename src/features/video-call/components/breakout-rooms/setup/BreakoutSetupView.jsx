import React, { useState, useEffect, useMemo } from "react"
import { Info } from "lucide-react"
import { toast } from "react-hot-toast"
import {
  useSetupBreakoutGroupsMutation,
  useStartBreakoutRoomsMutation,
} from "@/store/api/roomsApi"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import BreakoutSettingsArea from "./BreakoutSettingsArea"
import BreakoutSetupControls from "./BreakoutSetupControls"
import BreakoutSetupRoomList from "./BreakoutSetupRoomList"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useDragScroll } from "../../../hooks/useDragScroll"

const BreakoutSetupView = ({ sessionId, students, status, refetchStatus, roomCreatorId, allLiveStudents }) => {
  const { t } = useLanguage()
  const [setupBreakoutGroups, { isLoading: isSaving }] =
    useSetupBreakoutGroupsMutation()
  const [startBreakoutRooms, { isLoading: isStarting }] =
    useStartBreakoutRoomsMutation()

  // Local Setup States
  const [roomCount, setRoomCount] = useState(2)
  const [allowChangeRoom, setAllowChangeRoom] = useState(false)
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerDuration, setTimerDuration] = useState(10) // default 10 minutes
  const [maxParticipantsEnabled, setMaxParticipantsEnabled] = useState(false)
  const [maxParticipants, setMaxParticipants] = useState(10)

  // Allocation State: Array of { roomName, accountIds: [] }
  const [allocations, setAllocations] = useState([])

  const { containerRef, handleDragOverScroll, handleDragLeaveScroll } = useDragScroll()

  // Initialize/Reset allocations when roomCount changes
  useEffect(() => {
    if (!status?.isBreakoutActive) {
      const initial = Array.from({ length: roomCount }, (_, i) => ({
        roomName: `${t.rooms.breakoutRooms.roomPrefix}${i + 1}`,
        accountIds: [],
      }))
      setAllocations(initial)
    }
  }, [roomCount, status?.isBreakoutActive])

  // Automatically prune disconnected / left students from allocations
  useEffect(() => {
    const liveStudentIds = new Set(
      students.map((s) => Number(s.accountId || s.id || s.identity)).filter(Boolean)
    )
    setAllocations((prev) => {
      let changed = false
      const updated = prev.map((room) => {
        const filtered = room.accountIds.filter((id) => liveStudentIds.has(Number(id)))
        if (filtered.length !== room.accountIds.length) {
          changed = true
          return { ...room, accountIds: filtered }
        }
        return room
      })
      return changed ? updated : prev
    })
  }, [students])

  // Auto-allocate students to rooms
  const handleShuffle = () => {
    if (students.length === 0) {
      toast.error(t.rooms.breakoutRooms.noActiveStudents)
      return
    }

    const shuffled = [...students].sort(() => Math.random() - 0.5)
    const newAllocations = Array.from({ length: roomCount }, (_, i) => ({
      roomName: `${t.rooms.breakoutRooms.roomPrefix}${i + 1}`,
      accountIds: [],
    }))

    shuffled.forEach((student, index) => {
      const roomIndex = index % roomCount
      const accountId = Number(
        student.accountId || student.id || student.identity,
      )
      if (accountId) {
        newAllocations[roomIndex].accountIds.push(accountId)
      }
    })

    setAllocations(newAllocations)
  }

  // Clear allocations
  const handleClearAll = () => {
    setAllocations((prev) =>
      prev.map((r) => ({
        ...r,
        accountIds: [],
      })),
    )
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
      }),
    )

    toast.success(
      t.rooms.breakoutRooms.setupStageHint || "Đã phân bổ học viên vào phòng. Nhấn 'Mở phòng' bên dưới để áp dụng.",
      { id: "setup-stage-hint", duration: 3000 }
    )
  }

  // Start Breakout Rooms
  const handleStartBreakout = async () => {
    const totalAssigned = allocations.reduce(
      (acc, curr) => acc + curr.accountIds.length,
      0,
    )
    if (totalAssigned === 0 && students.length > 0) {
      toast.error(t.rooms.breakoutRooms.assignAtLeastOne)
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
        timerDuration: timerEnabled ? timerDuration : null,
        allowParticipantChangeRoom: allowChangeRoom,
        maxParticipantsPerRoom: maxParticipantsEnabled ? maxParticipants : null,
      }

      await setupBreakoutGroups(setupPayload).unwrap()

      // 2. Start rooms
      await startBreakoutRooms(sessionId).unwrap()
      refetchStatus()
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || t.rooms.breakoutRooms.startError)
    }
  }

  // Unassigned students logic
  const assignedIds = useMemo(() => {
    return allocations.reduce(
      (acc, curr) => [...acc, ...curr.accountIds],
      [],
    )
  }, [allocations])

  const unassignedStudents = useMemo(() => {
    return students.filter(
      (s) => !assignedIds.includes(Number(s.accountId || s.id || s.identity)),
    )
  }, [students, assignedIds])

  const hostStudent = useMemo(() => {
    return allLiveStudents?.find(
      (s) => String(s.accountId) === String(roomCreatorId)
    )
  }, [allLiveStudents, roomCreatorId])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Informative Guidance Banner for Setup Mode */}
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-3.5 py-2.5 flex items-start gap-2 text-xs text-amber-900 leading-relaxed shrink-0">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          {t.rooms.breakoutRooms.setupModeTip || "Chế độ phân bổ phòng: Xếp nhóm học viên rồi nhấn nút \"Mở phòng\" bên dưới để chính thức đưa các thành viên vào phòng."}
        </span>
      </div>

      <div
        ref={containerRef}
        onDragOver={handleDragOverScroll}
        onDragLeave={handleDragLeaveScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="border-b border-border">
          <BreakoutSetupControls
            roomCount={roomCount}
            setRoomCount={setRoomCount}
            handleShuffle={handleShuffle}
            handleClearAll={handleClearAll}
            maxParticipantsEnabled={maxParticipantsEnabled}
            setMaxParticipantsEnabled={setMaxParticipantsEnabled}
            maxParticipants={maxParticipants}
            setMaxParticipants={setMaxParticipants}
          />
        </div>

        <div className="border-b border-border">
          <BreakoutSettingsArea
            allowChangeRoom={allowChangeRoom}
            setAllowChangeRoom={setAllowChangeRoom}
            timerEnabled={timerEnabled}
            setTimerEnabled={setTimerEnabled}
            timerDuration={timerDuration}
            setTimerDuration={setTimerDuration}
          />
        </div>

        <div>
          <BreakoutSetupRoomList
            unassignedStudents={unassignedStudents}
            allocations={allocations}
            students={students}
            handleMoveStudentSetup={handleMoveStudentSetup}
            hostStudent={hostStudent}
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-border bg-white shrink-0">
        <PillButton
          onClick={handleStartBreakout}
          disabled={isSaving || isStarting}
          loading={isStarting}
          variant="primary"
          className="w-full text-sm"
        >
          {t.rooms.breakoutRooms.openRoomsBtn}
        </PillButton>
      </div>
    </div>
  )
}

export default BreakoutSetupView
