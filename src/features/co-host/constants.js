// Co-host permission catalog (ticket 01 foundation).
// 11 codes shared with backend (cath + instructor). Grouped per SRS image 3:
// "Phân công Co-host" popup: Quản lý học viên (6) + Bảo mật lớp học (5).

export const CO_HOST_PERMISSIONS = {
  MIC_TOGGLE: "mic_toggle",
  CAMERA_TOGGLE: "camera_toggle",
  MUTE_ALL: "mute_all",
  ALLOW_SELF_UNMUTE: "allow_self_unmute",
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
    total: 6,
    permissions: [
      CO_HOST_PERMISSIONS.MIC_TOGGLE,
      CO_HOST_PERMISSIONS.CAMERA_TOGGLE,
      CO_HOST_PERMISSIONS.MUTE_ALL,
      CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE,
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
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: "Xóa học viên khỏi lớp học",
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]: "Duyệt học viên từ phòng chờ",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Khóa lớp học",
  [CO_HOST_PERMISSIONS.END_CLASS]: "Kết thúc lớp học",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: "Chia sẻ màn hình/cửa sổ",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Quản lý quyền chia sẻ màn hình/cửa sổ của học viên",
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
