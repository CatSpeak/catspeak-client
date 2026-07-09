import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import {
  useStopBreakoutRoomsMutation,
  useJoinBreakoutRoomMutation,
  useMoveParticipantMutation,
  useToggleAllowChangeRoomMutation,
  useBroadcastBreakoutNotificationMutation,
} from "@/store/api/roomsApi"
import {
  enterBreakout,
  exitBreakout,
  updateLivekitToken,
} from "@/store/slices/videoCallSlice"

import BreakoutActiveHeader from "./BreakoutActiveHeader"
import BreakoutActiveRoomList from "./BreakoutActiveRoomList"
import BreakoutActiveFooter from "./BreakoutActiveFooter"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useDragScroll } from "../../../hooks/useDragScroll"

const BreakoutActiveView = ({
  sessionId,
  status,
  refetchStatus,
  isHost,
  currentSubSessionId,
  roomCreatorId,
  allLiveStudents,
}) => {
  const { t } = useLanguage()
  const dispatch = useDispatch()

  const [stopBreakoutRooms, { isLoading: isStopping }] =
    useStopBreakoutRoomsMutation()
  const [joinBreakoutRoom, { isLoading: isJoiningRoom }] =
    useJoinBreakoutRoomMutation()
  const [moveParticipant, { isLoading: isMovingPart }] =
    useMoveParticipantMutation()
  const [toggleAllowChangeRoom, { isLoading: isTogglingAllow }] =
    useToggleAllowChangeRoomMutation()
  const [broadcastNotification, { isLoading: isBroadcasting }] =
    useBroadcastBreakoutNotificationMutation()

  const { containerRef, handleDragOverScroll, handleDragLeaveScroll } = useDragScroll()

  // Active Phase Accordion State
  const [expandedRooms, setExpandedRooms] = useState({})

  const toggleRoomExpand = (roomName) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomName]: !prev[roomName],
    }))
  }

  // Initialize accordion state when active breakout rooms arrive
  useEffect(() => {
    if (status?.isBreakoutActive && status.breakoutSessions) {
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

  // Stop Breakout Rooms (Đóng phòng)
  const handleStopBreakouts = async () => {
    try {
      await stopBreakoutRooms(sessionId).unwrap()
      dispatch(exitBreakout())
      refetchStatus()
    } catch (err) {
      console.error(err)
      toast.error(t.rooms.breakoutRooms.closeError)
    }
  }

  // Relocate student in active phase (API call)
  const handleRelocateStudentActive = async (accountId, targetSubSessionId) => {
    try {
      await moveParticipant({
        sessionId,
        accountId,
        targetSubSessionId,
      }).unwrap()
      refetchStatus()
    } catch (err) {
      console.error(err)
      toast.error(err?.data?.message || t.rooms.breakoutRooms.moveError)
    }
  }

  // Host Join sub-room
  const handleHostJoin = async (subSessionId, roomName) => {
    try {
      const res = await joinBreakoutRoom({ sessionId, subSessionId }).unwrap()
      dispatch(enterBreakout({ subSessionId, roomName, token: res.token }))
    } catch (err) {
      console.error(err)
      toast.error(t.rooms.breakoutRooms.joinError)
    }
  }

  // Host Return to Main Room
  const handleHostLeave = async () => {
    try {
      const res = await joinBreakoutRoom({
        sessionId,
        subSessionId: sessionId,
      }).unwrap()
      dispatch(exitBreakout())
      dispatch(updateLivekitToken(res.token))
    } catch (err) {
      console.error(err)
      toast.error(t.rooms.breakoutRooms.returnMainError)
    }
  }

  // Send broadcast announcement
  const [broadcastMsg, setBroadcastMsg] = useState("")

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault()
    if (!broadcastMsg.trim()) return

    try {
      await broadcastNotification({
        sessionId,
        message: broadcastMsg.trim(),
      }).unwrap()
      setBroadcastMsg("")
    } catch (err) {
      console.error(err)
      toast.error(t.rooms.breakoutRooms.broadcastError)
    }
  }

  // Host Live Toggle Allow Participant Change Room
  const handleToggleAllowChange = async (newVal) => {
    try {
      await toggleAllowChangeRoom({
        sessionId,
        allowParticipantChangeRoom: newVal,
      }).unwrap()
    } catch (err) {
      console.error(err)
      toast.error(t.rooms.breakoutRooms.toggleAllowError)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <BreakoutActiveHeader
        status={status}
        isHost={isHost}
        isTogglingAllow={isTogglingAllow}
        handleToggleAllowChange={handleToggleAllowChange}
      />

      <div 
        ref={containerRef}
        onDragOver={handleDragOverScroll}
        onDragLeave={handleDragLeaveScroll}
        className="flex-1 overflow-y-auto"
      >
        <BreakoutActiveRoomList
          status={status}
          currentSubSessionId={currentSubSessionId}
          expandedRooms={expandedRooms}
          toggleRoomExpand={toggleRoomExpand}
          roomCreatorId={roomCreatorId}
          handleRelocateStudentActive={handleRelocateStudentActive}
          sessionId={sessionId}
          handleHostJoin={handleHostJoin}
          students={allLiveStudents}
          handleHostLeave={handleHostLeave}
          isJoiningRoom={isJoiningRoom}
        />
      </div>

      <BreakoutActiveFooter
        broadcastMsg={broadcastMsg}
        setBroadcastMsg={setBroadcastMsg}
        handleBroadcastSubmit={handleBroadcastSubmit}
        isBroadcasting={isBroadcasting}
        handleStopBreakouts={handleStopBreakouts}
        isStopping={isStopping}
      />
    </div>
  )
}

export default BreakoutActiveView
