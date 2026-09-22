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
  }
};
