export default {
  billing: {
    billingHistory: "Billing History",
    planCard: {
      suffixes: {
        MAX_ACTIVE_ROOMS: " rooms",
        MAX_PARTICIPANTS: " users",
        MAX_STORAGE_MB: " MB",
        MAX_AI_MESSAGES: " messages",
        MAX_REELS_UPLOAD: " videos"
      }
    },
    pricing: {
      title: "Subscription Plans",
      subtitle: "Choose the right plan for your needs.",
      customPaymentTitle: "Custom Payment Amount",
      customPaymentSubtitle: "Please enter the amount you would like to pay for the Pro plan (in VND).",
      amountLabel: "Amount (VND)",
      cancel: "Cancel",
      proceedToPay: "Proceed to Pay",
      processing: "Processing...",
      currentPlan: "Current Plan",
      included: "Included in your plan",
      upgradeTo: "Upgrade to {{planName}}",
    },
    history: {
      title: "Payment History",
      subtitle: "View your past invoices and billing history.",
      noHistoryTitle: "No payment history",
      noHistorySubtitle: "You don't have any past invoices yet. Once you upgrade or make a payment, it will appear here.",
      columns: {
        date: "Date",
        orderCode: "Order Code",
        method: "Method",
        amount: "Amount",
        status: "Status",
        actions: "Actions",
      },
      actions: {
        report: "Report",
        repay: "Repay",
      },
      statuses: {
        success: "Success",
        pending: "Pending",
        cancelled: "Cancelled",
      }
    },
    result: {
      cancelling: "Cancelling payment...",
      successTitle: "Payment Successful!",
      successSubtitle: "Thank you for your purchase. Your plan has been successfully upgraded.",
      redirecting: "Redirecting...",
      processing: "Verifying payment status...",
      returnToBilling: "Return to Billing",
    },
    checkoutModal: {
      title: "Subscription Checkout",
      subtitle: "You are choosing to upgrade to {{planName}}.",
      paymentMethod: "Payment Method",
      payosSub: "Bank Transfer / QR Code",
      momoSub: "Pay with MoMo e-wallet",
      stripeSub: "Credit / Debit Card",
      comingSoon: "Coming soon",
      cancel: "Cancel",
      confirm: "Confirm & Pay"
    },
    reportIssueModal: {
      title: "Report Payment Issue",
      subtitle: "If you experienced an issue with payment #{{paymentId}}, please explain below. You can also upload a screenshot of your transaction.",
      explanationLabel: "Explanation",
      explanationPlaceholder: "Please describe the issue...",
      proofImageLabel: "Proof Image (Optional)",
      uploadFileText: "Click to upload a file",
      errorNoExplanation: "Please provide an explanation.",
      errorSubmitFailed: "Failed to submit report. Please try again.",
      cancel: "Cancel",
      submit: "Submit Report",
      successTitle: "Report Submitted",
      successSubtitle: "We have received your report and will investigate the issue.",
      done: "Done"
    }
  }
}
