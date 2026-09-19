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

const readKey = (key) => {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const writeKey = (key, value) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

const removeKey = (key) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    return
  }
}

export const saveActiveSession = (session) =>
  writeKey(ACTIVE_SESSION_STORAGE_KEY, session)

export const readActiveSession = () => readKey(ACTIVE_SESSION_STORAGE_KEY)

export const clearActiveSession = () => removeKey(ACTIVE_SESSION_STORAGE_KEY)

export const saveResult = (result) => writeKey(RESULT_STORAGE_KEY, result)

export const readResult = () => readKey(RESULT_STORAGE_KEY)

export const clearResult = () => removeKey(RESULT_STORAGE_KEY)
