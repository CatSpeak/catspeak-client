export default {
  refunds: {
    title: "Refund history",
    subtitle: "Track the status and manage refund requests for your payments.",
    requestRefundTitle: "Request refund",
    requestRefundSubtitle: "Submit a refund request for order #{{orderCode}}",
    
    // Statuses
    statusPending: "Pending",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusFailed: "Failed",
    
    // Modal steps
    checkingEligibility: "Checking refund eligibility...",
    ineligibleTitle: "Not eligible for refund",
    eligibleTitle: "Eligible for refund",
    maxRefundAmount: "Maximum refund amount",
    paymentType: "Payment type",

    // Form fields
    selectBank: "Select receiving bank",
    searchBankPlaceholder: "Search bank...",
    accountNumber: "Account number",
    accountNumberPlaceholder: "Enter account number...",
    accountHolderName: "Account holder name",
    accountHolderPlaceholder: "Enter account holder name (uppercase)...",
    reasonLabel: "Reason for refund",
    reasonPlaceholder: "Please explain why you are requesting a refund...",

    // Actions & Buttons
    btnCheckEligibility: "Check eligibility",
    btnSubmitRequest: "Submit refund request",
    btnCancel: "Cancel",
    btnBack: "Back",
    btnDone: "Done",
    btnRequestRefund: "Request refund",
    btnRefresh: "Refresh",

    // Errors & Success
    checkEligibilityError: "Unable to check refund eligibility. Please try again later.",
    defaultIneligibleReason: "Transaction has passed the allowable refund window.",
    btnRetry: "Retry",
    btnChangeBank: "Change",
    loadingBanks: "Loading banks...",
    noBanksFound: "No banks found.",

    errorNoBank: "Please select a bank.",
    errorNoAccount: "Please enter your account number.",
    errorNoHolder: "Please enter the account holder name.",
    errorNoReason: "Please enter a reason for the refund.",
    errorSubmitFailed: "Failed to submit refund request. Please try again.",
    
    successTitle: "Refund request submitted successfully!",
    successSubtitle: "Your request is awaiting admin approval. You can track its status in your refund history.",

    // Table / History page
    noHistoryTitle: "No refund requests found",
    noHistorySubtitle: "When you request a refund for a payment, its status will appear here.",
    searchPlaceholder: "Enter order code or ID...",
    filterStatusAll: "All statuses",

    columns: {
      date: "Date",
      paymentId: "Payment ID",
      amount: "Refund amount",
      status: "Status",
      reason: "Reason",
      bankInfo: "Receiving bank",
    },
  },
}
