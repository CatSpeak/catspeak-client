export default {
  placementTest: {
    title: "水平评估",
    consent: {
      pill: "与 AI 实时对话",
      heading: "与 AI 进行自适应 HSK 口语测试",
      intro:
        "智能口语测评系统，真实模拟 HSK 3.0 考试。AI 导师实时互动，并根据你的反应自动调整难度。",
      features: [
        {
          title: "5 道灵活的自适应问题",
          desc: "仅需 5-7 分钟，精准测量 HSK 1-6 等级。",
        },
        {
          title: "与母语级 AI 实时对话",
          desc: "标准北京发音，自然语调，即时互动反馈。",
        },
        {
          title: "四维分析报告与学习路线",
          desc: "测评发音、词汇、语法与流利度，并附 5 天学习路线。",
        },
      ],
      agreementTitle: "音频数据协议",
      agreementBody:
        "为分析你的语音并颁发准确的 HSK 水平证书，CatSpeak 将按照严格的安全标准通过麦克风采集音频。",
      privacyTitle: "国际 PDPA 隐私承诺：",
      bulletAudioOnly: "音频仅用于评分与改进反应模型。",
      bulletNoShare: "不向第三方分享，加密保存最多 30 天。",
      checkbox:
        "我同意 CatSpeak 使用我的麦克风并处理音频，用于本次入门测试。",
      startCta: "开始麦克风检测",
      recommend:
        "建议：佩戴带麦克风的耳机，并在安静环境中进行，以获得最高的声学准确度。",
    },
    blocked: {
      title: "浏览器正在阻止麦克风权限",
      body: "CatSpeak 需要访问麦克风，才能连接口语考试房间并为你的 HSK 反应评分。",
      consequencesTitle: "未授予权限的后果：",
      consequences: [
        "无法完成口语反应测评。",
        "系统无法颁发有效的 HSK 水平证书。",
        "无法生成准确的个性化学习路线。",
      ],
      stepsTitle: "解锁麦克风的 3 个步骤",
      steps: [
        {
          title: "1. 点击锁形 / 权限图标",
          desc: "点击浏览器地址栏左侧的锁形图标。",
        },
        {
          title: "2. 允许麦克风（Allow）",
          desc: "将麦克风从“阻止”切换为“允许”。",
        },
        {
          title: "3. 点击重试以连接",
          desc: "点击下方按钮，让系统识别并重新连接麦克风。",
        },
      ],
      retryCta: "已解锁，重新检测",
      trust: "CatSpeak 承诺对音频数据进行 100% 加密和安全保护。",
    },
    device: {
      grantedTitle: "麦克风权限已授予",
      grantedBody: "麦克风已就绪。设备检测步骤将在下一阶段补充。",
    },
  },
}
