// Co-host permission catalog.
// 19 codes shared with backend `cath-service` (the instructor API is a thin
// proxy that forwards them verbatim). Each code maps to exactly one in-room
// capability: granting "lower all hands" no longer implies "mute all".
// Grouped as: Student management (7) + Moderation (6) + Room security (6).
// Custom room (roomType="room") reuses the same codes with room/member copy.
// Display labels/helpers always come from i18n (`t.rooms.coHost.*`); the
// constants below are English safety fallbacks only.

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
    title: "Student management",
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
    title: "Member moderation",
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
    title: "Room security",
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
  [CO_HOST_PERMISSIONS.MIC_TOGGLE]: "Allow mic control",
  [CO_HOST_PERMISSIONS.CAMERA_TOGGLE]: "Allow camera control",
  [CO_HOST_PERMISSIONS.MUTE_ALL]: "Mute all students",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE]: "Allow students to unmute themselves",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA]: "Allow students to enable camera",
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: "Remove a student from the class",
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]: "Admit students from the waiting room",
  [CO_HOST_PERMISSIONS.CAMERA_OFF_ALL]: "Turn off all student cameras",
  [CO_HOST_PERMISSIONS.BLOCK_ALL_MICS]: "Block all student microphones",
  [CO_HOST_PERMISSIONS.LOWER_ALL_HANDS]: "Lower all raised hands",
  [CO_HOST_PERMISSIONS.RESTRICT_CHAT]: "Restrict student chat",
  [CO_HOST_PERMISSIONS.RESTRICT_VOICE]: "Restrict student voice",
  [CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE]: "Stop a student screen share",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Lock the class",
  [CO_HOST_PERMISSIONS.END_CLASS]: "End the class",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: "Share screen or window",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Manage student screen-sharing permissions",
  [CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING]: "Allow students to record",
  [CO_HOST_PERMISSIONS.RECORD]: "Start or stop recording",
}

// Room (Custom) copy: room / member wording. Same 19 codes.
export const CO_HOST_PERMISSION_LABELS_ROOM = {
  [CO_HOST_PERMISSIONS.MIC_TOGGLE]: "Allow mic control",
  [CO_HOST_PERMISSIONS.CAMERA_TOGGLE]: "Allow camera control",
  [CO_HOST_PERMISSIONS.MUTE_ALL]: "Mute all members",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE]: "Allow members to unmute themselves",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA]: "Allow members to enable camera",
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: "Remove a member from the room",
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]: "Admit members from the waiting room",
  [CO_HOST_PERMISSIONS.CAMERA_OFF_ALL]: "Turn off all member cameras",
  [CO_HOST_PERMISSIONS.BLOCK_ALL_MICS]: "Block all member microphones",
  [CO_HOST_PERMISSIONS.LOWER_ALL_HANDS]: "Lower all raised hands",
  [CO_HOST_PERMISSIONS.RESTRICT_CHAT]: "Restrict member chat",
  [CO_HOST_PERMISSIONS.RESTRICT_VOICE]: "Restrict member voice",
  [CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE]: "Stop a member screen share",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Lock the room",
  [CO_HOST_PERMISSIONS.END_CLASS]: "End the room",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: "Share screen or window",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Manage member screen-sharing permissions",
  [CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING]: "Allow members to record",
  [CO_HOST_PERMISSIONS.RECORD]: "Start or stop recording",
}

export const CO_HOST_PERMISSION_META = {
  [CO_HOST_PERMISSIONS.MIC_TOGGLE]: {
    icon: "Mic",
    isSensitive: false,
    helper: "Allow or restrict each member's microphone",
  },
  [CO_HOST_PERMISSIONS.CAMERA_TOGGLE]: {
    icon: "Video",
    isSensitive: false,
    helper: "Turn a member's camera on or off",
  },
  [CO_HOST_PERMISSIONS.MUTE_ALL]: {
    icon: "MicOff",
    isSensitive: false,
    helper: "Mute every student in the room",
  },
  [CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE]: {
    icon: "Volume2",
    isSensitive: false,
    helper: "Allow students to unmute themselves again",
  },
  [CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA]: {
    icon: "Video",
    isSensitive: false,
    helper: "Allow students to turn their camera back on",
  },
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: {
    icon: "UserX",
    isSensitive: true,
    severity: "danger",
    helper: "Ask a student to leave the class",
  },
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]: {
    icon: "UserCheck",
    isSensitive: false,
    helper: "Admit students from the waiting room into the class",
  },
  [CO_HOST_PERMISSIONS.CAMERA_OFF_ALL]: {
    icon: "VideoOff",
    isSensitive: false,
    helper: "Turn off the camera of every student who has it on",
  },
  [CO_HOST_PERMISSIONS.BLOCK_ALL_MICS]: {
    icon: "MicOff",
    isSensitive: true,
    severity: "danger",
    helper: "Mute everyone and prevent students from unmuting",
  },
  [CO_HOST_PERMISSIONS.LOWER_ALL_HANDS]: {
    icon: "Hand",
    isSensitive: false,
    helper: "Lower every raised hand",
  },
  [CO_HOST_PERMISSIONS.RESTRICT_CHAT]: {
    icon: "MessageSquareOff",
    isSensitive: true,
    severity: "warning",
    helper: "Prevent students from sending chat messages",
  },
  [CO_HOST_PERMISSIONS.RESTRICT_VOICE]: {
    icon: "MicOff",
    isSensitive: true,
    severity: "warning",
    helper: "Mute students and prevent them from unmuting",
  },
  [CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE]: {
    icon: "MonitorOff",
    isSensitive: false,
    helper: "Stop an ongoing student screen share",
  },
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: {
    icon: "Lock",
    isSensitive: true,
    severity: "warning",
    helper: "Lock the room so no one else can join",
  },
  [CO_HOST_PERMISSIONS.END_CLASS]: {
    icon: "Power",
    isSensitive: true,
    severity: "danger",
    helper: "Close the room and end the session",
  },
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: {
    icon: "MonitorUp",
    isSensitive: false,
    helper: "Share a screen or lecture window",
  },
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]: {
    icon: "Sliders",
    isSensitive: false,
    helper: "Allow or block student screen sharing",
  },
  [CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING]: {
    icon: "Disc",
    isSensitive: false,
    helper: "Allow students to record the session themselves",
  },
  [CO_HOST_PERMISSIONS.RECORD]: {
    icon: "Disc",
    isSensitive: false,
    helper: "Start or stop recording the session",
  },
}

// Room (Custom) helpers: room / member wording.
export const CO_HOST_PERMISSION_HELPERS_ROOM = {
  [CO_HOST_PERMISSIONS.MIC_TOGGLE]:
    "Allow or restrict each member's microphone",
  [CO_HOST_PERMISSIONS.CAMERA_TOGGLE]: "Turn a member's camera on or off",
  [CO_HOST_PERMISSIONS.MUTE_ALL]: "Mute every member in the room",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_UNMUTE]:
    "Allow members to unmute themselves again",
  [CO_HOST_PERMISSIONS.ALLOW_SELF_CAMERA]:
    "Allow members to turn their camera back on",
  [CO_HOST_PERMISSIONS.REMOVE_STUDENT]: "Ask a member to leave the room",
  [CO_HOST_PERMISSIONS.ADMIT_WAITING]:
    "Admit members from the waiting room into the room",
  [CO_HOST_PERMISSIONS.CAMERA_OFF_ALL]:
    "Turn off the camera of every member who has it on",
  [CO_HOST_PERMISSIONS.BLOCK_ALL_MICS]:
    "Mute everyone and prevent members from unmuting",
  [CO_HOST_PERMISSIONS.LOWER_ALL_HANDS]: "Lower every raised hand",
  [CO_HOST_PERMISSIONS.RESTRICT_CHAT]:
    "Prevent members from sending chat messages",
  [CO_HOST_PERMISSIONS.RESTRICT_VOICE]:
    "Mute members and prevent them from unmuting",
  [CO_HOST_PERMISSIONS.STOP_MEMBER_SHARE]:
    "Stop an ongoing member screen share",
  [CO_HOST_PERMISSIONS.LOCK_CLASS]: "Lock the room so no one else can join",
  [CO_HOST_PERMISSIONS.END_CLASS]: "Close the room and end the session",
  [CO_HOST_PERMISSIONS.SHARE_SCREEN]: "Share a screen or window in the room",
  [CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE]:
    "Allow or block member screen sharing",
  [CO_HOST_PERMISSIONS.ALLOW_MEMBER_RECORDING]:
    "Allow members to record the session themselves",
  [CO_HOST_PERMISSIONS.RECORD]: "Start or stop recording in the room",
}

// Room group titles + preset/header fallbacks.
export const CO_HOST_GROUP_TITLES_ROOM = {
  student_management: "Member management",
  member_moderation: "Member moderation",
  room_security: "Room security",
}

export const CO_HOST_PRESET_ASSISTANT_LABEL_ROOM = "Assistant preset"
export const CO_HOST_HEADER_SUBTITLE_ROOM =
  "Assign helpers and manage room moderation permissions"
export const CO_HOST_NOTE_DESC_ROOM = "Co-host permissions apply per room."

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

// Normalize ApiResponse<{...coHost}> or null: only return a dto with coHostAccountId.
export const normalizeCoHost = (payload) => {
  if (!payload || typeof payload !== "object") return null
  const dto = payload.data ?? payload.result ?? payload
  if (!dto || typeof dto !== "object") return null
  const inner = dto.data ?? dto.result ?? dto
  if (!inner || typeof inner !== "object" || inner.coHostAccountId == null)
    return null
  return inner
}

// Ticket 02: helpers for live enforcement per permission code.
export const isCoHostUser = (coHost, accountId) => {
  if (!coHost?.coHostAccountId || accountId == null) return false
  return String(coHost.coHostAccountId) === String(accountId)
}

export const hasCoHostPermission = (coHost, accountId, code) => {
  if (!isCoHostUser(coHost, accountId)) return false
  return (coHost.permissions ?? []).includes(code)
}
