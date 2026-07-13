import React, { useState, useEffect } from "react"
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
  const assignedIds = allocations.reduce(
    (acc, curr) => [...acc, ...curr.accountIds],
    [],
  )
  const unassignedStudents = students.filter(
    (s) => !assignedIds.includes(Number(s.accountId || s.id || s.identity)),
  )

  const hostStudent = allLiveStudents?.find(
    (s) => String(s.accountId) === String(roomCreatorId)
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div 
        ref={containerRef}
        onDragOver={handleDragOverScroll}
        onDragLeave={handleDragLeaveScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="border-b border-[#e5e5e5]">
          <BreakoutSettingsArea
            allowChangeRoom={allowChangeRoom}
            setAllowChangeRoom={setAllowChangeRoom}
            timerEnabled={timerEnabled}
            setTimerEnabled={setTimerEnabled}
            timerDuration={timerDuration}
            setTimerDuration={setTimerDuration}
          />
        </div>

        <div className="border-b border-[#e5e5e5]">
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
      <div className="p-4 border-t border-[#e5e5e5] bg-white shrink-0">
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
