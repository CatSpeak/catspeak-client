export const REFUND_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  FAILED: 3,
}

export const REFUND_STATUS_CONFIG = {
  [REFUND_STATUS.PENDING]: {
    labelKey: "statusPending",
    defaultLabel: "Chờ xử lý",
    badgeStyle:
      "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50",
  },
  [REFUND_STATUS.APPROVED]: {
    labelKey: "statusApproved",
    defaultLabel: "Đã duyệt",
    badgeStyle:
      "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50",
  },
  [REFUND_STATUS.REJECTED]: {
    labelKey: "statusRejected",
    defaultLabel: "Từ chối",
    badgeStyle:
      "bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50",
  },
  [REFUND_STATUS.FAILED]: {
    labelKey: "statusFailed",
    defaultLabel: "Thất bại",
    badgeStyle:
      "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/50",
  },
}
