import React from "react"
import { MoreVertical } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import Popover from "@/shared/components/ui/Popover"
import ListItem from "@/shared/components/ui/ListItem"
import { ParticipantVolumeSlider } from "../../ParticipantVolumePopover"

const StudentRow = ({
  student,
  studentId,
  isHost = false,
  rooms = [],
  currentRoomId = null,
  mainRoomId = null,
  onMoveStudent,
  showVolumeSlider = false,
}) => {
  const hasVolumeSlider =
    showVolumeSlider && student?.participant && !student.participant.isLocal
  const hasMoveOptions = !!onMoveStudent && !isHost
  const showPopover = hasVolumeSlider || hasMoveOptions

  const displayName = student?.nickname || student?.username || student?.name || `User #${studentId}`
  const avatarSrc = student?.meetingAvatarUrl || student?.avatarUrl || student?.avatarImageUrl

  return (
    <ListItem
      contentClassName={isHost ? "h-[72px]" : ""}
      leftContent={
        <Avatar
          size={40}
          name={displayName}
          src={avatarSrc}
        />
      }
      rightContent={
        showPopover && (
          <Popover
            placement="bottom-right"
            trigger={
              <div className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#F2F2F2]">
                <MoreVertical />
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
                           onClick={() => {
                             if (onMoveStudent) onMoveStudent(studentId, room.id)
                             close()
                           }}
                           className="text-left px-4 py-3 hover:bg-[#F2F2F2] rounded-xl transition-colors"
                         >
                           Di chuyển sang {room.name}
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
                        Di chuyển về phòng chính
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
      <span className="truncate max-w-[120px]">
        {displayName}
      </span>
      {isHost && <span className="text-sm text-[#606060]">Host</span>}
    </ListItem>
  )
}

export default StudentRow
