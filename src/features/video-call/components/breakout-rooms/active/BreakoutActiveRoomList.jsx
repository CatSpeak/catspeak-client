import React from "react"
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import Popover from "@/shared/components/ui/Popover"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ListItem from "@/shared/components/ui/ListItem"
import Badge from "@/shared/components/ui/indicators/Badge"
import StudentRow from "../shared/StudentRow"

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
}) => {
  if (!status) return null

  // Get main room participants from status
  const mainRoomParticipants = status.mainRoom?.participants || []

  const isHostInMainRoom = String(currentSubSessionId) === String(sessionId)
  const isMainExpanded = expandedRooms["main"] ?? true

  return (
    <div className="py-2">
      {/* Main Room */}
      <div>
        <ListItem
          onClick={() => toggleRoomExpand("main")}
          hoverEffect={true}
          rightText={mainRoomParticipants.length}
          rightContent={
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100">
              {isMainExpanded ? <ChevronDown /> : <ChevronRight />}
            </div>
          }
        >
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[120px] text-left">
              Phòng chính
            </span>
            {isHostInMainRoom && <Badge color="emerald">Bạn ở đây</Badge>}
          </div>
        </ListItem>

        {isMainExpanded && (
          <div>
            <div>
              {mainRoomParticipants.length === 0 ? (
                <ListItem>
                  <span className="text-xs text-[#606060]">Phòng trống</span>
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
                      rooms={status.breakoutSessions.map((br) => ({
                        id: br.sessionId,
                        name: br.roomName,
                      }))}
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
                >
                  Tham gia phòng
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
        const studentParticipants = room.participants?.filter(
          (p) => String(p.accountId) !== String(roomCreatorId)
        ) || []
        const studentCount = studentParticipants.length
        const isFull = status.maxParticipantsPerRoom ? studentCount >= status.maxParticipantsPerRoom : false

        return (
          <div key={room.sessionId}>
            <ListItem
              onClick={() => toggleRoomExpand(room.roomName)}
              hoverEffect={true}
              rightText={`${studentCount}${
                status.maxParticipantsPerRoom
                  ? `/${status.maxParticipantsPerRoom}`
                  : ""
              }`}
              rightContent={
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 group-hover:opacity-100">
                  {isExpanded ? <ChevronDown /> : <ChevronRight />}
                </div>
              }
            >
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[120px] text-left">
                  {room.roomName}
                </span>
                {isHostInThisRoom && <Badge color="emerald">Bạn ở đây</Badge>}
              </div>
            </ListItem>

            {isExpanded && (
              <div>
                {/* Participants inside this sub-room */}
                <div>
                  {room.participants?.length === 0 ? (
                    <ListItem>
                      <span className="text-xs text-[#606060]">
                        Phòng trống
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
                          rooms={status.breakoutSessions.map((br) => ({
                            id: br.sessionId,
                            name: br.roomName,
                          }))}
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
                    >
                      Tham gia phòng
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
