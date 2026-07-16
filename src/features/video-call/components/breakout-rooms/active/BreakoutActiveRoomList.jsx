import React, { useState, useRef } from "react"
import { ChevronDown, ChevronRight, MoreVertical, Volume2 } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import Popover from "@/shared/components/ui/Popover"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ListItem from "@/shared/components/ui/ListItem"
import Badge from "@/shared/components/ui/indicators/Badge"
import StudentRow from "../shared/StudentRow"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"

const BreakoutActiveRoomList = ({
  status,
  currentSubSessionId,
  expandedRooms,
  toggleRoomExpand,
  roomCreatorId,
  handleRelocateStudentActive,
  sessionId,
  handleHostJoin,
  students = [],
  handleHostLeave,
  isJoiningRoom,
}) => {
  const { t } = useLanguage()
  const [dragOverRoomId, setDragOverRoomId] = useState(null)
  const dragTimeout = useRef(null)

  if (!status) return null

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

    // Calculate room fullness first
    let isTargetFull = false
    if (targetRoomId !== sessionId && status?.breakoutSessions) {
      const targetRoom = status.breakoutSessions.find(
        (r) => r.sessionId === targetRoomId,
      )
      if (targetRoom && status.maxParticipantsPerRoom) {
        const studentCount = (targetRoom.participants || []).filter(
          (p) => String(p.accountId) !== String(roomCreatorId),
        ).length
        if (studentCount >= status.maxParticipantsPerRoom) {
          isTargetFull = true
        }
      }
    }

    if (isTargetFull) {
      toast.error(t.rooms.breakoutRooms.roomFullError || "Phòng đã đầy.")
      return
    }

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"))
      if (data && data.studentId && data.currentRoomId !== targetRoomId) {
        handleRelocateStudentActive(data.studentId, targetRoomId)
      }
    } catch (err) {
      console.error("Drop failed", err)
    }
  }

  // Get main room participants from status
  const mainRoomParticipants = status.mainRoom?.participants || []
  const mainRoomStudentCount = mainRoomParticipants.filter(
    (p) => String(p.accountId) !== String(roomCreatorId),
  ).length

  const isHostInMainRoom = String(currentSubSessionId) === String(sessionId)
  const isMainExpanded = expandedRooms["main"] ?? true

  const enrichedRooms =
    status.breakoutSessions?.map((br) => {
      const studentParticipants =
        br.participants?.filter(
          (p) => String(p.accountId) !== String(roomCreatorId),
        ) || []
      const studentCount = studentParticipants.length
      const isFull = status.maxParticipantsPerRoom
        ? studentCount >= status.maxParticipantsPerRoom
        : false
      return {
        id: br.sessionId,
        name: br.roomName,
        isFull,
      }
    }) || []

  return (
    <div className="py-2 px-1 space-y-2.5">
      {/* Main Room */}
      <div
        onDragOver={(e) => handleDragOver(e, sessionId)}
        onDragEnter={handleDragEnter}
        onDragLeave={(e) => handleDragLeave(e, sessionId)}
        onDrop={(e) => handleDrop(e, sessionId)}
        className={
          dragOverRoomId === sessionId
            ? "relative after:absolute after:inset-0 after:ring-2 after:ring-inset after:ring-[#990011] after:bg-[#990011]/10 after:pointer-events-none after:z-10"
            : "relative shadow-faq-card-expanded rounded-xl"
        }
      >
        <ListItem
          contentClassName="!h-12"
          onClick={() => {
            if (isHostInMainRoom) return
            handleHostLeave()
          }}
          hoverEffect={true}
          leftContent={<Volume2 />}
          rightText={mainRoomStudentCount}
          rightContent={
            <div
              onClick={(e) => {
                e.stopPropagation()
                toggleRoomExpand("main")
              }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-[#E6E6E6] cursor-pointer"
            >
              {isMainExpanded ? <ChevronDown /> : <ChevronRight />}
            </div>
          }
        >
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[120px] text-left">
              {t.rooms.breakoutRooms.mainRoom}
            </span>
            {isHostInMainRoom && (
              <Badge color="emerald">{t.rooms.breakoutRooms.youAreHere}</Badge>
            )}
          </div>
        </ListItem>

        {isMainExpanded && (
          <div>
            <div>
              {mainRoomParticipants.length === 0 ? (
                <ListItem>
                  <span className="text-sm text-[#606060]">
                    {t.rooms.breakoutRooms.emptyRoom}
                  </span>
                </ListItem>
              ) : (
                mainRoomParticipants.map((p) => {
                  const isThisHost =
                    String(p.accountId) === String(roomCreatorId)
                  const enrichedStudent =
                    students.find(
                      (s) => String(s.accountId) === String(p.accountId),
                    ) || p
                  return (
                    <StudentRow
                      key={p.accountId}
                      student={enrichedStudent}
                      studentId={p.accountId}
                      isHost={isThisHost}
                      rooms={enrichedRooms}
                      currentRoomId={sessionId}
                      mainRoomId={sessionId}
                      onMoveStudent={handleRelocateStudentActive}
                      showVolumeSlider={true}
                    />
                  )
                })
              )}
            </div>

            {!isHostInMainRoom && (
              <div className="p-4">
                <PillButton
                  onClick={handleHostLeave}
                  variant="secondary"
                  className="w-full"
                  disabled={isJoiningRoom}
                >
                  {t.rooms.breakoutRooms.joinRoomBtn}
                </PillButton>
              </div>
            )}
          </div>
        )}
      </div>

      {status.breakoutSessions?.map((room) => {
        const isHostInThisRoom = currentSubSessionId === room.sessionId
        const isExpanded = expandedRooms[room.roomName] ?? true

        // Filter out the host from the count so it only tracks students against the limit
        const studentParticipants =
          room.participants?.filter(
            (p) => String(p.accountId) !== String(roomCreatorId),
          ) || []
        const studentCount = studentParticipants.length
        const isFull = status.maxParticipantsPerRoom
          ? studentCount >= status.maxParticipantsPerRoom
          : false

        return (
          <div
            key={room.sessionId}
            onDragOver={(e) => handleDragOver(e, room.sessionId)}
            onDragEnter={handleDragEnter}
            onDragLeave={(e) => handleDragLeave(e, room.sessionId)}
            onDrop={(e) => handleDrop(e, room.sessionId)}
            className={
              dragOverRoomId === room.sessionId
                ? "relative after:absolute after:inset-0 after:ring-2 after:ring-inset after:ring-[#990011] after:bg-[#990011]/10 after:pointer-events-none after:z-10"
                : "relative shadow-faq-card-expanded rounded-xl"
            }
          >
            <ListItem
              contentClassName="!h-12"
              onClick={() => {
                if (isHostInThisRoom) return
                handleHostJoin(room.sessionId, room.roomName)
              }}
              hoverEffect={true}
              leftContent={<Volume2 />}
              rightText={`${studentCount}${status.maxParticipantsPerRoom
                ? `/${status.maxParticipantsPerRoom}`
                : ""
                }`}
              rightContent={
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleRoomExpand(room.roomName)
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-[#E6E6E6] cursor-pointer"
                >
                  {isExpanded ? <ChevronDown /> : <ChevronRight />}
                </div>
              }
            >
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[120px] text-left">
                  {room.roomName}
                </span>
                {isHostInThisRoom && (
                  <Badge color="emerald">
                    {t.rooms.breakoutRooms.youAreHere}
                  </Badge>
                )}
              </div>
            </ListItem>

            {isExpanded && (
              <div>
                {/* Participants inside this sub-room */}
                <div>
                  {room.participants?.length === 0 ? (
                    <ListItem>
                      <span className="text-xs text-[#606060]">
                        {t.rooms.breakoutRooms.emptyRoom}
                      </span>
                    </ListItem>
                  ) : (
                    room.participants.map((p) => {
                      const isThisHost =
                        String(p.accountId) === String(roomCreatorId)
                      const enrichedStudent =
                        students.find(
                          (s) => String(s.accountId) === String(p.accountId),
                        ) || p

                      return (
                        <StudentRow
                          key={p.accountId}
                          student={enrichedStudent}
                          studentId={p.accountId}
                          isHost={isThisHost}
                          rooms={enrichedRooms}
                          currentRoomId={room.sessionId}
                          mainRoomId={sessionId}
                          onMoveStudent={handleRelocateStudentActive}
                          showVolumeSlider={true}
                        />
                      )
                    })
                  )}
                </div>

                {/* Join sub-room button */}
                {!isHostInThisRoom && (
                  <div className="p-4">
                    <PillButton
                      onClick={() =>
                        handleHostJoin(room.sessionId, room.roomName)
                      }
                      variant="secondary"
                      className="w-full"
                      disabled={isJoiningRoom}
                    >
                      {t.rooms.breakoutRooms.joinRoomBtn}
                    </PillButton>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default BreakoutActiveRoomList
