import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import StudentRow from "../shared/StudentRow"
import ListItem from "@/shared/components/ui/ListItem"
import Badge from "@/shared/components/ui/indicators/Badge"
import { useLanguage } from "@/shared/context/LanguageContext"

const BreakoutSetupRoomList = ({
  unassignedStudents,
  allocations,
  students,
  handleMoveStudentSetup,
  hostStudent,
}) => {
  const { t } = useLanguage()
  const [dragOverRoomId, setDragOverRoomId] = useState(null)
  const dragTimeout = useRef(null)

  const handleDragOver = (e, roomId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragTimeout.current) {
      clearTimeout(dragTimeout.current)
      dragTimeout.current = null
    }
    if (dragOverRoomId !== roomId) {
      setDragOverRoomId(roomId)
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
  }

  const handleDragLeave = (e, roomId) => {
    e.preventDefault()
    if (dragTimeout.current) clearTimeout(dragTimeout.current)
    dragTimeout.current = setTimeout(() => {
      setDragOverRoomId((prev) => (prev === roomId ? null : prev))
    }, 50)
  }

  const handleDrop = (e, targetRoomId) => {
    e.preventDefault()
    if (dragTimeout.current) clearTimeout(dragTimeout.current)
    setDragOverRoomId(null)
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"))
      if (data && data.studentId && data.currentRoomId !== targetRoomId) {
        handleMoveStudentSetup(data.studentId, targetRoomId)
      }
    } catch (err) {
      console.error("Drop failed", err)
    }
  }

  // Pre-map rooms for StudentRow
  const mappedRooms = allocations.map((_, idx) => ({
    id: idx,
    name: `${t.rooms.breakoutRooms.roomPrefix}${idx + 1}`,
  }))

  // Local state for tracking which accordions are open
  const [expandedRooms, setExpandedRooms] = useState({ main: true })

  // Auto-expand rooms with participants (do not auto-collapse)
  useEffect(() => {
    setExpandedRooms((prev) => {
      const next = { ...prev }
      let hasChanges = false

      if (unassignedStudents.length > 0 && !next.main) {
        next.main = true
        hasChanges = true
      }

      allocations.forEach((room) => {
        if (room.accountIds.length > 0 && !next[room.roomName]) {
          next[room.roomName] = true
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
    <div className="flex flex-col gap-2 py-2 px-1">
      {/* Main Room / Unassigned List */}
      <div
        className={dragOverRoomId === -1 ? 'relative after:absolute after:inset-0 after:ring-2 after:ring-inset after:ring-[#990011] after:bg-[#990011]/10 after:pointer-events-none after:z-10' : 'relative shadow-faq-card-expanded rounded-xl'}
        onDragOver={(e) => handleDragOver(e, -1)}
        onDragEnter={handleDragEnter}
        onDragLeave={(e) => handleDragLeave(e, -1)}
        onDrop={(e) => handleDrop(e, -1)}
      >
        <ListItem
          contentClassName="!h-12"
          onClick={() => toggleRoomExpand("main")}
          hoverEffect={true}
          rightText={unassignedStudents.length}
          rightContent={
            <div
              onClick={(e) => { e.stopPropagation(); toggleRoomExpand("main") }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-[#E6E6E6] cursor-pointer"
            >
              {expandedRooms["main"] ? <ChevronDown size={28} /> : <ChevronRight size={28} />}
            </div>
          }
        >
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[120px] text-left">
              {t.rooms.breakoutRooms.mainRoom}
            </span>
            {hostStudent && <Badge color="emerald">{t.rooms.breakoutRooms.youAreHere}</Badge>}
          </div>
        </ListItem>

        {expandedRooms["main"] && (
          <div className="flex flex-col">
            {hostStudent && (
              <StudentRow
                key={`host-${hostStudent.accountId}`}
                student={hostStudent}
                studentId={hostStudent.accountId}
                rooms={mappedRooms}
                currentRoomId={-1}
                mainRoomId={-1}
                isHost={true}
              />
            )}
            {unassignedStudents.length === 0 && !hostStudent ? (
              <ListItem>
                <span className="text-xs text-[#606060]">
                  {t.rooms.breakoutRooms.allAssigned}
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
          <div
            key={roomIndex}
            className={dragOverRoomId === roomIndex ? 'relative after:absolute after:inset-0 after:ring-2 after:ring-inset after:ring-[#990011] after:bg-[#990011]/10 after:pointer-events-none after:z-10' : 'relative shadow-faq-card-expanded rounded-xl'}
            onDragOver={(e) => handleDragOver(e, roomIndex)}
            onDragEnter={handleDragEnter}
            onDragLeave={(e) => handleDragLeave(e, roomIndex)}
            onDrop={(e) => handleDrop(e, roomIndex)}
          >
            <ListItem
              contentClassName="!h-12"
              onClick={() => toggleRoomExpand(room.roomName)}
              hoverEffect={true}
              rightText={room.accountIds.length}
              rightContent={
                <div
                  onClick={(e) => { e.stopPropagation(); toggleRoomExpand(room.roomName) }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-[#E6E6E6] cursor-pointer"
                >
                  {isExpanded ? <ChevronDown size={28} /> : <ChevronRight size={28} />}
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
                    <span className="text-xs text-[#606060]">{t.rooms.breakoutRooms.emptyRoom}</span>
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
