import { useEffect, useRef } from "react"

export const globalSounds = {
  correct: new Audio("/sounds/correct.mp3"),
  ticking: new Audio("/sounds/ticking.mp3"),
  join: new Audio("/sounds/join.mp3"),
  leave: new Audio("/sounds/leave.mp3"),
};

// Preload
Object.values(globalSounds).forEach(audio => {
  audio.preload = "auto";
});

let isUnlocked = false;
const unlockAudio = () => {
  if (isUnlocked) return;
  isUnlocked = true;
  Object.values(globalSounds).forEach(audio => {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
  });
  window.removeEventListener("touchstart", unlockAudio);
  window.removeEventListener("click", unlockAudio);
};

if (typeof window !== "undefined") {
  window.addEventListener("touchstart", unlockAudio);
  window.addEventListener("click", unlockAudio);
}

export const playGlobalSound = (name) => {
  const audio = globalSounds[name];
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
};
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
      playGlobalSound("join")
    } else if (recentlyLeft.length > 0) {
      // Play leave audio
      playGlobalSound("leave")
    }

    prevParticipantsRef.current = currentParticipants
  }, [participants])
}
