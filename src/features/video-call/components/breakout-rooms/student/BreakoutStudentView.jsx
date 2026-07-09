import React, { useState, useEffect } from "react"
import { Users, ChevronDown, ChevronRight, Volume2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { useStudentSwitchBreakoutRoomMutation } from "@/store/api/roomsApi"
import {
  enterBreakout,
  exitBreakout,
  updateLivekitToken,
} from "@/store/slices/videoCallSlice"
import ListItem from "@/shared/components/ui/ListItem"
import Badge from "@/shared/components/ui/indicators/Badge"
import StudentRow from "../shared/StudentRow"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"

const BreakoutStudentView = ({
  sessionId,
  status,
  isBreakoutActive,
  currentSubSessionId,
  callInfo,
  refetchStatus,
  allLiveStudents = [],
}) => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const [studentSwitchRoom, { isLoading: isSwitching }] =
    useStudentSwitchBreakoutRoomMutation()

  const isStarted = Boolean(status?.isBreakoutActive || isBreakoutActive)
  const allowChange = status?.allowParticipantChangeRoom
  const roomCreatorId = callInfo?.roomData?.creatorId

  const [expandedRooms, setExpandedRooms] = useState({ main: true })

  useEffect(() => {
    if (status?.breakoutSessions) {
      setExpandedRooms((prev) => {
        const next = { ...prev, main: prev.main ?? true }
        status.breakoutSessions.forEach((r) => {
          if (next[r.roomName] === undefined) {
            next[r.roomName] = true
          }
        })
        return next
      })
    }
  }, [status])

  const toggleRoomExpand = (roomName) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomName]: !prev[roomName],
    }))
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
        } else {
          const targetRoom = status?.breakoutSessions?.find(
            (r) => r.sessionId === targetSubSessionId,
          )
          const roomName =
            targetRoom?.roomName ||
            t.rooms.breakoutRooms.breakoutRoomDefaultName
          dispatch(
            enterBreakout({
              subSessionId: targetSubSessionId,
              roomName,
              token: res.token,
            }),
          )
        }
      }
    } catch (err) {
      console.error(err)
      toast.error(
        err?.data?.message || err?.data || t.rooms.breakoutRooms.switchError,
      )
    }
  }

  if (!isStarted) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <Users className="h-6 w-6 text-slate-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-700">
          {t.rooms.breakoutRooms.notStartedTitle}
        </h4>
        <p className="text-xs text-slate-500 mt-1.5 max-w-[220px] leading-relaxed">
          {t.rooms.breakoutRooms.notStartedDesc}
        </p>
      </div>
    )
  }

  // Get main room participants from backend status
  const mainRoomParticipants = status?.mainRoom?.participants || []
  const mainRoomStudentCount = mainRoomParticipants.filter(
    (p) => String(p.accountId) !== String(roomCreatorId),
  ).length

  const isUserInMainRoom = String(currentSubSessionId) === String(sessionId)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* List of Breakout Rooms */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Main Room */}
        <div>
          <ListItem
            onClick={() => toggleRoomExpand("main")}
            hoverEffect={true}
            leftContent={<Volume2 />}
            rightText={mainRoomStudentCount}
            rightContent={
              <div 
                onClick={(e) => { e.stopPropagation(); toggleRoomExpand("main") }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors opacity-70 hover:opacity-100 hover:bg-[#E6E6E6] cursor-pointer"
              >
                {expandedRooms["main"] ? <ChevronDown /> : <ChevronRight />}
              </div>
            }
          >
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[120px] text-left">
                {t.rooms.breakoutRooms.mainRoom}
              </span>
              {isUserInMainRoom && (
                <Badge color="emerald">
                  {t.rooms.breakoutRooms.youAreHere}
                </Badge>
              )}
            </div>
          </ListItem>

          {expandedRooms["main"] && (
            <div>
              {mainRoomParticipants.length === 0 ? (
                <ListItem>
                  <span className="text-xs text-[#606060]">
                    {t.rooms.breakoutRooms.emptyRoom}
                  </span>
                </ListItem>
              ) : (
                mainRoomParticipants.map((p) => {
                  const isThisHost =
                    String(p.accountId) === String(roomCreatorId)
                  const enrichedStudent =
                    allLiveStudents.find(
                      (s) => String(s.accountId) === String(p.accountId),
                    ) || p
                  return (
                    <StudentRow
                      key={p.accountId}
                      student={enrichedStudent}
                      studentId={p.accountId}
                      isHost={isThisHost}
                      showVolumeSlider={true}
                    />
                  )
                })
              )}

              {!isUserInMainRoom && (
                <div className="p-4">
                  <PillButton
                    onClick={() => handleStudentSwitchRoom(sessionId)}
                    variant="secondary"
                    className="w-full"
                    disabled={isSwitching || !allowChange}
                  >
                    {!allowChange
                      ? t.rooms.breakoutRooms.changeLocked
                      : t.rooms.breakoutRooms.joinRoomBtn}
                  </PillButton>
                </div>
              )}
            </div>
          )}
        </div>

        {status?.breakoutSessions?.map((room) => {
          const isUserInThisRoom = currentSubSessionId === room.sessionId
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
            <div key={room.sessionId}>
              <ListItem
                onClick={() => toggleRoomExpand(room.roomName)}
                hoverEffect={true}
                leftContent={<Volume2 />}
                rightText={`${studentCount}${
                  status.maxParticipantsPerRoom
                    ? `/${status.maxParticipantsPerRoom}`
                    : ""
                }`}
                rightContent={
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleRoomExpand(room.roomName) }}
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
                  {isUserInThisRoom && (
                    <Badge color="emerald">
                      {t.rooms.breakoutRooms.youAreHere}
                    </Badge>
                  )}
                </div>
              </ListItem>

              {isExpanded && (
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
                        allLiveStudents.find(
                          (s) => String(s.accountId) === String(p.accountId),
                        ) || p
                      return (
                        <StudentRow
                          key={p.accountId}
                          student={enrichedStudent}
                          studentId={p.accountId}
                          isHost={isThisHost}
                          showVolumeSlider={true}
                        />
                      )
                    })
                  )}

                  {!isUserInThisRoom && (
                    <div className="p-4">
                      <PillButton
                        onClick={() => handleStudentSwitchRoom(room.sessionId)}
                        disabled={isSwitching || isFull || !allowChange}
                        variant="secondary"
                        className="w-full"
                      >
                        {!allowChange
                          ? t.rooms.breakoutRooms.changeLocked
                          : isFull
                            ? t.rooms.breakoutRooms.roomFull
                            : t.rooms.breakoutRooms.joinRoomBtn}
                      </PillButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BreakoutStudentView
