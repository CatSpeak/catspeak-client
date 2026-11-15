// Đánh dấu phòng thi đang mở trong tab này. Rời phòng bằng điều hướng trong app
// thì xóa dấu; F5 không chạy cleanup nên dấu còn, lần mount sau biết là tải lại.
export const ROOM_MARKER_KEY = "catspeak_pt_room_open"

const readStorage = () => {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export const readRoomMarker = () => {
  try {
    return readStorage()?.getItem(ROOM_MARKER_KEY) ?? null
  } catch {
    return null
  }
}

export const writeRoomMarker = (value) => {
  try {
    const storage = readStorage()
    if (!storage) return
    if (value) storage.setItem(ROOM_MARKER_KEY, value)
    else storage.removeItem(ROOM_MARKER_KEY)
  } catch {
    // sessionStorage bị chặn: bỏ qua, chỉ mất hộp thoại tiếp tục
  }
}

export const clearRoomMarker = () => writeRoomMarker(null)
