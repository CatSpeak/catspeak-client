export default {
  refunds: {
    title: "Refund History",
    subtitle: "Track the status and manage refund requests for your payments.",
    requestRefundTitle: "Request Refund",
    requestRefundSubtitle: "Submit a refund request for order #{{orderCode}}",
    
    // Statuses
    statusPending: "Pending",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusFailed: "Failed",
    
    // Modal steps
    checkingEligibility: "Checking refund eligibility...",
    ineligibleTitle: "Not Eligible for Refund",
    eligibleTitle: "Eligible for Refund",
    maxRefundAmount: "Maximum Refund Amount",
    paymentType: "Payment Type",

    // Form fields
    selectBank: "Select Receiving Bank",
    searchBankPlaceholder: "Search bank...",
    accountNumber: "Account Number",
    accountNumberPlaceholder: "Enter account number...",
    accountHolderName: "Account Holder Name",
    accountHolderPlaceholder: "Enter account holder name (UPPERCASE)...",
    reasonLabel: "Reason for Refund",
    reasonPlaceholder: "Please explain why you are requesting a refund...",

    // Actions & Buttons
    btnCheckEligibility: "Check Eligibility",
    btnSubmitRequest: "Submit Refund Request",
    btnCancel: "Cancel",
    btnBack: "Back",
    btnDone: "Done",
    btnRequestRefund: "Request Refund",

    // Errors & Success
    errorNoBank: "Please select a bank.",
    errorNoAccount: "Please enter your account number.",
    errorNoHolder: "Please enter the account holder name.",
    errorNoReason: "Please enter a reason for the refund.",
    errorSubmitFailed: "Failed to submit refund request. Please try again.",
    
    successTitle: "Refund Request Submitted Successfully!",
    successSubtitle: "Your request is awaiting admin approval. You can track its status in your Refund History.",

    // Table / History page
    noHistoryTitle: "No refund requests found",
    noHistorySubtitle: "When you request a refund for a payment, its status will appear here.",
    searchPlaceholder: "Enter order code or ID...",
    filterStatusAll: "All Statuses",

    columns: {
      date: "Date",
      paymentId: "Payment ID",
      amount: "Refund Amount",
      status: "Status",
      reason: "Reason",
      bankInfo: "Receiving Bank",
    },
  },
}
