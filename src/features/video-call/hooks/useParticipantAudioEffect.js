import { useEffect, useRef } from "react"

export const globalSounds = {
  correct: new Audio("/sounds/correct.mp3"),
  ticking: new Audio("/sounds/ticking.mp3"),
  join: new Audio("/sounds/join.mp3"),
  leave: new Audio("/sounds/leave.mp3"),
}

// Preload
Object.values(globalSounds).forEach((audio) => {
  audio.preload = "auto"
})

export const playGlobalSound = (name) => {
  try {
    const audio = globalSounds[name]
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  } catch {
    /* ignore */
  }
}
export const useParticipantAudioEffect = (participants, isSoundEnabled = false) => {
  const prevParticipantsRef = useRef(participants)
  const isInitialMountRef = useRef(true)

  useEffect(() => {
    const prevParticipants = prevParticipantsRef.current
    const currentParticipants = participants

    if (isInitialMountRef.current) {
      if (currentParticipants.length > 0) {
        isInitialMountRef.current = false
      }
      prevParticipantsRef.current = currentParticipants
      return
    }

    // Check for newly joined participants
    const newlyJoined = currentParticipants.filter(
      (current) =>
        !prevParticipants.find((prev) => prev.identity === current.identity),
    )

    // Check for recently left participants
    const recentlyLeft = prevParticipants.filter(
      (prev) =>
        !currentParticipants.find(
          (current) => current.identity === prev.identity,
        ),
    )

    if (isSoundEnabled) {
      if (newlyJoined.length > 0) {
        // Play join audio
        playGlobalSound("join")
      } else if (recentlyLeft.length > 0) {
        // Play leave audio
        playGlobalSound("leave")
      }
    }

    prevParticipantsRef.current = currentParticipants
  }, [participants, isSoundEnabled])
}
