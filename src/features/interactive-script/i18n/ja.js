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
  }
};
