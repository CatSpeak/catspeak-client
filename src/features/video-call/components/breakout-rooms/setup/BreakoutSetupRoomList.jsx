import React, { useState, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import StudentRow from "../shared/StudentRow"
import ListItem from "@/shared/components/ui/ListItem"

const BreakoutSetupRoomList = ({
  unassignedStudents,
  allocations,
  students,
  handleMoveStudentSetup,
}) => {
  // Pre-map rooms for StudentRow
  const mappedRooms = allocations.map((_, idx) => ({
    id: idx,
    name: `phòng ${idx + 1}`,
  }))

  // Local state for tracking which accordions are open
  const [expandedRooms, setExpandedRooms] = useState({ main: true })

  // Auto-expand rooms with participants and collapse empty ones
  useEffect(() => {
    setExpandedRooms((prev) => {
      const next = { ...prev }
      let hasChanges = false

      if (unassignedStudents.length > 0 && !next.main) {
        next.main = true
        hasChanges = true
      } else if (unassignedStudents.length === 0 && next.main) {
        next.main = false
        hasChanges = true
      }

      allocations.forEach((room) => {
        if (room.accountIds.length > 0 && !next[room.roomName]) {
          next[room.roomName] = true
          hasChanges = true
        } else if (room.accountIds.length === 0 && next[room.roomName]) {
          next[room.roomName] = false
          hasChanges = true
        }
      })

      return hasChanges ? next : prev
    })
  }, [unassignedStudents, allocations])

  const toggleRoomExpand = (roomName) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomName]: !prev[roomName],
    }))
  }

  return (
    <div className="flex flex-col py-2">
      {/* Main Room / Unassigned List */}
      <div className="flex flex-col">
        <ListItem
          onClick={() => toggleRoomExpand("main")}
          hoverEffect={true}
          rightText={unassignedStudents.length}
          rightContent={
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100">
              {expandedRooms["main"] ? <ChevronDown /> : <ChevronRight />}
            </div>
          }
        >
          <span className="truncate max-w-[120px] text-left">
            Phòng chính
          </span>
        </ListItem>

        {expandedRooms["main"] && (
          <div className="flex flex-col">
            {unassignedStudents.length === 0 ? (
              <ListItem>
                <span className="text-xs text-[#606060]">
                  Tất cả học viên đã được phân phối
                </span>
              </ListItem>
            ) : (
              unassignedStudents.map((student) => {
                const studentId = Number(
                  student.accountId || student.id || student.identity,
                )
                return (
                  <StudentRow
                    key={studentId}
                    student={student}
                    studentId={studentId}
                    rooms={mappedRooms}
                    currentRoomId={-1}
                    mainRoomId={-1}
                    onMoveStudent={handleMoveStudentSetup}
                  />
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
          <div key={roomIndex} className="flex flex-col">
            <ListItem
              onClick={() => toggleRoomExpand(room.roomName)}
              hoverEffect={true}
              rightText={room.accountIds.length}
              rightContent={
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100">
                  {isExpanded ? <ChevronDown /> : <ChevronRight />}
                </div>
              }
            >
              <span className="truncate max-w-[120px] text-left">
                {room.roomName}
              </span>
            </ListItem>

            {isExpanded && (
              <div className="flex flex-col">
                {room.accountIds.length === 0 ? (
                  <ListItem>
                    <span className="text-xs text-[#606060]">Phòng trống</span>
                  </ListItem>
                ) : (
                  room.accountIds.map((studentId) => {
                    const student = students.find(
                      (s) =>
                        String(s.accountId || s.id || s.identity) ===
                        String(studentId),
                    )
                    return (
                      <StudentRow
                        key={studentId}
                        student={student || {}}
                        studentId={studentId}
                        rooms={mappedRooms}
                        currentRoomId={roomIndex}
                        mainRoomId={-1}
                        onMoveStudent={handleMoveStudentSetup}
                      />
                    )
                  })
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default BreakoutSetupRoomList
