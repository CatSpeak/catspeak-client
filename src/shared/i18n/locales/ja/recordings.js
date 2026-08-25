export default {
  title: "録画",
  refresh: "更新",
  storage: {
    title: "ストレージ",
    used: "{{used}} / {{limit}} MB",
    percentUsed: "{{percent}}%使用中",
    limit_used: "/ {{limit}}使用中",
    quotaExceeded: "ストレージが満杯です — 録画を削除して容量を空けてください",
    warningAlmostFull:
      "ストレージ容量がほぼ満杯です。上限を超えると録画が自動停止することがあります。",
    warningLimitReached:
      "ストレージ容量超過のため録画は自動停止しました。途中までの録画は保存されています。",
  },
  errors: {
    noRoom: "アクティブなルームがありません — 録画できません。",
    noEgress:
      "録画は開始しましたが、egress IDを受け取れませんでした。停止が機能しない可能性があります。",
    noMedia:
      "録画前にカメラ、マイクをオンにするか、画面を共有してください。",
    interrupted:
      "前回の録画が中断されました。途中までの録画ファイルが保存されています。",
    disconnected: "接続が中断されました。録画を一時停止しています...",
  },
  list: {
    emptyTitle: "録画はまだありません",
    emptyDescription: "通話を録画すると、ここに表示されます。",
    count_one: "1件の録画",
    count_other: "{{count}}件の録画",
    fileUnavailable: "ファイルを利用できません — 録画がまだ処理中の可能性があります",
    error: "録画の読み込みに失敗しました。",
    retry: "再試行",
    noResults: "選択したフィルターに一致する録画がありません。",
  },
  filters: {
    all: "すべて",
    local: "ローカル",
    drive: "Google Drive",
  },
  status: {
    completed: "完了",
    failed: "失敗",
    partialCompleted: "一部完了",
  },
  player: {
    title: "録画",
    videoNotAvailable: "動画ファイルを利用できません。",
    browserNotSupported: "お使いのブラウザは動画タグに対応していません。",
    urlExpiry: "URLは60分で有効期限切れになります",
    meetingIdFallback: "録画 #{{id}}",
  },
  deleteModal: {
    title: "録画を削除しますか？",
    description: "この録画は完全に削除されます",
    cannotUndo: "この操作は元に戻せません。",
    cancel: "キャンセル",
    confirm: "削除",
    deleting: "削除中…",
  },
  actions: {
    play: "録画を再生",
    playUnavailable: "ファイルを利用できません",
    download: "録画をダウンロード",
    downloadUnavailable: "ファイルを利用できません",
    delete: "録画を削除",
    savedToDrive: "Driveに保存",
    startSuccess: "録画を開始しました",
    stopSuccess: "録画を停止しました — アップロードを処理中…",
    deleteSuccess: "録画を削除しました",
    deleteFailed: "録画の削除に失敗しました。",
    viewRecordings: "録画を見る",
    uploadingToDrive: "Google Driveにアップロード中...",
    uploadToDrive: "Driveにアップロード",
  },
}