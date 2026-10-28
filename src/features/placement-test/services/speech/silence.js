import { SILENCE_LEVEL } from "../audio/constants"

export const createSilenceTracker = ({
  silenceMs = 2000,
  graceMs = 3000,
  threshold = SILENCE_LEVEL,
  now = Date.now,
} = {}) => {
  let startedAt = now()
  let lastVoiceAt = null
  let hasVoice = false

  const reset = (at = now()) => {
    startedAt = at
    lastVoiceAt = null
    hasVoice = false
  }

  const push = (level) => {
    const at = now()
    if (Number(level) >= threshold) {
      lastVoiceAt = at
      hasVoice = true
    }
    const elapsedMs = at - startedAt
    const silentMs = hasVoice && lastVoiceAt != null ? at - lastVoiceAt : 0
    return {
      hasVoice,
      hasSpoken: hasVoice,
      elapsedMs,
      silentMs,
      withinGrace: elapsedMs < graceMs,
      shouldSubmit: hasVoice && silentMs >= silenceMs && elapsedMs >= graceMs,
    }
  }

  return { reset, push }
}
