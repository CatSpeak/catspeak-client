export const ACTIVE_SESSION_STORAGE_KEY = "catspeak_pt_active_session"

const getStorage = () => {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const saveActiveSession = (session) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Storage can be unavailable in strict private/security modes.
  }
}

export const readActiveSession = () => {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(ACTIVE_SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearActiveSession = () => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}
