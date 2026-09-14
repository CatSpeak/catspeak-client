// Co-host permission catalog (ticket 02 adds allow_self_camera).
// 12 codes shared with backend (cath + instructor). Grouped per SRS image 3:
// "Phân công Co-host" popup: Quản lý học viên (7) + Bảo mật lớp học (5) for Class.
// Custom room (roomType="room") reuses same 12 codes with room/member copy
// (Quản lý thành viên + Bảo mật phòng). See getPermissionLabel/getGroupTitle.

export const CO_HOST_PERMISSIONS = {
  MIC_TOGGLE: "mic_toggle",
  CAMERA_TOGGLE: "camera_toggle",
  MUTE_ALL: "mute_all",
  ALLOW_SELF_UNMUTE: "allow_self_unmute",
  ALLOW_SELF_CAMERA: "allow_self_camera",
  REMOVE_STUDENT: "remove_student",
  ADMIT_WAITING: "admit_waiting",
  LOCK_CLASS: "lock_class",
  END_CLASS: "end_class",
  SHARE_SCREEN: "share_screen",
  MANAGE_STUDENT_SHARE: "manage_student_share",
  RECORD: "record",
}

export const CO_HOST_ALL = [
  CO_HOST_PERMISSIONS.MIC_TOGGLE,
  CO_HOST_PERMISSIONS.CAMERA_TOGGLE,
  CO_HOST_PERMISSIONS.MUTE_ALL,
  CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE,
  CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA,
  CO_HOST_PERMISSIONS.REMOVE_STUDENT,
  CO_HOST_PERMISSIONS.ADMIT_WAITING,
  CO_HOST_PERMISSIONS.LOCK_CLASS,
  CO_HOST_PERMISSIONS.END_CLASS,
  CO_HOST_PERMISSIONS.SHARE_SCREEN,
  CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE,
  CO_HOST_PERMISSIONS.RECORD,
]

export const CO_HOST_PRESETS = {
  ASSISTANT: [
    CO_HOST_PERMISSIONS.MIC_TOGGLE,
    CO_HOST_PERMISSIONS.CAMERA_TOGGLE,
    CO_HOST_PERMISSIONS.MUTE_ALL,
    CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE,
    CO_HOST_PERMISSIONS.ADMIT_WAITING,
    CO_HOST_PERMISSIONS.SHARE_SCREEN,
  ],
  ALL: CO_HOST_ALL,
  CLEAR: [],
}

export const CO_HOST_GROUPS = [
  {
    id: "student_management",
    title: "Quản lý học viên",
    total: 7,
    permissions: [
      CO_HOST_PERMISSIONS.MIC_TOGGLE,
      CO_HOST_PERMISSIONS.CAMERA_TOGGLE,
      CO_HOST_PERMISSIONS.MUTE_ALL,
      CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE,
      CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA,
      CO_HOST_PERMISSIONS.REMOVE_STUDENT,
      CO_HOST_PERMISSIONS.ADMIT_WAITING,
    ],
  },
  {
    id: "room_security",
    title: "Bảo mật lớp học",
    total: 5,
    permissions: [
      CO_HOST_PERMISSIONS.LOCK_CLASS,
      CO_HOST_PERMISSIONS.END_CLASS,
      CO_HOST_PERMISSIONS.SHARE_SCREEN,
      CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE,
      CO_HOST_PERMISSIONS.RECORD,
    ],
  },
]

export const CO_HOST_PERMISSION_LABELS = {
  [CO_HOST_PERMISSIONS.MIC_TOGGLE]: "Bật/tắt quyền sử dụng mic",
  [CO_HOST_PERMISSIONS.CAMERA_TOGGLE]: "Bật/tắt quyền sử dụng camera",
  [CO_HOST_PERMISSIONS.MUTE_ALL]: "Tắt toàn bộ mic của học viên",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE]: "Cho phép học viên tự bật mic",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA]: "Cho phép học viên tự bật camera",
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: "Xóa học viên khỏi lớp học",
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]: "Duyệt học viên từ phòng chờ",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Khóa lớp học",
  [CO_HOST_PERMISSIONS.END_CLASS]: "Kết thúc lớp học",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: "Chia sẻ màn hình/cửa sổ",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Quản lý quyền chia sẻ màn hình/cửa sổ của học viên",
  [CO_HOST_PERMISSIONS.RECORD]: "Bắt đầu/dừng ghi hình",
}

// Room (Custom) copy: phòng / thành viên. Same 12 codes, different labels.
// Used when roomType === "room". Class keeps CO_HOST_PERMISSION_LABELS above.
export const CO_HOST_PERMISSION_LABELS_ROOM = {
  [CO_HOST_PERMISSIONS.MIC_TOGGLE]: "Bật/tắt quyền sử dụng mic",
  [CO_HOST_PERMISSIONS.CAMERA_TOGGLE]: "Bật/tắt quyền sử dụng camera",
  [CO_HOST_PERMISSIONS.MUTE_ALL]: "Tắt toàn bộ mic của thành viên",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE]: "Cho phép thành viên tự bật mic",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA]: "Cho phép thành viên tự bật camera",
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: "Xóa thành viên khỏi phòng",
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]: "Duyệt thành viên từ phòng chờ",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Khóa phòng",
  [CO_HOST_PERMISSIONS.END_CLASS]: "Kết thúc phòng",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: "Chia sẻ màn hình/cửa sổ",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Quản lý quyền chia sẻ màn hình/cửa sổ của thành viên",
  [CO_HOST_PERMISSIONS.RECORD]: "Bắt đầu/dừng ghi hình",
}

export const CO_HOST_PERMISSION_META = {
  [CO_HOST_PERMISSIONS.MIC_TOGGLE]: {
    icon: "Mic",
    isSensitive: false,
    helper: "Cho phép hoặc giới hạn mic của từng thành viên",
  },
  [CO_HOST_PERMISSIONS.CAMERA_TOGGLE]: {
    icon: "Video",
    isSensitive: false,
    helper: "Bật hoặc tắt camera của thành viên",
  },
  [CO_HOST_PERMISSIONS.MUTE_ALL]: {
    icon: "MicOff",
    isSensitive: false,
    helper: "Tắt mic tất cả học viên trong phòng",
  },
  [CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE]: {
    icon: "Volume2",
    isSensitive: false,
    helper: "Cho phép học viên tự mở lại mic",
  },
  [CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA]: {
    icon: "Video",
    isSensitive: false,
    helper: "Cho phép học viên tự bật lại camera",
  },
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: {
    icon: "UserX",
    isSensitive: true,
    severity: "danger",
    helper: "Mời học viên rời khỏi phòng học",
  },
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]: {
    icon: "UserCheck",
    isSensitive: false,
    helper: "Duyệt học viên từ phòng chờ vào lớp",
  },
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: {
    icon: "Lock",
    isSensitive: true,
    severity: "warning",
    helper: "Khóa phòng, không cho thêm người vào",
  },
  [CO_HOST_PERMISSIONS.END_CLASS]: {
    icon: "Power",
    isSensitive: true,
    severity: "danger",
    helper: "Đóng phòng và kết thúc phiên học",
  },
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: {
    icon: "MonitorUp",
    isSensitive: false,
    helper: "Chia sẻ màn hình hoặc cửa sổ bài giảng",
  },
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]: {
    icon: "Sliders",
    isSensitive: false,
    helper: "Quản lý quyền chia sẻ màn hình của học viên",
  },
  [CO_HOST_PERMISSIONS.RECORD]: {
    icon: "Disc",
    isSensitive: false,
    helper: "Bắt đầu hoặc dừng ghi hình phiên học",
  },
}

// Room (Custom) helpers: phòng / thành viên / trong phòng.
export const CO_HOST_PERMISSION_HELPERS_ROOM = {
  [CO_HOST_PERMISSIONS.MIC_TOGGLE]:
    "Cho phép hoặc giới hạn mic của từng thành viên",
  [CO_HOST_PERMISSIONS.CAMERA_TOGGLE]: "Bật hoặc tắt camera của thành viên",
  [CO_HOST_PERMISSIONS.MUTE_ALL]: "Tắt mic tất cả thành viên trong phòng",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE]:
    "Cho phép thành viên tự mở lại mic",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA]:
    "Cho phép thành viên tự bật lại camera",
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: "Mời thành viên rời khỏi phòng",
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]:
    "Duyệt thành viên từ phòng chờ vào phòng",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Khóa phòng, không cho thêm người vào",
  [CO_HOST_PERMISSIONS.END_CLASS]: "Đóng phòng và kết thúc phiên hoạt động",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]:
    "Chia sẻ màn hình hoặc cửa sổ trong phòng",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Quản lý quyền chia sẻ màn hình của thành viên",
  [CO_HOST_PERMISSIONS.RECORD]: "Bắt đầu hoặc dừng ghi hình trong phòng",
}

// Room group titles + preset/header fallbacks (VI).
export const CO_HOST_GROUP_TITLES_ROOM = {
  student_management: "Quản lý thành viên",
  room_security: "Bảo mật phòng",
}

export const CO_HOST_PRESET_ASSISTANT_LABEL_ROOM = "Gói Hỗ trợ điều hành"
export const CO_HOST_HEADER_SUBTITLE_ROOM =
  "Chỉ định người hỗ trợ và quản lý quyền hạn điều hành phòng"
export const CO_HOST_NOTE_DESC_ROOM =
  "Quyền của co-host chỉ áp dụng cho mỗi phòng."

export const isRoomTypeRoom = (roomType) => roomType !== "class"

export const getPermissionLabel = (code, roomType) => {
  if (isRoomTypeRoom(roomType)) {
    return (
      CO_HOST_PERMISSION_LABELS_ROOM[code] || CO_HOST_PERMISSION_LABELS[code]
    )
  }
  return CO_HOST_PERMISSION_LABELS[code]
}

export const getPermissionHelper = (code, roomType) => {
  const classHelper = (CO_HOST_PERMISSION_META[code] || {}).helper
  if (isRoomTypeRoom(roomType)) {
    return CO_HOST_PERMISSION_HELPERS_ROOM[code] || classHelper
  }
  return classHelper
}

export const getGroupTitle = (groupId, roomType, classTitle) => {
  if (isRoomTypeRoom(roomType)) {
    return CO_HOST_GROUP_TITLES_ROOM[groupId] || classTitle
  }
  return classTitle
}

export const countByGroup = (selected = []) => {
  const set = new Set(selected)
  const out = {}
  for (const g of CO_HOST_GROUPS) {
    out[g.id] = g.permissions.filter((p) => set.has(p)).length
  }
  return out
}

// Chuẩn hóa ApiResponse<{...coHost}> hoặc null: chỉ trả dto khi có coHostAccountId.
export const normalizeCoHost = (payload) => {
  if (!payload || typeof payload !== "object") return null
  const dto = payload.data ?? payload.result ?? payload
  if (!dto || typeof dto !== "object") return null
  const inner = dto.data ?? dto.result ?? dto
  if (!inner || typeof inner !== "object" || inner.coHostAccountId == null)
    return null
  return inner
}

// Ticket 02: helpers cho live enforce theo từng quyền con.
export const isCoHostUser = (coHost, accountId) => {
  if (!coHost?.coHostAccountId || accountId == null) return false
  return String(coHost.coHostAccountId) === String(accountId)
}

export const hasCoHostPermission = (coHost, accountId, code) => {
  if (!isCoHostUser(coHost, accountId)) return false
  return (coHost.permissions ?? []).includes(code)
}
