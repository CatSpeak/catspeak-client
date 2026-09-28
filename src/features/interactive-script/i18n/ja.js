export default {
  vocabularyNotebook: {
    title: "単語帳",
    subtitle: "会話やスクリプトから保存したすべての単語を保存・復習します。",
    reviewNow: "今すぐ復習",
    wordCount: "{{count}} 語",
    
    filters: {
      searchPlaceholder: "単語、意味を検索...",
      language: "言語",
      script: "スクリプト",
      sort: "並べ替え",
      all: "すべて",
      sortOptions: {
        newest: "新しい順",
        oldest: "古い順",
        az: "A → Z",
        za: "Z → A",
        length: "単語の長さ"
      }
    },
    
    card: {
      noun: "名詞",
      verb: "動詞",
      adj: "形容詞",
      adv: "副詞",
      teacherNote: "先生のメモ",
      relatedWords: "関連語:",
      scriptLabel: "スクリプト:",
      expand: "詳細",
      collapse: "閉じる"
    },
    
    emptyState: {
      titleEmpty: "単語帳は空です",
      descEmpty: "まだ単語を保存していません。スクリプトに戻って「保存」を選択し、単語帳に追加してください。",
      exploreBtn: "スクリプトを探索",
      
      titleSearch: "結果が見つかりません",
      descSearch: "検索条件とフィルターに一致する単語はありません。",
      clearBtn: "フィルターをクリア"
    },
    
    deleteModal: {
      title: "単語帳から削除",
      message: "単語「{{word}}」は学習リストと復習履歴から削除されます。",
      cancel: "キャンセル",
      confirm: "削除"
    }
  },
  widget: {
    shuffleTopic: "トピックをランダムに変更",
    translateFull: "段落全体を翻訳",
    hint: "任意の単語をクリックして意味を表示し、個人の学習リストに保存します",
    translationPanel: {
      title: "参考翻訳",
      featuredQuote: "注目の名言",
      hideBtn: "翻訳を隠す",
      reportInaccurate: "不正確な翻訳を報告",
      reportTitle: "より良い翻訳を提案:",
      reportSuccess: "ご意見ありがとうございます！",
      reportPlaceholder: "より正確な翻訳を入力してください...",
      cancel: "キャンセル",
      submitReport: "フィードバックを送信",
      aiDisclaimer: "AI翻訳は参考用です",
      reasons: {
        wrongMeaning: "意味が間違っている",
        unnatural: "不自然な翻訳",
        missingWords: "単語の過不足",
        other: "その他の理由"
      }
    },
    langPairs: {
      "en-vi": "英語 → ベトナム語",
      "en-zh": "英語 → 中国語",
      "en-ja": "英語 → 日本語",
      "vi-en": "ベトナム語 → 英語"
    },
    lookup: {
      meaning: "意味",
      instructorNote: "詳細な説明 (CAT SPEAK 講師)",
      example: "例文",
      relatedWords: "関連語:",
      saved: "単語帳に保存済み",
      save: "単語帳に追加",
      collapseExamples: "例文を閉じる",
      moreExamples: "他の例文を見る",
      langPlaceholder: "英語 -> 日本語",
      listenBtn: "発音を聞く",
      closeBtn: "ポップアップを閉じる"
    },
    notFound: {
      title: "この単語の定義が見つかりませんでした。",
      desc: "現在の辞書には、この単語の意味データがありません。",
      tryOther: "他の言語を試す:",
      contribute: "意味を投稿する",
      openDict: "オープン辞書で調べる",
      contributeNew: "新しい意味を投稿する",
      type: "投稿タイプ:",
      defaultType: "標準的な定義",
      meaningYouKnow: "知っている意味:",
      meaningPlaceholder: "この単語の定義または説明を入力してください...",
      cancel: "キャンセル",
      submitting: "送信中...",
      submit: "投稿を送信",
      errorEmpty: "単語の定義を入力してください。",
      success: "ご投稿ありがとうございます！",
      types: {
        definition: "標準的な定義",
        context: "専門用語 / 文脈",
        example: "例文"
      }
    }
  }
};
