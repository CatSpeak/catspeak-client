import React from "react"
import { MoreVertical } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import Popover from "@/shared/components/ui/Popover"
import ListItem from "@/shared/components/ui/ListItem"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/store/slices/authSlice"
import { ParticipantVolumeSlider } from "../../ParticipantVolumePopover"
import { useLanguage } from "@/shared/context/LanguageContext"

const StudentRow = ({
  student,
  studentId,
  isHost = false,
  rooms = [],
  currentRoomId = null,
  mainRoomId = null,
  onMoveStudent,
  showVolumeSlider = false,
  disableDrag = false,
}) => {
  const { t } = useLanguage()
  const hasVolumeSlider =
    showVolumeSlider && student?.participant && !student.participant.isLocal
  const hasMoveOptions = !!onMoveStudent && !isHost
  const isDraggable = hasMoveOptions && !disableDrag
  const showPopover = hasVolumeSlider || hasMoveOptions

  const currentUser = useSelector(selectCurrentUser)
  const isCurrentUser =
    String(currentUser?.id) === String(studentId) ||
    String(currentUser?.accountId) === String(studentId)

  const displayName =
    student?.nickname ||
    student?.username ||
    student?.name ||
    `User #${studentId}`
  const avatarSrc =
    student?.meetingAvatarUrl || student?.avatarUrl || student?.avatarImageUrl

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ studentId, currentRoomId }),
    )
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <ListItem
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      hoverEffect={isDraggable}
      className={isDraggable ? "cursor-grab active:cursor-grabbing" : ""}
      contentClassName={isHost ? "h-[72px]" : ""}
      leftContent={<Avatar size={40} name={displayName} src={avatarSrc} />}
      rightContent={
        showPopover && (
          <Popover
            placement="bottom-right"
            trigger={
              <div className="group flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isDraggable ? "hover:bg-[#E6E6E6]" : "hover:bg-[#F2F2F2]"
                  }`}
                >
                  <MoreVertical />
                </div>
              </div>
            }
            content={(close) => (
              <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-lg min-w-64 flex flex-col p-1 gap-1 z-50">
                {hasMoveOptions && rooms.length > 0 && (
                  <>
                    {rooms.map((room) =>
                      room.id === currentRoomId ? null : (
                        <button
                          key={room.id}
                          disabled={room.isFull}
                          onClick={(e) => {
                            if (room.isFull) {
                              e.preventDefault()
                              return
                            }
                            if (onMoveStudent) onMoveStudent(studentId, room.id)
                            close()
                          }}
                          className={`text-left px-4 py-3 rounded-xl transition-colors ${
                            room.isFull
                              ? "opacity-50 cursor-not-allowed bg-[#F9F9F9] text-[#A0A0A0]"
                              : "hover:bg-[#F2F2F2]"
                          }`}
                        >
                          {t.rooms.breakoutRooms.moveTo} {room.name}{" "}
                          {room.isFull && t.rooms.breakoutRooms.isFull}
                        </button>
                      ),
                    )}
                    {currentRoomId !== mainRoomId && (
                      <button
                        onClick={() => {
                          if (onMoveStudent)
                            onMoveStudent(studentId, mainRoomId)
                          close()
                        }}
                        className="text-left px-4 py-3 hover:bg-[#F2F2F2] rounded-xl transition-colors"
                      >
                        {t.rooms.breakoutRooms.moveToMain}
                      </button>
                    )}
                  </>
                )}

                {hasVolumeSlider && (
                  <>
                    {hasMoveOptions && rooms.length > 0 && (
                      <div className="my-1 mx-2 border-t border-[#E5E5E5]" />
                    )}
                    <div className="px-3 py-2">
                      <ParticipantVolumeSlider
                        participant={student.participant}
                        isInline={true}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          />
        )
      }
    >
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate max-w-[120px]">{displayName}</span>
          {isCurrentUser && (
            <span className="text-[#606060] shrink-0">
              {t.rooms.videoCall.participantList.youSuffix}
            </span>
          )}
        </div>
        {isHost && (
          <span className="text-sm text-[#606060] truncate">
            {t.rooms.breakoutRooms.host}
          </span>
        )}
      </div>
    </ListItem>
  )
}

export default StudentRow
