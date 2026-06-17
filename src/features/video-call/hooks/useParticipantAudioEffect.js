import { useEffect, useRef } from "react"

export const useParticipantAudioEffect = (participants) => {
  const prevParticipantsRef = useRef(participants)

  useEffect(() => {
    const prevParticipants = prevParticipantsRef.current
    const currentParticipants = participants

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

    if (newlyJoined.length > 0) {
      // Play join audio
      const audio = new Audio("/sounds/join.mp3")
      audio.play().catch((err) => {
        console.warn("Could not play join audio", err)
      })
    } else if (recentlyLeft.length > 0) {
      // Play leave audio
      const audio = new Audio("/sounds/leave.mp3")
      audio.play().catch((err) => {
        console.warn("Could not play leave audio", err)
      })
    }

    prevParticipantsRef.current = currentParticipants
  }, [participants])
}
