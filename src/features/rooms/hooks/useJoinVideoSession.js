import { useState } from "react"
import { toast } from "react-hot-toast"
import {
  useGetActiveVideoSessionsQuery,
  useJoinVideoSessionMutation,
  useCreateVideoSessionMutation,
} from "@/store/api/videoSessionsApi"
import { useLanguage } from "@/shared/context/LanguageContext"

export const useJoinVideoSession = ({ roomId, isAuthenticated = true }) => {
  const { t } = useLanguage()

  const {
    data: activeSessions,
    isLoading: isLoadingSessions,
    refetch: refetchActiveSessions,
  } = useGetActiveVideoSessionsQuery(undefined, {
    skip: !isAuthenticated || !roomId,
  })

  const [joinVideoSession, { isLoading: isJoining }] =
    useJoinVideoSessionMutation()
  const [createVideoSession, { isLoading: isCreating }] =
    useCreateVideoSessionMutation()

  const activeSession = activeSessions?.find(
    (s) => s.roomId === parseInt(roomId),
  )

  /**
   * Joins or creates a video session for the room.
   * Returns the sessionId on success, or null on failure.
   * Does NOT navigate — the caller manages state transitions.
   */
  const handleJoin = async ({ isRoomFull, micOn, cameraOn }) => {
    try {
      if (isRoomFull) {
        toast.error(t.rooms.waitingScreen.roomFull)
        return null
      }

      let sessionId

      if (activeSession) {
        try {
          // Session exists -> Join it explicitly
          await joinVideoSession(activeSession.sessionId).unwrap()
          sessionId = activeSession.sessionId
        } catch (err) {
          console.warn(
            "Failed to join active session, falling back to create:",
            err,
          )
        }
      }

      if (!sessionId) {
        // No session or failed to join -> create new session
        try {
          const newSession = await createVideoSession({
            roomId: parseInt(roomId),
          }).unwrap()
          sessionId = newSession.sessionId
        } catch (err) {
          console.warn(
            "Create session failed, checking for active session...",
            err,
          )
          const { data: refreshedSessions } = await refetchActiveSessions()
          const retrySession = refreshedSessions?.find(
            (s) => s.roomId === parseInt(roomId),
          )

          if (retrySession) {
            sessionId = retrySession.sessionId
          } else {
            console.error("Failed to create or join session:", err)
            toast.error(t.rooms.waitingScreen.createSessionError)
            return null
          }
        }
      }

      return { sessionId, micOn, cameraOn }
    } catch (err) {
      console.error("Failed to process join:", err)
      toast.error(t.rooms.waitingScreen.joinError)
      return null
    }
  }

  return {
    handleJoin,
    isJoining,
    isCreating,
    isLoadingSessions,
    activeSession,
  }
}
