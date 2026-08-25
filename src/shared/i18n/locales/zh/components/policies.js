import intellectualPropertyPolicy from "./intellectualProperty"
import termsOfService from "./termsOfService"

export default {
  paymentPolicy: {
    intro:
      "Cat Speak - 连接语言和文化的全球社区平台 - 本支付政策规定了在Cat Speak平台上使用付费服务时适用支付的条件。进行支付即表示用户同意本政策和Cat Speak的服务条款。最后更新：2026年02月23日",
    section1: {
      title: "1. 运营模式",
      intro: "Cat Speak采用混合模式运营：",
      items: [
        "订阅服务 - 提供高级功能、AI、支持工具的访问权限。",
        "中介平台 (Marketplace) - 连接用户，根据CAT SPEAK的规定进行沟通和执行付费交易。",
        "企业解决方案 (B2B) - 根据单独的合同提供服务、账户或使用许可。",
      ],
    },
    section2: {
      title: "2. 服务包支付 (订阅 - B2C)",
      items: [
        "服务包采用预付模式提供。",
        "访问权限仅在付款成功后激活。",
        "如果用户在续订日期前未取消，服务包可能会自动续订。",
        "已支付费用不可退还，第V节所述情况除外。",
      ],
    },
    section3: {
      title: "3. 平台支付 (P2P)",
      items: [
        "用户可以通过Cat Speak的系统向其他用户进行支付。",
        "Cat Speak作为处理交易的中介，可以在将剩余款项转给服务提供商之前扣除平台费用。",
        "Cat Speak不是用户之间的直接服务提供商。",
      ],
      rightsTitle: "Cat Speak有权：",
      rights: [
        "在验证期间扣留付款；",
        "发生纠纷时冻结交易；",
        "要求提供证据；",
        "若发现任何违反越南法律的迹象，通知并提交给国家有关主管机关。",
      ],
    },
    section4: {
      title: "4. 企业支付 (B2B)",
      items: [
        "企业的支付条款、期限和退款受单独合同的约束。",
        "如果B2B合同与本政策存在差异，将以B2B合同为准。",
      ],
    },
    section5: {
      title: "5. 退款政策 - 订阅 (B2C)",
      generalRuleBold: "一般原则：",
      generalRuleText: "已支付的费用不可退还，除非法律要求或以下特殊情况。",
      subjectiveRuleBold: "因主观原因不予退款：",
      subjectiveRuleText: "如果用户出现以下情况，Cat Speak将不予退款：",
      reasons: [
        "不喜欢该体验；",
        "不符合个人期望；",
        "未使用服务；",
        "个人需求改变。",
      ],
      windowTitle: "3. 新用户退款窗口",
      windowIntro:
        "如果用户要求并符合以下所有要求，新用户可以在首次付款后的 07（七）天内请求退款：",
      windowItems: [
        "未享受超过30%的福利；",
        "未违反任何条款和/或规定；",
        "有严重技术错误的证据。",
      ],
      windowNote:
        "CAT SPEAK完全有权进行考虑，CAT SPEAK在这种情况下的决定为最终决定，用户无权投诉。",
    },
    section6: {
      title: "6. 平台内退款",
      paragraph1: "只有在以下情况才会考虑为用户退款：",
      items1: [
        "服务提供方用户未执行服务；",
        "用户向 CAT SPEAK 提交了请求；",
        "有支付的确凿证据，以及违反CAT SPEAK规定和/或相关法律规定的证据。所有证据必须在用户请求退款前按照规定发送给CAT SPEAK。",
      ],
      paragraph2: "如果出现以下情况，CAT SPEAK不承担退款责任：",
      items2: [
        "该纠纷对用户来说具有主观性质；",
        "交易和/或服务已在用户之间完成；",
        "缺乏合理、真实的违规证据。",
      ],
      note: "Cat Speak可以支持调解，但没有代替各方进行赔偿的义务。",
    },
    section7: {
      title: "7. 证据要求",
      intro: "用户可以要求提供相关信息：",
      items: [
        "交易代码；",
        "发票；",
        "截图；",
        "交流历史记录；",
        "事件的详细描述。",
      ],
      note: "如果证据不足或有欺诈、不诚实迹象，CAT SPEAK有全权审查并拒绝处理。",
    },
    section8: {
      title: "8. 退款和欺诈",
      items: [
        "如果发现任何滥用退款或有效退款请求的行为，CAT SPEAK保留暂停账户的权利。",
        "CAT SPEAK只向之前将资金转账给CAT SPEAK并在数据库系统上记录成功交易的账户进行退款。",
        "用户可能须要承担与解决支付纠纷相关的费用。",
      ],
    },
    section9: {
      title: "9. 关于AI (人工智能) 的责任限制",
      items: [
        "AI的内容和回复仅供学习支持和参考；",
        "无法绝对保证内容或形式的准确性；",
        "用户因使用AI生成或提供给用户的内容而做出的任何决定，CAT SPEAK不承担任何责任。",
      ],
    },
    section10: {
      title: "10. 联系方式",
      intro: "如果您有任何与支付政策相关的问题或请求，请联系：",
      contact: {
        email: "电子邮件：",
        website: "网站：",
        fanpage: "粉丝页：",
        hotline: "热线：",
      },
      copyright: "@Copyright 2026 | Cat Speak - I speak you speak we peak",
    },
  },
  privacyPolicy: {
    title: "隐私政策",
    intro:
      "Cat Speak - 连接语言学习者的社区平台 - 致力于保护用户的隐私和个人数据。本隐私政策说明了我们在您使用服务时如何收集、使用、存储和保护您的信息。",

    section1: {
      title: "1. 我们收集的信息",
      intro: "当您使用 Cat Speak 时，我们可能会收集：",
      items: [
        { label: "基本个人信息：", text: "姓名、电子邮件、电话号码。" },
        { label: "账户信息：", text: "用户名、密码、头像。" },
        { label: "学习信息：", text: "课程内容、聊天记录、学习进度。" },
        {
          label: "设备和使用信息：",
          text: "设备类型、浏览器、IP地址、cookies、访问日志。",
        },
        {
          label: "用户生成的内容：",
          text: "消息、帖子、音频文件/语音录音和视频聊天。",
        },
      ],
    },

    section2: {
      title: "2. 信息使用目的",
      intro: "Cat Speak 使用您的数据来：",
      items: [
        "提供和改进语言学习服务。",
        "个性化学习体验（推荐合适的内容、课程和课程）。",
        "确保安全并防止欺诈行为。",
        "支持客户并响应请求。",
        "研究、开发产品和分析数据。",
        "发送通知、更新和促销信息（如果您同意）。",
      ],
    },

    section3: {
      title: "3. 信息共享和披露",
      intro:
        "我们不会将您的个人信息出售给第三方。但是，在某些情况下，Cat Speak 可能会与以下方共享信息：",
      items: [
        "技术合作伙伴（AI、服务器基础设施、支付）。",
        "法律要求时的执法机构。",
        "数据分析服务（如 Google Analytics）以改善体验。",
      ],
    },

    section4: {
      title: "4. 数据安全",
      intro: "我们采用技术和组织措施来保护用户数据，包括：",
      items: [
        "加密密码和敏感数据。",
        "严格的内部访问控制。",
        "防火墙系统和安全监控。",
        "定期数据备份和恢复。",
      ],
    },

    section5: {
      title: "5. 用户权利",
      intro: "您有权：",
      items: [
        "访问、编辑或删除个人信息。",
        "请求导出您的学习数据。",
        "通过 Cat Speak 支持电子邮件发送有关隐私和安全的请求。",
      ],
    },

    section6: {
      title: "6. 数据保留期限",
      items: [
        "个人信息将保留至您请求删除账户，除非法律要求更长的保留期限。",
        "学习数据可能会被匿名化用于研究和产品开发目的。",
      ],
    },

    section7: {
      title: "7. Cookies 和类似技术",
      intro:
        "Cookies 是由网站服务器放置在用户硬盘上的文本文件。Cookies 不用于运行程序或向用户计算机引入病毒。Cat Speak 使用 cookies 来：",
      items: [
        "记住登录会话。",
        "分析使用行为以改善体验。",
        "个性化内容和广告（如果有）。",
      ],
      note: "您可以在浏览器中自定义 cookie 设置。但是，如果用户选择拒绝 cookies，这可能会妨碍并对 Cat Speak 上依赖 cookies 的某些服务和功能产生负面影响。",
    },

    section8: {
      title: "8. 隐私政策变更",
      paragraphs: [
        'Cat Speak 可能会在不事先通知的情况下更改"隐私政策"的内容，以适应 Cat Speak 的需求以及客户反馈。更新此政策内容时，我们将修改下面的"最后更新"时间。',
        '此"隐私政策"内容仅适用于 Cat Speak，不包括或涉及在 Cat Speak 上做广告或有链接的第三方。我们鼓励用户在向这些网站提供个人信息之前仔细阅读第三方网站的"安全和隐私政策"。',
      ],
    },

    section9: {
      title: "9. 联系方式",
      intro: "如果您有任何与隐私政策相关的问题或请求，请联系：",
      contact: {
        email: "电子邮件：",
        website: "网站：",
        fanpage: "粉丝页：",
        hotline: "热线：",
      },
      copyright: "© 2026 | Cat Speak - I speak you speak we peak",
    },
  },
  intellectualPropertyPolicy,
  termsOfService,
}
