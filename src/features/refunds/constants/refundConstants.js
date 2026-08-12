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
    badgeStyle: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  [REFUND_STATUS.APPROVED]: {
    labelKey: "statusApproved",
    defaultLabel: "Đã duyệt",
    badgeStyle: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  [REFUND_STATUS.REJECTED]: {
    labelKey: "statusRejected",
    defaultLabel: "Từ chối",
    badgeStyle: "bg-rose-100 text-rose-800 border border-rose-200",
  },
  [REFUND_STATUS.FAILED]: {
    labelKey: "statusFailed",
    defaultLabel: "Thất bại",
    badgeStyle: "bg-red-100 text-red-800 border border-red-200",
  },
}
