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
    },
    history: {
      title: "付款记录",
      subtitle: "查看您过去的账单和付款记录。",
      noHistoryTitle: "没有付款记录",
      noHistorySubtitle: "您还没有任何过去的账单。一旦您升级或付款，它将显示在这里。",
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
      },
      statuses: {
        success: "成功",
        pending: "待处理",
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
    }
  }
}
