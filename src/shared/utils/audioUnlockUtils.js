/**
 * Unlocks the WebAudio AudioContext upon a direct user gesture (touch / click).
 * Essential for iOS Safari to allow unmuted WebAudio and WebRTC audio playback.
 */
let sharedAudioContext = null

export const unlockAudioContext = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (AudioCtx) {
      if (!sharedAudioContext || sharedAudioContext.state === "closed") {
        sharedAudioContext = new AudioCtx()
      }
      if (sharedAudioContext.state === "suspended") {
        sharedAudioContext.resume().catch(() => {})
      }
    }
  } catch (err) {
    console.warn("[audioUnlockUtils] AudioContext unlock warning:", err)
  }
}
