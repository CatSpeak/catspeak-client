export default {
  refunds: {
    title: "退款历史",
    subtitle: "跟踪您的付款退款请求状态。",
    requestRefundTitle: "申请退款",
    requestRefundSubtitle: "为订单 #{{orderCode}} 提交退款申请",
    
    // Statuses
    statusPending: "等待审核",
    statusApproved: "已批准",
    statusRejected: "已拒绝",
    statusFailed: "失败",
    
    // Modal steps
    checkingEligibility: "正在检查退款资格...",
    ineligibleTitle: "不符合退款条件",
    eligibleTitle: "符合退款条件",
    maxRefundAmount: "最大退款金额",
    paymentType: "交易类型",

    // Form fields
    selectBank: "选择收款银行",
    searchBankPlaceholder: "搜索银行...",
    accountNumber: "银行账号",
    accountNumberPlaceholder: "请输入银行账号...",
    accountHolderName: "开户人姓名",
    accountHolderPlaceholder: "请输入开户人大写姓名...",
    reasonLabel: "退款原因",
    reasonPlaceholder: "请说明您申请退款的原因...",

    // Actions & Buttons
    btnCheckEligibility: "检查资格",
    btnSubmitRequest: "提交退款申请",
    btnCancel: "取消",
    btnBack: "返回",
    btnDone: "完成",
    btnRequestRefund: "申请退款",
    btnRefresh: "刷新",

    // Errors & Success
    checkEligibilityError: "无法检查退款资格。请稍后再试。",
    defaultIneligibleReason: "交易已超过可申请退款的期限。",
    btnRetry: "重试",
    btnChangeBank: "更改",
    loadingBanks: "正在加载银行列表...",
    noBanksFound: "未找到银行。",

    errorNoBank: "请选择银行。",
    errorNoAccount: "请输入账号。",
    errorNoHolder: "请输入开户人姓名。",
    errorNoReason: "请输入退款原因。",
    errorSubmitFailed: "提交退款申请失败，请重试。",
    
    successTitle: "退款申请提交成功！",
    successSubtitle: "您的申请正在等待管理员审核。您可以在退款历史中跟踪进度。",

    // Table / History page
    noHistoryTitle: "暂无退款申请",
    noHistorySubtitle: "当您申请退款时，状态信息将显示在这里。",
    searchPlaceholder: "输入订单号或ID...",
    filterStatusAll: "所有状态",

    columns: {
      date: "申请日期",
      paymentId: "交易ID",
      amount: "退款金额",
      status: "状态",
      reason: "原因",
      bankInfo: "收款银行",
    },
  },
}
