// Voice availability per language for AI tutor sessions.
// Keys are the learning language values used by the settings modal / backend.
export const VOICE_AVAILABILITY = {
  english: ["female", "male"],
  chinese: ["female"],
}

export const DEFAULT_AI_SETTINGS = {
  speed: 1.0,
  voice: "female",
}

export const SPEED_CONFIG = {
  min: 0.5,
  max: 2.0,
  step: 0.1,
  default: 1.0,
}

export const AI_SETTINGS_STORAGE_KEY = "aiSessionSettings"

// Languages available as speaking support aids (not learnable languages).
export const SUPPORT_LANGUAGES = ["vietnamese"]
