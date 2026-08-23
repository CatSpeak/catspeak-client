export default {
  billing: {
    billingHistory: "账单历史",
    planCard: {
      suffixes: {
        MAX_ACTIVE_ROOMS: " 个房间",
        MAX_PARTICIPANTS: " 人",
        MAX_STORAGE_MB: " MB",
        MAX_AI_MESSAGES: " 条消息",
        MAX_REELS_UPLOAD: " 个视频"
      }
    },
    pricing: {
      title: "订阅计划",
      subtitle: "选择适合您需求的计划。",
      customPaymentTitle: "自定义付款金额",
      customPaymentSubtitle: "请输入您想为Pro计划支付的金额（VND）。",
      amountLabel: "金额 (VND)",
      cancel: "取消",
      proceedToPay: "继续付款",
      processing: "处理中...",
      currentPlan: "当前计划",
      included: "包含在您的计划中",
      upgradeTo: "升级到 {{planName}}",
      planFree: "免费版",
      planPro: "Room Pro版",
      activated: "已激活",
      popular: "热门",
      featuresFree: [
        "加入会议室（同时最多1个会议室）",
        "会议室最多50人",
        "会议时长最多60分钟",
        "基础隐私设置",
        "使用基础AI学习辅助工具",
        "免费参加社区和活动",
        "基础技术支持"
      ],
      featuresPro: [
        "同时最多创建3个会议室并担任房主",
        "会议时长无限制",
        "会议室最多100人",
        "高级隐私设置",
        "自定义会议室封面",
        "高级AI学习辅助工具",
        "参加工作坊、脱口秀和挑战赛",
        "优先支持"
      ],
      tabTitle: "价格",
    },
    checkout: {
      title: "服务支付",
      transferInfo: "转账信息",
      recipientInfo: "收款人信息",
      bank: "银行",
      accountNo: "账号",
      accountOwner: "账户持有人",
      memo: "转账附言（可选）",
      buyerInfo: "买家信息",
      fullName: "姓名",
      email: "电子邮箱",
      phone: "电话号码",
      paymentDetails: "付款详情",
      price: "价格",
      vat: "增值税 (0%)",
      total: "总付款金额",
      submit: "立即支付",
      secure: "您的个人信息已完全加密并受安全保护",
      agreeTerms: "我同意服务条款和隐私政策",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策"
    },
    history: {
      title: "付款记录",
      subtitle: "查看您过去的账单和付款记录。",
      noHistoryTitle: "没有付款记录",
      noHistorySubtitle: "您还没有任何过去的账单。一旦您升级或付款，它将显示在这里。",
      searchPlaceholder: "输入发票ID...",
      dateFilterAll: "所有时间",
      dateFilterWeek: "近 7 天",
      dateFilterMonth: "近 30 天",
      statusFilterAll: "所有状态",
      statusFilterSuccess: "成功",
      statusFilterFailed: "失败",
      statusFilterPending: "待处理",
      statusFilterRefunded: "已退款",
      statusFilterCancelled: "已取消",
      noResults: "未找到结果",
      noResultsHint: "请尝试更改筛选条件或搜索关键词。",
      showingResults: "显示 {{count}} 个结果",
      columns: {
        date: "日期",
        orderCode: "订单号",
        method: "付款方式",
        amount: "金额",
        status: "状态",
        actions: "操作",
      },
      actions: {
        report: "报告问题",
        repay: "重新付款",
        refund: "退款",
      },
      statuses: {
        success: "成功",
        failed: "失败",
        pending: "待处理",
        refunded: "已退款",
        cancelled: "已取消",
      }
    },
    result: {
      cancelling: "正在取消付款...",
      successTitle: "付款成功！",
      successSubtitle: "感谢您的购买。您的计划已成功升级。",
      redirecting: "正在重定向...",
      processing: "正在验证付款状态...",
      returnToBilling: "返回账单",
    },
    checkoutModal: {
      title: "订阅结账",
      subtitle: "您正在选择升级到 {{planName}}。",
      paymentMethod: "付款方式",
      payosSub: "银行转账 / QR 码",
      momoSub: "使用 MoMo 电子钱包支付",
      stripeSub: "信用卡 / 借记卡",
      comingSoon: "即将推出",
      cancel: "取消",
      confirm: "确认并付款"
    },
    reportIssueModal: {
      title: "报告付款问题",
      subtitle: "如果您在处理付款 #{{paymentId}} 时遇到问题，请在下面说明。您也可以上传交易截图。",
      explanationLabel: "说明",
      explanationPlaceholder: "请描述问题...",
      proofImageLabel: "证明图片（可选）",
      uploadFileText: "点击上传文件",
      errorNoExplanation: "请提供说明。",
      errorSubmitFailed: "提交报告失败。请重试。",
      cancel: "取消",
      submit: "提交报告",
      successTitle: "报告已提交",
      successSubtitle: "我们已收到您的报告，并将调查此问题。",
      done: "完成"
    },
    checkoutClass: {
      // Breadcrumb
      breadcrumbHome: "首页",
      breadcrumbExplore: "探索课程",
      breadcrumbCourseDetail: "课程详情",
      breadcrumbClassDetail: "班级详情",
      breadcrumbCheckout: "班级结算",

      // Page
      pageTitle: "班级结算",
      classNotFound: "未找到班级",
      classNotFoundDesc: "该班级可能不存在或已被删除。",
      backToHome: "返回首页",

      // Fallback texts
      fallbackName: "你",
      fallbackCourseName: "独立班级",
      fallbackNoSchedule: "暂无课表",
      fallbackUpdating: "更新中",
      fallbackAccountNotFound: "未找到使用此邮箱的账户。",
      paymentSuccess: "支付成功！",
      paymentError: "支付过程中发生错误。",
      voucherUnavailable: "优惠码 {{code}} 已不可用，已自动从订单中移除",

      // ClassInfoSection
      classInfo: "班级信息",
      slotsAvailable: "剩余 {{available}}/{{max}} 名额",
      sessions: "节课",
      instructor: "讲师：",

      // LearnerSection
      addLearner: "添加学员",
      emailPlaceholder: "输入学员邮箱",
      adding: "添加中",
      add: "添加",
      payer: "（付款人）",
      totalLearners: "学员总数：",
      addLearnerError: "添加学员时发生错误",

      // OrderSummary
      orderSummary: "订单摘要",
      unitPrice: "单价",
      perPerson: "/ 人",
      learnerCount: "学员人数",
      subtotal: "小计",
      discount: "折扣",
      maxDiscount: "最高：",
      tuition: "学费",
      totalPayment: "应付总额",
      youSaved: "您节省了 {{amount}}!",
      processing: "处理中...",
      confirmPayment: "确认支付",
      free: "免费",
      scheduleConflictTitle: "时间冲突",
      scheduleConflictDesc: "此课程的时间与您当前注册的课程冲突：",
      confirmEnroll: "继续注册",
      cancel: "取消",
      removeVoucherTitle: "删除优惠码？",
      removeVoucherDesc: "您确定要删除优惠码 {{code}} 吗？总付款金额将恢复为 {{totalAmount}}。您将失去 {{discountAmount}} 的折扣优惠。",
      removeVoucherConfirm: "删除优惠码",

      // VoucherSection
      searchVoucher: "搜索优惠码...",
      expiry: "有效期：",
      neverExpires: "永久有效",
      viewAllOffers: "查看所有优惠 →",
      voucherCode: "优惠码",
      appliedCount: "已使用 {{count}} 个优惠码",
      change: "更改",
      sponsorInstructor: "讲师",
      selectFromMyVouchers: "从我的优惠券中选择",
      noVouchersForClass: "该班级暂无可用优惠码",

      // VoucherCard
      sponsorInstructorBadge: "讲师",
      maxDiscountLabel: "最高优惠：",
      ineligible: "不符合条件",
      applied: "已使用",
      use: "使用",

      // Ineligible reason patterns
      reasonMinLearners: "订单中至少需要 {{count}} 名学员",
      reasonMinOrder: "最低订单金额 {{minAmount}}（小计：{{currentAmount}}）",

      // VoucherModal
      myOffers: "我的优惠",
      searchOffers: "搜索优惠...",
      noOffersTitle: "暂无可用优惠",
      noOffersDesc: "您还没有优惠码。请稍后再来或联系讲师了解优惠活动。",

      // VoucherCategoryList
      categoryValid: "可使用",
      categoryInvalidClass: "不适用于此班级",
      categoryIneligible: "不符合条件",
      categoryExpired: "已过期",
      categoryExhausted: "已用完",
      voucherCountSuffix: "个",
    },
    errorCodes: {
      // 通用错误
      COMMON_INTERNAL_SERVER_ERROR: "服务器内部错误，请重试。",
      COMMON_EXTERNAL_SERVICE_ERROR: "外部服务错误，请稍后重试。",
      COMMON_BAD_REQUEST: "请求无效，请检查您的输入。",
      COMMON_CONFLICT: "发生冲突，请重试。",

      // 支付错误
      PAYMENT_PLAN_NOT_FOUND: "所选订阅计划已不再可用。",
      PAYMENT_CLASS_NOT_FOUND: "未找到该班级或该班级已不再可用。",
      PAYMENT_LEARNER_NOT_FOUND: "未找到使用该邮笱的 CatSpeak 账户。",
      PAYMENT_LEARNER_ALREADY_ENROLLED: "该学员已经报名了该班级。",
      PAYMENT_LEARNER_ALREADY_IN_CHECKOUT: "该学员已在您的结账列表中。",
      PAYMENT_CLASS_FULL: "该班级已报满。",
      PAYMENT_ENROLLMENT_PERIOD_INACTIVE: "该班级的报名期尚未开始或已结束。",
      PAYMENT_CLASS_ALREADY_STARTED: "该班级已开课，不再接受报名。",
      PAYMENT_VOUCHER_UNAVAILABLE: "优惠码 {{code}} 已不可用，已自动从订单中移除。",
      PAYMENT_VOUCHER_DISCOUNT_CHANGED: "优惠码折扣金额已变更，请重新检查您的订单。",
      PAYMENT_LINK_FAILED: "无法创建支付链接，请重试。",
      PAYMENT_ALREADY_PAID: "该交易已成功支付。",
      PAYMENT_ALREADY_CANCELLED: "该交易已支付，无法取消。",
      PAYMENT_NOT_FOUND: "未找到支付交易。",
      PAYMENT_SERVICE_NOT_CONFIGURED: "支付服务暂时不可用。",
      PAYMENT_INVALID_TYPE: "支付类型无效。",
      PAYMENT_TRANSACTION_FAILED: "交易失败，请重试。",

      // 班级报名错误
      CLASS_ENROLLMENT_SCHEDULE_CONFLICT: "检测到日程冲突。",
      CLASS_ENROLLMENT_CLASS_FULL: "该班级已报满。",
      CLASS_ENROLLMENT_PERIOD_CLOSED: "该班级的报名期已结束。",
      CLASS_ENROLLMENT_CLASS_ALREADY_STARTED: "该班级已开课。",

      // 学员验证错误（来自 gRPC）
      ACCOUNT_NOT_FOUND: "未找到使用该邮笱的 CatSpeak 账户。",
      ALREADY_ENROLLED: "该学员已经报名了该班级。",
      CLASS_FULL: "该班级已报满。",
      VALIDATION_ERROR: "输入无效，请检查您的输入。",
    }
  }
}
