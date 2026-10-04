export const en = {
  pointsAndOffers: {
    pageTitle: "Points & Offers Management",
    pageSubtitle:
      "Track your reward points balance, earn points, and redeem valuable learning vouchers.",

    // Main Tabs
    tabs: {
      overview: "Overview",
      exchange: "Redeem Vouchers",
      vault: "My Vouchers",
      history: "Points History",
    },

    // Banner
    banner: {
      currentPoints: "Available Points",
      expiringNotice: "{{points}} points will expire on {{date}}",
      redeemNow: "Redeem Vouchers Now",
    },

    // Overview Tab
    overview: {
      stats: {
        totalAccumulated: "Total points earned",
        redeemed: "Redeemed",
        expiringSoon: "Expiring soon",
        expiringBefore: "before {{date}}",
        pointsUnit: "points",
        pts: "pts",
      },
      earningMethods: {
        title: "How to earn points",
        review: {
          title: "Course Review",
          subtitle: "After completing each class",
        },
        referral: {
          title: "Refer Friends",
          subtitle: "When friends register successfully",
        },
        milestone: {
          title: "Complete Learning Path",
          subtitle: "Complete the entire course",
        },
      },
      recentActivities: {
        title: "Recent Activities",
        viewAll: "View all",
        empty: "No recent point activity.",
        earnedPoints: "Points Earned",
        spentPoints: "Points Used",
        earnCompleted: "Accumulation completed",
        redeemVoucher: "Redeem voucher",
        expiredPoints: "Points expired",
        pointsExpired: "Points expired",
      },
      readyToRedeem: {
        title: "Ready to Redeem",
        viewAll: "View all",
        empty:
          "No vouchers match your current points balance. Keep earning points!",
      },
    },

    // Exchange Tab
    exchange: {
      searchPlaceholder: "Search vouchers & offers...",
      filterLabel: "Filter:",
      categories: {
        all: "All",
        redeemable: "Ready to redeem",
      },
      types: {
        all: "All types",
        percentage: "Percentage (%)",
        fixed: "Fixed amount",
      },
      empty: {
        title: "No matching vouchers found",
        subtitle:
          "Try searching with different keywords or changing the filter.",
      },
    },

    // Vault Tab
    vault: {
      subTabs: {
        unused: "Unused",
        used: "Used",
        expired: "Expired",
      },
      empty: {
        title: "No vouchers in this section",
        subtitle:
          "You can earn reward points through learning activities and redeem exciting offers.",
        exploreAction: "Explore offers",
      },
      item: {
        copyCode: "Copy code",
        useNow: "Use now",
        copyTooltip: "Copy code",
        usedDate: "Used at: {{date}}",
        expiryDate: "Exp: {{date}}",
        voucherLabel: "Voucher",
        percentDiscountDesc: "Get {{percent}}% off tuition fee at checkout",
        fixedDiscountDesc: "Get {{amount}} direct discount on your bill",
      },
    },

    // History Tab
    history: {
      filters: {
        all: "All",
        earn: "Earned (+)",
        spend: "Used (-)",
      },
      table: {
        activity: "ACTIVITY",
        time: "TIME",
        points: "POINTS",
      },
      pagination: {
        pageInfo: "Page {{page}} (Showing max {{pageSize}} items/page)",
        prev: "Previous",
        next: "Next",
      },
      empty: {
        title: "No points history found",
        subtitle:
          "Complete courses or participate in activities to earn reward points!",
      },
    },

    // Voucher Card
    cards: {
      redeemNow: "Redeem",
      redeemNowArrow: "Redeem now →",
      outOfStock: "Out of stock",
      unavailable: "Unavailable",
      notEligible: "Not eligible",
      needMorePoints: "Need {{points}} more points",
      validDays: "Valid {{days}} days",
      validDaysFull: "Valid for {{days}} days",
      valid30Days: "Valid for 30 days",
      valid30DaysShort: "Exp: 30 days",
      stockRemaining: "Stock: {{stock}} left",
      percentDiscountBadge: "Get {{percent}}% off",
      fixedDiscountBadge: "Get {{amount}} off",
      defaultCondition: "Applicable when paying for courses/classes",
    },

    // Modals
    modals: {
      confirm: {
        title: "Confirm Voucher Redemption",
        prompt:
          "Are you sure you want to spend {{points}} points to redeem this offer?",
        voucherLabel: "Voucher",
        availablePoints: "Available points",
        deductPoints: "Points deducted",
        remainingPoints: "Remaining points",
        cancel: "Cancel",
        confirmBtn: "Confirm redemption",
      },
      processing: {
        title: "Processing voucher redemption...",
        subtitle: "Please wait a moment and do not close this window",
      },
      success: {
        title: "Voucher Redeemed Successfully!",
        message: "Voucher {{title}} has been added to your vault.",
        codeLabel: "VOUCHER CODE",
        copyTooltip: "Copy code",
        validUntil: "Valid until: {{date}}",
        defaultExpiry: "30 days later",
        viewVaultBtn: "View my vouchers",
        closeBtn: "Close",
      },
      error: {
        networkTitle: "Unable to connect",
        networkDesc:
          "A technical error or network disconnection occurred. No points were deducted. Please try again.",
        errorCode: "Error code: {{code}}",
        retryBtn: "Retry",
        closeBtn: "Close",
        outOfStockTitle: "Offer Out of Stock",
        outOfStockDesc:
          "Sorry, this voucher ran out of stock while you were confirming! No points were deducted.",
        chooseAnotherBtn: "Choose another offer",
      },
    },

    // Toasts & Notifications
    toasts: {
      copySuccess: "Copied code {{code}} to clipboard!",
      copySuccessSimple: "Copied code {{code}}!",
      redeemSuccess: "Voucher redeemed successfully!",
      outOfStockError: "This voucher is out of stock!",
      needMorePointsError:
        "You need {{points}} more points to redeem this voucher!",
      cannotRedeemNow: "Cannot redeem voucher at this time.",
      appliedVoucherInfo:
        "Selected code {{code}}. You can apply this code during course checkout!",
    },
  },
}

export default en
