/**
 * Voucher System Constants & Enums
 * Based on CatSpeak Voucher API Documentation (VOUCHER_API_DOCS.md)
 */

export const DISCOUNT_TYPES = {
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "FixedAmount",
}

export const DISCOUNT_TYPE_VALUES = {
  Percentage: 1,
  FixedAmount: 2,
}

export const SPONSOR_TYPES = {
  CATSPEAK: "CatSpeak",
  INSTRUCTOR: "Instructor",
}

export const SPONSOR_TYPE_VALUES = {
  CatSpeak: 1,
  Instructor: 2,
}

export const SCOPE_TYPES = {
  ALL: "All",
  SPECIFIC_COURSES: "SpecificCourses",
  SPECIFIC_CLASSES: "SpecificClasses",
}

export const SCOPE_TYPE_VALUES = {
  All: 1,
  SpecificCourses: 2,
  SpecificClasses: 3,
}

export const VOUCHER_STATUSES = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  DISABLED: "Disabled",
  EXPIRED: "Expired",
  EXHAUSTED: "Exhausted",
  PENDING_DEPOSIT: "PendingDeposit",
  PENDING_APPROVAL: "PendingApproval",
  REJECTED: "Rejected",
  STOPPED: "Stopped",
}

export const VOUCHER_STATUS_VALUES = {
  Draft: 1,
  Active: 2,
  Disabled: 3,
  Expired: 4,
  Exhausted: 5,
  PendingDeposit: 6,
  PendingApproval: 7,
  Rejected: 8,
  Stopped: 9,
}

export const VOUCHER_USAGE_STATUSES = {
  PENDING: "Pending",
  SUCCESS: "Success",
  CANCELLED: "Cancelled",
}

export const VOUCHER_USAGE_STATUS_VALUES = {
  Pending: 1,
  Success: 2,
  Cancelled: 3,
}

/**
 * Status Visual Configurations (Badge styles, labels & icons)
 */
export const VOUCHER_STATUS_CONFIG = {
  Draft: {
    labelKey: "statusDraft",
    defaultLabel: "Bản nháp",
    badgeClass: "bg-slate-100 dark:bg-[#272727] text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-[#3F3F3F]",
    dotClass: "bg-slate-400",
  },
  Active: {
    labelKey: "statusActive",
    defaultLabel: "Đang hoạt động",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  Disabled: {
    labelKey: "statusDisabled",
    defaultLabel: "Đã vô hiệu hóa",
    badgeClass: "bg-zinc-100 dark:bg-[#272727] text-zinc-600 dark:text-neutral-400 border-zinc-200 dark:border-[#3F3F3F]",
    dotClass: "bg-zinc-400",
  },
  Expired: {
    labelKey: "statusExpired",
    defaultLabel: "Đã hết hạn",
    badgeClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dotClass: "bg-amber-500",
  },
  Exhausted: {
    labelKey: "statusExhausted",
    defaultLabel: "Hết lượt dùng",
    badgeClass: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    dotClass: "bg-purple-500",
  },
  PendingDeposit: {
    labelKey: "statusPendingDeposit",
    defaultLabel: "Chờ nạp cọc",
    badgeClass: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    dotClass: "bg-blue-500",
  },
  PendingApproval: {
    labelKey: "statusPendingApproval",
    defaultLabel: "Chờ duyệt cọc",
    badgeClass: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    dotClass: "bg-yellow-500",
  },
  Rejected: {
    labelKey: "statusRejected",
    defaultLabel: "Bị từ chối",
    badgeClass: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dotClass: "bg-rose-500",
  },
  Stopped: {
    labelKey: "statusStopped",
    defaultLabel: "Đã dừng sớm",
    badgeClass: "bg-gray-100 dark:bg-[#272727] text-gray-700 dark:text-neutral-300 border-gray-200 dark:border-[#3F3F3F]",
    dotClass: "bg-gray-400",
  },
}

/**
 * Filter Tabs for Instructor Vouchers Dashboard
 */
export const INSTRUCTOR_VOUCHER_TABS = [
  { id: "all", labelKey: "tabAll", defaultLabel: "Tất cả" },
  { id: "Active", labelKey: "tabActive", defaultLabel: "Đang hoạt động" },
  { id: "Draft", labelKey: "tabDraft", defaultLabel: "Bản nháp" },
  { id: "PendingApproval", labelKey: "tabPendingApproval", defaultLabel: "Chờ duyệt" },
  { id: "PendingDeposit", labelKey: "tabPendingDeposit", defaultLabel: "Chờ nạp cọc" },
  { id: "Expired", labelKey: "tabExpired", defaultLabel: "Hết hạn / Đã đóng" },
]

/**
 * Sensitive keywords prohibited for Instructors (BR-VC-GV-03)
 */
export const SENSITIVE_KEYWORDS = [
  "CATSPEAK",
  "ADMIN",
  "PLATFORM",
  "CHÍNH THỨC",
  "CHINHTHUC",
  "HỆ THỐNG",
  "HETHONG",
  "BAN QUẢN TRỊ",
  "BANQUANTRI",
  "OFFICIAL",
]
