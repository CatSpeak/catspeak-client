export const zh = {
  pointsAndOffers: {
    pageTitle: "积分与优惠管理",
    pageSubtitle:
      "追踪您的奖励积分余额，积累积分并兑换有价值的学习优惠券。",

    // Main Tabs
    tabs: {
      overview: "概览",
      exchange: "兑换优惠券",
      vault: "我的优惠券",
      history: "积分明细",
    },

    // Banner
    banner: {
      currentPoints: "当前可用积分",
      expiringNotice: "{{points}} 积分将于 {{date}} 到期",
      redeemNow: "立即兑换优惠券",
    },

    // Overview Tab
    overview: {
      stats: {
        totalAccumulated: "累计获得积分",
        redeemed: "已兑换",
        expiringSoon: "即将到期",
        expiringBefore: "{{date}} 之前",
        pointsUnit: "积分",
        pts: "积分",
      },
      earningMethods: {
        title: "如何获取积分",
        review: {
          title: "评价课程",
          subtitle: "每节课结束后",
        },
        referral: {
          title: "推荐好友",
          subtitle: "好友成功注册",
        },
        milestone: {
          title: "完成学习路径",
          subtitle: "完成全部课程",
        },
      },
      recentActivities: {
        title: "近期动态",
        viewAll: "查看全部",
        empty: "暂无近期积分记录。",
        earnedPoints: "获得积分",
        spentPoints: "使用积分",
        earnCompleted: "积分已入账",
        redeemVoucher: "兑换优惠券",
        expiredPoints: "积分已过期",
        pointsExpired: "积分已过期",
      },
      readyToRedeem: {
        title: "可立即兑换",
        viewAll: "查看全部",
        empty:
          "当前积分暂无可兑换的优惠券，快去赚取更多积分吧！",
      },
    },

    // Exchange Tab
    exchange: {
      searchPlaceholder: "搜索优惠券与特惠...",
      filterLabel: "筛选:",
      categories: {
        all: "全部",
        redeemable: "可立即兑换",
      },
      types: {
        all: "全部类型",
        percentage: "按百分比折扣 (%)",
        fixed: "固定金额折扣",
      },
      empty: {
        title: "未找到符合条件的优惠券",
        subtitle:
          "尝试使用其他关键词搜索或切换筛选类别。",
      },
    },

    // Vault Tab
    vault: {
      subTabs: {
        unused: "未使用",
        used: "已使用",
        expired: "已过期",
      },
      empty: {
        title: "此分类下暂无优惠券",
        subtitle:
          "您可以通过学习活动积累奖励积分，并立即兑换超值优惠。",
        exploreAction: "探索优惠中心",
      },
      item: {
        copyCode: "复制券码",
        useNow: "立即使用",
        copyTooltip: "复制优惠码",
        usedDate: "使用时间: {{date}}",
        expiryDate: "有效期至: {{date}}",
        voucherLabel: "优惠券",
        percentDiscountDesc: "结算时立享学费 {{percent}}% 折扣",
        fixedDiscountDesc: "账单直接立减 {{amount}}",
      },
    },

    // History Tab
    history: {
      filters: {
        all: "全部",
        earn: "获得积分 (+)",
        spend: "使用积分 (-)",
      },
      table: {
        activity: "活动项目",
        time: "时间",
        points: "积分",
      },
      pagination: {
        pageInfo: "第 {{page}} 页 (每页最多显示 {{pageSize}} 条)",
        prev: "上一页",
        next: "下一页",
      },
      empty: {
        title: "暂无积分变动记录",
        subtitle:
          "完成课程或参与平台活动即可赚取奖励积分！",
      },
    },

    // Voucher Card
    cards: {
      redeemNow: "立即兑换",
      redeemNowArrow: "立即兑换 →",
      outOfStock: "已兑完",
      unavailable: "不可用",
      notEligible: "未达条件",
      needMorePoints: "还需 {{points}} 积分",
      validDays: "有效期 {{days}} 天",
      validDaysFull: "有效期限 {{days}} 天",
      valid30Days: "有效期 30 天",
      valid30DaysShort: "有效期 30 天",
      stockRemaining: "库存: {{stock}} 份",
      percentDiscountBadge: "立减 {{percent}}%",
      fixedDiscountBadge: "立减 {{amount}}",
      defaultCondition: "适用于课程/班级结算",
    },

    // Modals
    modals: {
      confirm: {
        title: "确认兑换优惠券",
        prompt:
          "您确定要使用 {{points}} 积分兑换此优惠吗？",
        voucherLabel: "优惠券",
        availablePoints: "当前可用积分",
        deductPoints: "扣除积分",
        remainingPoints: "剩余积分",
        cancel: "取消",
        confirmBtn: "确认兑换",
      },
      processing: {
        title: "正在处理优惠券兑换...",
        subtitle: "请稍候，请勿关闭此窗口",
      },
      success: {
        title: "优惠券兑换成功！",
        message: "优惠券 {{title}} 已存入您的券包。",
        codeLabel: "优惠券代码",
        copyTooltip: "复制优惠码",
        validUntil: "有效期至: {{date}}",
        defaultExpiry: "30天后",
        viewVaultBtn: "查看我的优惠券",
        closeBtn: "关闭",
      },
      error: {
        networkTitle: "无法连接",
        networkDesc:
          "发生技术错误或网络连接断开。您的积分未被扣除，请稍后重试。",
        errorCode: "错误代码: {{code}}",
        retryBtn: "重试",
        closeBtn: "关闭",
        outOfStockTitle: "优惠券已兑完",
        outOfStockDesc:
          "很遗憾，该优惠券在确认过程中已兑完！您的积分未被扣除。",
        chooseAnotherBtn: "选择其他优惠",
      },
    },

    // Toasts & Notifications
    toasts: {
      copySuccess: "优惠码 {{code}} 已复制到剪贴板！",
      copySuccessSimple: "已复制优惠码 {{code}}！",
      redeemSuccess: "优惠券兑换成功！",
      outOfStockError: "该优惠券已兑换完！",
      needMorePointsError: "您还需要 {{points}} 积分才能兑换此优惠券！",
      cannotRedeemNow: "当前无法兑换优惠券。",
      appliedVoucherInfo:
        "已选择优惠码 {{code}}。您可以在结算课程时使用此代码！",
    },
  },
}

export default zh
