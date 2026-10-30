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

// BUG-PT: cảnh báo khi mic không thu được tín hiệu trong lúc ghi âm.
// Banner bật sau bannerMs im lặng liên tục; rời phòng sau exitMs.
// Có tiếng trở lại thì tắt banner và đếm lại từ mốc giọng nói cuối.
export const createNoHearingWatcher = ({
  bannerMs = 3000,
  exitMs = 10000,
  threshold = SILENCE_LEVEL,
  now = Date.now,
} = {}) => {
  let silentSince = null
  let lastVoiceAt = null

  const reset = (at = now()) => {
    silentSince = at
    lastVoiceAt = null
  }

  const push = (level) => {
    const at = now()
    if (Number(level) >= threshold) {
      lastVoiceAt = at
      silentSince = null
      return { silentMs: 0, showBanner: false, shouldExit: false }
    }
    if (silentSince == null) silentSince = lastVoiceAt ?? at
    const silentMs = at - silentSince
    return {
      silentMs,
      showBanner: silentMs >= bannerMs,
      shouldExit: silentMs >= exitMs,
    }
  }

  return { reset, push }
}
