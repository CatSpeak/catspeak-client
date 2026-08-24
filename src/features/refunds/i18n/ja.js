export default {
  refunds: {
    title: "返金履歴",
    subtitle: "支払いの返金リクエストのステータスを追跡・管理します。",
    requestRefundTitle: "返金をリクエスト",
    requestRefundSubtitle: "注文 #{{orderCode}} の返金リクエストを送信",

    // Statuses
    statusPending: "審査中",
    statusApproved: "承認済み",
    statusRejected: "却下",
    statusFailed: "失敗",

    // Modal steps
    checkingEligibility: "返金資格を確認中...",
    ineligibleTitle: "返金資格がありません",
    eligibleTitle: "返金資格があります",
    maxRefundAmount: "最大返金額",
    paymentType: "支払いタイプ",

    // Form fields
    selectBank: "受取銀行を選択",
    searchBankPlaceholder: "銀行を検索...",
    accountNumber: "口座番号",
    accountNumberPlaceholder: "口座番号を入力...",
    accountHolderName: "口座名義人名",
    accountHolderPlaceholder: "口座名義人名を入力（大文字）...",
    reasonLabel: "返金の理由",
    reasonPlaceholder: "返金をリクエストする理由を説明してください...",

    // Actions & Buttons
    btnCheckEligibility: "資格を確認",
    btnSubmitRequest: "返金リクエストを送信",
    btnCancel: "キャンセル",
    btnBack: "戻る",
    btnDone: "完了",
    btnRequestRefund: "返金をリクエスト",
    btnRefresh: "更新",

    // Errors & Success
    checkEligibilityError: "返金資格を確認できません。後でもう一度お試しください。",
    defaultIneligibleReason: "取引は許可される返金期間を過ぎています。",
    btnRetry: "再試行",
    btnChangeBank: "変更",
    loadingBanks: "銀行を読み込み中...",
    noBanksFound: "銀行が見つかりません。",

    errorNoBank: "銀行を選択してください。",
    errorNoAccount: "口座番号を入力してください。",
    errorNoHolder: "口座名義人名を入力してください。",
    errorNoReason: "返金の理由を入力してください。",
    errorSubmitFailed: "返金リクエストの送信に失敗しました。もう一度お試しください。",

    successTitle: "返金リクエストを送信しました！",
    successSubtitle:
      "リクエストは管理者の承認を待っています。ステータスは返金履歴で確認できます。",

    // Table / History page
    noHistoryTitle: "返金リクエストが見つかりません",
    noHistorySubtitle: "支払いの返金をリクエストすると、そのステータスがここに表示されます。",
    searchPlaceholder: "注文コードまたはIDを入力...",
    filterStatusAll: "すべてのステータス",

    columns: {
      date: "日付",
      paymentId: "支払いID",
      amount: "返金額",
      status: "ステータス",
      reason: "理由",
      bankInfo: "受取銀行",
    },
  },
}