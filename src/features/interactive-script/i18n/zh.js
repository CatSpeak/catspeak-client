export default {
  vocabularyNotebook: {
    title: "词汇本",
    subtitle: "存储和复习你在对话和剧本中保存的所有词汇。",
    reviewNow: "立即复习",
    wordCount: "{{count}} 个词",
    
    filters: {
      searchPlaceholder: "搜索词汇，含义...",
      language: "语言",
      script: "剧本",
      sort: "排序方式",
      all: "全部",
      sortOptions: {
        newest: "最新",
        oldest: "最旧",
        az: "A → Z",
        za: "Z → A",
        length: "词长"
      }
    },
    
    card: {
      noun: "名词",
      verb: "动词",
      adj: "形容词",
      adv: "副词",
      teacherNote: "老师备注",
      relatedWords: "相关词:",
      scriptLabel: "剧本:",
      expand: "详情",
      collapse: "收起"
    },
    
    emptyState: {
      titleEmpty: "你的词汇本是空的",
      descEmpty: "你还没有保存任何单词。返回互动剧本并选择\"保存\"以将单词添加到词汇本。",
      exploreBtn: "探索剧本",
      
      titleSearch: "未找到结果",
      descSearch: "没有符合您搜索条件和过滤器的单词。",
      clearBtn: "清除过滤器"
    },
    
    deleteModal: {
      title: "从词汇本中删除",
      message: "单词 \"{{word}}\" 将从您的学习列表和复习历史中删除。",
      cancel: "取消",
      confirm: "删除"
    }
  },
  widget: {
    shuffleTopic: "随机切换主题",
    translateFull: "翻译全文",
    hint: "点击任意单词以查看含义并将其保存到您的个人学习列表中",
    translationPanel: {
      title: "参考翻译",
      featuredQuote: "精选名言",
      hideBtn: "隐藏翻译",
      reportInaccurate: "报告翻译不准",
      reportTitle: "提供更好的翻译建议:",
      reportSuccess: "感谢您的反馈意见！",
      reportPlaceholder: "输入更准确的翻译...",
      cancel: "取消",
      submitReport: "发送反馈",
      aiDisclaimer: "AI 翻译仅供参考",
      reasons: {
        wrongMeaning: "含义错误",
        unnatural: "翻译不自然",
        missingWords: "遗漏或多余词汇",
        other: "其他原因"
      }
    },
    langPairs: {
      "en-vi": "英语 → 越南语",
      "en-zh": "英语 → 中文",
      "en-ja": "英语 → 日语",
      "vi-en": "越南语 → 英语"
    },
    lookup: {
      meaning: "含义",
      instructorNote: "详细说明 (CAT SPEAK 讲师)",
      example: "例句",
      relatedWords: "相关词汇:",
      saved: "已保存到词汇本",
      save: "添加到词汇本",
      collapseExamples: "收起例句",
      moreExamples: "查看更多例句",
      langPlaceholder: "英语 -> 中文",
      listenBtn: "听发音",
      closeBtn: "关闭弹出窗口"
    },
    notFound: {
      title: "未找到此词的定义。",
      desc: "系统当前的字典中没有此词的含义数据。",
      tryOther: "尝试其他语言:",
      contribute: "贡献含义",
      openDict: "在开放词典中查找",
      contributeNew: "贡献新含义",
      type: "贡献类型:",
      defaultType: "标准定义",
      meaningYouKnow: "您知道的含义:",
      meaningPlaceholder: "输入此单词的定义或解释...",
      cancel: "取消",
      submitting: "提交中...",
      submit: "提交贡献",
      errorEmpty: "请输入单词的定义。",
      success: "感谢您的贡献！",
      types: {
        definition: "标准定义",
        context: "特定术语 / 语境",
        example: "例句"
      }
    }
  }
};
