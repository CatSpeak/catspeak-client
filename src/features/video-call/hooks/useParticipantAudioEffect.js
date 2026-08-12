import { useEffect, useRef, useState } from "react"
import {
  getRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"

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
export const useParticipantAudioEffect = (participants, roomId = null) => {
  const prevParticipantsRef = useRef(participants)
  const isInitialMountRef = useRef(true)
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    return getRoomSetting(roomId, ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND)
  })

  useEffect(() => {
    const handleSoundChange = () => {
      setIsSoundEnabled(getRoomSetting(roomId, ROOM_SETTING_KEYS.JOIN_LEAVE_SOUND))
    }
    handleSoundChange()
    window.addEventListener("catspeak_join_leave_sound_changed", handleSoundChange)
    return () => {
      window.removeEventListener("catspeak_join_leave_sound_changed", handleSoundChange)
    }
  }, [roomId])

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
