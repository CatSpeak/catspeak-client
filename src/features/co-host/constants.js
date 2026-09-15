// Co-host permission catalog.
// 19 codes shared with backend `cath-service` (the instructor API is a thin
// proxy that forwards them verbatim). Each code maps to exactly one in-room
// capability: granting "lower all hands" no longer implies "mute all".
// Grouped as: Quản lý học viên (7) + Kiểm duyệt (6) + Bảo mật lớp học (6) for
// Class. Custom room (roomType="room") reuses the same codes with room/member
// copy. See getPermissionLabel/getGroupTitle.

export const CO_HOST_PERMISSIONS = {
  MIC_TOGGLE: "mic_toggle",
  CAMERA_TOGGLE: "camera_toggle",
  MUTE_ALL: "mute_all",
  ALLOW_SELF_UNMUTE: "allow_self_unmute",
  ALLOW_SELF_CAMERA: "allow_self_camera",
  REMOVE_STUDENT: "remove_student",
  ADMIT_WAITING: "admit_waiting",
  CAMERA_OFF_ALL: "camera_off_all",
  BLOCK_ALL_MICS: "block_all_mics",
  LOWER_ALL_HANDS: "lower_all_hands",
  RESTRICT_CHAT: "restrict_chat",
  RESTRICT_VOICE: "restrict_voice",
  STOP_MEMBER_SHARE: "stop_member_share",
  LOCK_CLASS: "lock_class",
  END_CLASS: "end_class",
  SHARE_SCREEN: "share_screen",
  MANAGE_STUDENT_SHARE: "manage_student_share",
  ALLOW_MEMBER_RECORDING: "allow_member_recording",
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
  CO_HOST_PERMISSIONS.CAMERA_OFF_ALL,
  CO_HOST_PERMISSIONS.BLOCK_ALL_MICS,
  CO_HOST_PERMISSIONS.LOWER_ALL_HANDS,
  CO_HOST_PERMISSIONS.RESTRICT_CHAT,
  CO_HOST_PERMISSIONS.RESTRICT_VOICE,
  CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE,
  CO_HOST_PERMISSIONS.LOCK_CLASS,
  CO_HOST_PERMISSIONS.END_CLASS,
  CO_HOST_PERMISSIONS.SHARE_SCREEN,
  CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE,
  CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING,
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
    id: "member_moderation",
    title: "Kiểm duyệt thành viên",
    total: 6,
    permissions: [
      CO_HOST_PERMISSIONS.CAMERA_OFF_ALL,
      CO_HOST_PERMISSIONS.BLOCK_ALL_MICS,
      CO_HOST_PERMISSIONS.LOWER_ALL_HANDS,
      CO_HOST_PERMISSIONS.RESTRICT_CHAT,
      CO_HOST_PERMISSIONS.RESTRICT_VOICE,
      CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE,
    ],
  },
  {
    id: "room_security",
    title: "Bảo mật lớp học",
    total: 6,
    permissions: [
      CO_HOST_PERMISSIONS.LOCK_CLASS,
      CO_HOST_PERMISSIONS.END_CLASS,
      CO_HOST_PERMISSIONS.SHARE_SCREEN,
      CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE,
      CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING,
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
  [CO_HOST_PERMISSIONS.CAMERA_OFF_ALL]: "Tắt toàn bộ camera của học viên",
  [CO_HOST_PERMISSIONS.BLOCK_ALL_MICS]: "Chặn mic toàn bộ học viên",
  [CO_HOST_PERMISSIONS.LOWER_ALL_HANDS]: "Hạ tay toàn bộ học viên",
  [CO_HOST_PERMISSIONS.RESTRICT_CHAT]: "Hạn chế chat của học viên",
  [CO_HOST_PERMISSIONS.RESTRICT_VOICE]: "Hạn chế voice của học viên",
  [CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE]:
    "Dừng chia sẻ màn hình của học viên",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Khóa lớp học",
  [CO_HOST_PERMISSIONS.END_CLASS]: "Kết thúc lớp học",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: "Chia sẻ màn hình/cửa sổ",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Quản lý quyền chia sẻ màn hình/cửa sổ của học viên",
  [CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING]: "Cho phép học viên ghi hình",
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
  [CO_HOST_PERMISSIONS.CAMERA_OFF_ALL]: "Tắt toàn bộ camera của thành viên",
  [CO_HOST_PERMISSIONS.BLOCK_ALL_MICS]: "Chặn mic toàn bộ thành viên",
  [CO_HOST_PERMISSIONS.LOWER_ALL_HANDS]: "Hạ tay toàn bộ thành viên",
  [CO_HOST_PERMISSIONS.RESTRICT_CHAT]: "Hạn chế chat của thành viên",
  [CO_HOST_PERMISSIONS.RESTRICT_VOICE]: "Hạn chế voice của thành viên",
  [CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE]:
    "Dừng chia sẻ màn hình của thành viên",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Khóa phòng",
  [CO_HOST_PERMISSIONS.END_CLASS]: "Kết thúc phòng",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: "Chia sẻ màn hình/cửa sổ",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Quản lý quyền chia sẻ màn hình/cửa sổ của thành viên",
  [CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING]: "Cho phép thành viên ghi hình",
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
  [CO_HOST_PERMISSIONS.CAMERA_OFF_ALL]: {
    icon: "VideoOff",
    isSensitive: false,
    helper: "Tắt camera của toàn bộ học viên đang bật",
  },
  [CO_HOST_PERMISSIONS.BLOCK_ALL_MICS]: {
    icon: "MicOff",
    isSensitive: true,
    severity: "danger",
    helper: "Tắt mic toàn bộ và không cho học viên tự bật lại",
  },
  [CO_HOST_PERMISSIONS.LOWER_ALL_HANDS]: {
    icon: "Hand",
    isSensitive: false,
    helper: "Hạ tay của toàn bộ học viên đang giơ tay",
  },
  [CO_HOST_PERMISSIONS.RESTRICT_CHAT]: {
    icon: "MessageSquareOff",
    isSensitive: true,
    severity: "warning",
    helper: "Không cho học viên gửi tin nhắn trong phòng",
  },
  [CO_HOST_PERMISSIONS.RESTRICT_VOICE]: {
    icon: "MicOff",
    isSensitive: true,
    severity: "warning",
    helper: "Tắt mic của học viên và không cho tự bật lại",
  },
  [CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE]: {
    icon: "MonitorOff",
    isSensitive: false,
    helper: "Dừng phần chia sẻ màn hình đang diễn ra của học viên",
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
    helper: "Bật/tắt quyền cho học viên chia sẻ màn hình",
  },
  [CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING]: {
    icon: "Disc",
    isSensitive: false,
    helper: "Bật/tắt quyền cho học viên tự ghi hình",
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
  [CO_HOST_PERMISSIONS.CAMERA_OFF_ALL]:
    "Tắt camera của toàn bộ thành viên đang bật",
  [CO_HOST_PERMISSIONS.BLOCK_ALL_MICS]:
    "Tắt mic toàn bộ và không cho thành viên tự bật lại",
  [CO_HOST_PERMISSIONS.LOWER_ALL_HANDS]:
    "Hạ tay của toàn bộ thành viên đang giơ tay",
  [CO_HOST_PERMISSIONS.RESTRICT_CHAT]:
    "Không cho thành viên gửi tin nhắn trong phòng",
  [CO_HOST_PERMISSIONS.RESTRICT_VOICE]:
    "Tắt mic của thành viên và không cho tự bật lại",
  [CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE]:
    "Dừng phần chia sẻ màn hình đang diễn ra của thành viên",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Khóa phòng, không cho thêm người vào",
  [CO_HOST_PERMISSIONS.END_CLASS]: "Đóng phòng và kết thúc phiên hoạt động",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]:
    "Chia sẻ màn hình hoặc cửa sổ trong phòng",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Bật/tắt quyền cho thành viên chia sẻ màn hình",
  [CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING]:
    "Bật/tắt quyền cho thành viên tự ghi hình",
  [CO_HOST_PERMISSIONS.RECORD]: "Bắt đầu hoặc dừng ghi hình trong phòng",
}

// Room group titles + preset/header fallbacks (VI).
export const CO_HOST_GROUP_TITLES_ROOM = {
  student_management: "Quản lý thành viên",
  member_moderation: "Kiểm duyệt thành viên",
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
