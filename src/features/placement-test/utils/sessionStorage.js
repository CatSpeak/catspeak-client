export const ACTIVE_SESSION_STORAGE_KEY = "catspeak_pt_active_session"
export const RESULT_STORAGE_KEY = "catspeak_pt_result"

// Mọi khoá của Placement Test dùng chung tiền tố này để logout quét sạch một lần.
const STORAGE_PREFIX = "catspeak_pt_"
const USER_STORAGE_KEY = "user"

const getStorage = () => {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

const readOwnerId = () => {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    const user = JSON.parse(raw)
    const id = user?.accountId ?? user?.id
    return id === null || id === undefined ? null : String(id)
  } catch {
    return null
  }
}

const readKey = (key) => {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw)
    const ownerId = readOwnerId()
    // Bản ghi cũ (trước khi gắn chủ sở hữu) hoặc của tài khoản khác: bỏ hẳn
    // thay vì hiển thị nhầm dữ liệu của người đăng nhập trước.
    if (
      !entry ||
      typeof entry !== "object" ||
      !("value" in entry) ||
      !ownerId ||
      String(entry.ownerId) !== ownerId
    ) {
      storage.removeItem(key)
      return null
    }
    return entry.value
  } catch {
    return null
  }
}

const writeKey = (key, value) => {
  const storage = getStorage()
  if (!storage) return
  const ownerId = readOwnerId()
  if (!ownerId) return
  try {
    storage.setItem(key, JSON.stringify({ ownerId, value }))
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

export const clearPlacementCache = () => {
  const storage = getStorage()
  if (!storage) return
  try {
    const keys = []
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key)
    }
    keys.forEach((key) => storage.removeItem(key))
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
