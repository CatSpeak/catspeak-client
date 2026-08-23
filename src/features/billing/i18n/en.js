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
      planFree: "Free Plan",
      planPro: "Room Pro Plan",
      activated: "Activated",
      popular: "Popular",
      featuresFree: [
        "Join room meetings (maximum 1 room at a time)",
        "Up to 50 people in a room",
        "Maximum meeting duration of 60 minutes",
        "Basic privacy options",
        "Use basic AI learning assistant tools",
        "Join free community events",
        "Basic support"
      ],
      featuresPro: [
        "Create up to 3 rooms simultaneously and host rooms",
        "Unlimited meeting duration",
        "Up to 100 people in a room",
        "Advanced privacy settings",
        "Customize room thumbnails",
        "Advanced AI learning assistant tools",
        "Participate in workshops, talk shows, and challenges",
        "Priority support"
      ],
      tabTitle: "Upgrade Plans",
    },
    checkout: {
      title: "Service Payment",
      transferInfo: "Transfer Information",
      recipientInfo: "Recipient Information",
      bank: "Bank",
      accountNo: "Account Number",
      accountOwner: "Account Owner",
      memo: "Transfer Reference (optional)",
      buyerInfo: "Buyer Information",
      fullName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      paymentDetails: "Payment Details",
      price: "Price",
      vat: "VAT (0%)",
      total: "Total Payment",
      submit: "Pay Now",
      secure: "Your information is fully secured and encrypted",
      agreeTerms: "I agree to the Terms of Service and Privacy Policy",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy"
    },
    history: {
      title: "Payment history",
      subtitle: "View your past invoices and billing history.",
      noHistoryTitle: "No payment history",
      noHistorySubtitle: "You don't have any past invoices yet. Once you upgrade or make a payment, it will appear here.",
      searchPlaceholder: "Enter invoice ID...",
      dateFilterAll: "All time",
      dateFilterWeek: "Last 7 days",
      dateFilterMonth: "Last 30 days",
      statusFilterAll: "All statuses",
      statusFilterSuccess: "Success",
      statusFilterFailed: "Failed",
      statusFilterPending: "Pending",
      statusFilterRefunded: "Refunded",
      statusFilterCancelled: "Cancelled",
      noResults: "No results found",
      noResultsHint: "Try changing the filters or search keyword.",
      showingResults: "Showing {{count}} result(s)",
      columns: {
        date: "Date",
        orderCode: "Order code",
        method: "Method",
        amount: "Amount",
        status: "Status",
        actions: "Actions",
      },
      actions: {
        report: "Report",
        repay: "Repay",
        refund: "Refund",
      },
      statuses: {
        success: "Success",
        failed: "Failed",
        pending: "Pending",
        refunded: "Refunded",
        cancelled: "Cancelled",
      }
    },
    result: {
      cancelling: "Cancelling payment...",
      successTitle: "Payment successful!",
      successSubtitle: "Thank you for your purchase. Your plan has been successfully upgraded.",
      redirecting: "Redirecting...",
      processing: "Verifying payment status...",
      returnToBilling: "Return to billing history",
    },
    checkoutModal: {
      title: "Subscription checkout",
      subtitle: "You are choosing to upgrade to {{planName}}.",
      paymentMethod: "Payment method",
      payosSub: "Bank transfer / QR Code",
      momoSub: "Pay with MoMo e-wallet",
      stripeSub: "Credit / debit card",
      comingSoon: "Coming soon",
      cancel: "Cancel",
      confirm: "Confirm & pay"
    },
    reportIssueModal: {
      title: "Report payment issue",
      subtitle: "If you experienced an issue with payment #{{paymentId}}, please explain below. You can also upload a screenshot of your transaction.",
      explanationLabel: "Explanation",
      explanationPlaceholder: "Please describe the issue...",
      proofImageLabel: "Proof image (optional)",
      uploadFileText: "Click to upload a file",
      errorNoExplanation: "Please provide an explanation.",
      errorSubmitFailed: "Failed to submit report. Please try again.",
      cancel: "Cancel",
      submit: "Submit report",
      successTitle: "Report submitted",
      successSubtitle: "We have received your report and will investigate the issue.",
      done: "Done"
    },
    checkoutClass: {
      // Breadcrumb
      breadcrumbHome: "Home",
      breadcrumbExplore: "Explore courses",
      breadcrumbCourseDetail: "Course details",
      breadcrumbClassDetail: "Class details",
      breadcrumbCheckout: "Class checkout",

      // Page
      pageTitle: "Class Checkout",
      classNotFound: "Class not found",
      classNotFoundDesc: "This class may not exist or has been removed.",
      backToHome: "Back to home",

      // Fallback texts
      fallbackName: "You",
      fallbackCourseName: "Standalone class",
      fallbackNoSchedule: "No schedule yet",
      fallbackUpdating: "Updating",
      fallbackAccountNotFound: "No account found with this email.",
      paymentSuccess: "Payment successful!",
      paymentError: "An error occurred during payment.",
      voucherUnavailable: "Code {{code}} is no longer available, automatically removed from the order",

      // ClassInfoSection
      classInfo: "Class information",
      slotsAvailable: "{{available}}/{{max}} slots available",
      sessions: "sessions",
      instructor: "Instructor:",

      // LearnerSection
      addLearner: "Add learner",
      emailPlaceholder: "Enter learner email",
      adding: "Adding",
      add: "Add",
      payer: "(Payer)",
      totalLearners: "Total learners:",
      addLearnerError: "An error occurred while adding learner",

      // OrderSummary
      orderSummary: "Order summary",
      unitPrice: "Unit price",
      perPerson: "/ person",
      learnerCount: "Number of learners",
      subtotal: "Subtotal",
      discount: "Discount",
      maxDiscount: "Max:",
      tuition: "Tuition",
      totalPayment: "Total payment",
      youSaved: "You saved {{amount}}!",
      processing: "Processing...",
      confirmPayment: "Confirm payment",
      free: "Free",
      scheduleConflictTitle: "Schedule Conflict",
      scheduleConflictDesc: "The schedule of this class conflicts with a class you are currently enrolled in:",
      confirmEnroll: "Enroll Anyway",
      cancel: "Cancel",
      removeVoucherTitle: "Remove discount code?",
      removeVoucherDesc: "Are you sure you want to remove code {{code}}? Total payment will return to {{totalAmount}}. You will lose the discount of {{discountAmount}}.",
      removeVoucherConfirm: "Remove code",

      // VoucherSection
      searchVoucher: "Search code...",
      expiry: "Exp:",
      neverExpires: "Never expires",
      viewAllOffers: "View all offers →",
      voucherCode: "Voucher code",
      appliedCount: "{{count}} code(s) applied",
      change: "Change",
      sponsorInstructor: "Instructor",
      selectFromMyVouchers: "Select from my vouchers",
      noVouchersForClass: "No vouchers available for this class",

      // VoucherCard
      sponsorInstructorBadge: "INSTRUCTOR",
      maxDiscountLabel: "Max discount:",
      ineligible: "Ineligible",
      applied: "Applied",
      use: "Use",

      // Ineligible reason patterns
      reasonMinLearners: "Requires at least {{count}} learners in the order",
      reasonMinOrder: "Minimum order of {{minAmount}} (Subtotal: {{currentAmount}})",

      // VoucherModal
      myOffers: "My offers",
      searchOffers: "Search offers...",
      noOffersTitle: "No offers available",
      noOffersDesc: "You don't have any voucher codes yet. Check back later or contact your instructor for promotions.",

      // VoucherCategoryList
      categoryValid: "Available",
      categoryInvalidClass: "Not applicable for this class",
      categoryIneligible: "Ineligible",
      categoryExpired: "Expired",
      categoryExhausted: "Out of uses",
      voucherCountSuffix: "code(s)",
    },
    errorCodes: {
      // Generic fallback
      COMMON_INTERNAL_SERVER_ERROR: "An internal server error occurred. Please try again.",
      COMMON_EXTERNAL_SERVICE_ERROR: "An external service error occurred. Please try again later.",
      COMMON_BAD_REQUEST: "Invalid request. Please check your input.",
      COMMON_CONFLICT: "A conflict occurred. Please try again.",

      // Payment errors
      PAYMENT_PLAN_NOT_FOUND: "The selected subscription plan is no longer available.",
      PAYMENT_CLASS_NOT_FOUND: "The class was not found or is no longer available.",
      PAYMENT_LEARNER_NOT_FOUND: "No CatSpeak account found with this email address.",
      PAYMENT_LEARNER_ALREADY_ENROLLED: "This learner has already enrolled in this class.",
      PAYMENT_LEARNER_ALREADY_IN_CHECKOUT: "This learner is already in your checkout list.",
      PAYMENT_CLASS_FULL: "Sorry, this class is now full.",
      PAYMENT_ENROLLMENT_PERIOD_INACTIVE: "The enrollment period for this class is not active.",
      PAYMENT_CLASS_ALREADY_STARTED: "This class has already started and is no longer accepting enrollments.",
      PAYMENT_VOUCHER_UNAVAILABLE: "Voucher code {{code}} is no longer available and has been removed from your order.",
      PAYMENT_VOUCHER_DISCOUNT_CHANGED: "The voucher discount amount has changed. Please review your order.",
      PAYMENT_LINK_FAILED: "Could not create the payment link. Please try again.",
      PAYMENT_ALREADY_PAID: "This transaction has already been paid.",
      PAYMENT_ALREADY_CANCELLED: "This transaction has been paid and cannot be cancelled.",
      PAYMENT_NOT_FOUND: "Payment transaction not found.",
      PAYMENT_SERVICE_NOT_CONFIGURED: "Payment service is temporarily unavailable.",
      PAYMENT_INVALID_TYPE: "Invalid payment type.",
      PAYMENT_TRANSACTION_FAILED: "Transaction failed. Please try again.",

      // Class enrollment errors
      CLASS_ENROLLMENT_SCHEDULE_CONFLICT: "Schedule conflict detected.",
      CLASS_ENROLLMENT_CLASS_FULL: "This class is now full.",
      CLASS_ENROLLMENT_PERIOD_CLOSED: "The enrollment period for this class has closed.",
      CLASS_ENROLLMENT_CLASS_ALREADY_STARTED: "This class has already started.",

      // Learner validation errors (from gRPC)
      ACCOUNT_NOT_FOUND: "No CatSpeak account found with this email address.",
      ALREADY_ENROLLED: "This learner has already enrolled in this class.",
      CLASS_FULL: "Sorry, this class is now full.",
      VALIDATION_ERROR: "Invalid input. Please check your entry.",
    }
  }
}
