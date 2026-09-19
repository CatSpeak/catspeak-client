export const ACTIVE_SESSION_STORAGE_KEY = "catspeak_pt_active_session"
export const RESULT_STORAGE_KEY = "catspeak_pt_result"

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

export const saveResult = (result) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result))
  } catch {
    // Storage can be unavailable in strict private/security modes.
  }
}

export const readResult = () => {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(RESULT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearResult = () => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(RESULT_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}
