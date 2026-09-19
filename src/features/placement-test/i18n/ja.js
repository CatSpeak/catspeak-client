export default {
  placementTest: {
    title: "レベル診断",
    consent: {
      pill: "AI とライブ会話",
      heading: "AI と受ける適応型 HSK スピーキングテスト",
      intro:
        "実際の HSK 3.0 試験を再現したスマートなスピーキング評価。AI チューターがリアルタイムで対話し、あなたの反応に合わせて難易度を自動調整します。",
      features: [
        {
          title: "5 つの柔軟な適応型質問",
          desc: "5〜7 分に最適化し、HSK 1〜6 のバンドを正確に測定します。",
        },
        {
          title: "ネイティブ級 AI とのライブ会話",
          desc: "標準的な北京発音、自然なイントネーション、即時の対話フィードバック。",
        },
        {
          title: "4 軸分析レポートと学習ロードマップ",
          desc: "発音・語彙・文法・流暢さを測定し、5 日間のロードマップを提示します。",
        },
      ],
      agreementTitle: "音声データに関する同意",
      agreementBody:
        "音声を分析し、正確な HSK レベル証明を発行するため、CatSpeak は厳格なセキュリティ基準のもとマイクから音声を取得します。",
      privacyTitle: "国際 PDPA プライバシーへの取り組み：",
      bulletAudioOnly: "音声は採点と反応モデルの改善にのみ使用します。",
      bulletNoShare: "第三者と共有せず、暗号化して最大 30 日間保存します。",
      checkbox:
        "CatSpeak がマイクを使用し、入門テストのために音声を処理することに同意します。",
      startCta: "マイクの確認を開始",
      recommend:
        "推奨：マイク付きヘッドセットを着用し、静かな環境で行うと最も正確に測定できます。",
    },
    blocked: {
      title: "ブラウザがマイクの権限をブロックしています",
      body: "CatSpeak がスピーキング試験ルームに接続し、HSK の回答を採点するにはマイクへのアクセスが必要です。",
      consequencesTitle: "権限を許可しない場合：",
      consequences: [
        "スピーキング評価を完了できません。",
        "有効な HSK レベル証明を発行できません。",
        "正確な個別学習ロードマップを作成できません。",
      ],
      stepsTitle: "マイクを解除する 3 つのステップ",
      steps: [
        {
          title: "1. 鍵 / 権限アイコンをクリック",
          desc: "ブラウザのアドレスバー左側にある鍵アイコンをクリックします。",
        },
        {
          title: "2. マイクを許可（Allow）",
          desc: "マイクを「ブロック」から「許可」に切り替えます。",
        },
        {
          title: "3. 再試行をクリックして接続",
          desc: "下のボタンを押して、システムにマイクを検出させ再接続します。",
        },
      ],
      retryCta: "解除しました、再確認",
      trust: "CatSpeak は音声データの 100% の暗号化と安全性を約束します。",
    },
    device: {
      title: "スピーキング音声テスト",
      statusReady: "音量は良好",
      statusListening: "聞き取り中…",
      statusNoSignal: "音声が検出されません",
      statusError: "マイクにアクセスできません",
      instruction:
        "下の中国語サンプル文を声に出して読み、音声品質を確認してください：",
      sampleHanzi: "你好！欢迎来到 CatSpeak。",
      samplePinyin: "Nǐ hǎo! Huānyíng lái dào CatSpeak.",
      sampleTranslation: "（こんにちは！CatSpeak へようこそ。）",
      record: "タップして音声サンプルを録音",
      recording: "録音中…タップで停止",
      replay: "録音したサンプルを再生（{{duration}} 秒）",
      deviceTitle: "入力デバイス設定",
      deviceCaption: "OS の既定 · 正常に動作中",
      devicePlaceholder: "マイクが見つかりません",
      checklist: [
        "音声信号はクリアでノイズなし",
        "接続は安定し、応答も迅速",
        "録音デバイスは試験の準備完了",
      ],
      continueCta: "音声は良好、続行",
      errorTitle: "マイクにアクセスできません",
      errorBody:
        "CatSpeak が録音デバイスに接続できませんでした。マイクの権限を確認して再試行してください。",
      errorRetryCta: "マイク確認を再試行",
    },
    noAudio: {
      instruction:
        "サンプル録音から 5 秒経過しても、マイクから音声を受信できませんでした。",
      meterLabel: "音声信号なし（0 dB）",
      info: "再試行する前に、横の対処手順をお試しください。",
      guideTitle: "録音トラブルシューティングガイド",
      switchHint: "タップして別のマイクに切り替え",
      fixes: [
        {
          title: "1. 物理ミュートスイッチを確認",
          desc: "ヘッドセットのケーブルやキーボードのマイクスイッチをオンにします。",
        },
        {
          title: "2. マイク端子をしっかり差し直す",
          desc: "3.5mm プラグまたは USB ポートを抜いて、しっかり差し込み直します。",
        },
        {
          title: "3. サウンド設定で音量を上げる",
          desc: "入力音量（Input Volume）を 80 - 100% に上げます。",
        },
      ],
      retryCta: "もう一度話してみる",
    },
    band: {
      title: "推定ターゲットレベルを選択",
      subtitle:
        "AI チューターはこのレベルを基準に最初の質問を出し、その後あなたの実際の反応に合わせて難易度を自動調整します。",
      difficultyLabel: "難易度：",
      startCta: "スピーキング練習を開始（{{band}}）",
      lockedNote: "適応型評価は全 5 問 · 難易度はあなたの反応に合わせて自動調整",
      items: {
        hsk1_2: {
          level: "初級 · Beginner",
          title: "HSK 1 - 2",
          desc: "発音から始め、挨拶や基本語彙に慣れます。",
          vocab: "目標語彙数：150 – 300 語",
          time: "学習期間：0 – 3 か月",
          topics: ["挨拶", "買い物"],
          difficulty: "やさしい",
        },
        hsk3_4: {
          level: "人気のおすすめ",
          title: "HSK 3 - 4",
          desc: "6〜12 か月学習済みで、日常生活や旅行で自然に会話できます。",
          vocab: "目標語彙数：600 – 1,200 語",
          time: "学習期間：6 – 12 か月",
          topics: ["仕事", "旅行", "趣味"],
          difficulty: "バランス",
        },
        hsk5_6: {
          level: "上級 · Advanced",
          title: "HSK 5 - 6",
          desc: "反応が速く、経済や文化について深く議論・交渉できます。",
          vocab: "目標語彙数：2,500 – 5,000 語",
          time: "学習期間：1.5 年以上",
          topics: ["プレゼン", "交渉"],
          difficulty: "チャレンジ",
        },
      },
    },
    session: {
      title: "スピーキング試験ルーム",
      body: "セッションは作成され、安全に保存されました。ライブ会話ルームは次のステップで完成します。",
      codeLabel: "セッションコード",
      backCta: "デバイス確認に戻る",
    },
    room: {
      title: "スピーキング練習ルーム",
      subtitle: "AI 適応会話 • HSK 3.0",
      connection: "接続は安定",
      configure: "AI 設定",
      pause: "試験を一時停止",
      casual: "カジュアル会話（Casual Chat）",
      placement: "プレースメントテスト",
      progress: "進捗：第 {{current}} / {{total}} 問",
      aiLabel: "AI（ミンミン）",
      replay: "もう一度聞く",
      pinyinLabel: "ピンイン：{{pinyin}}",
      scriptHanzi: "漢字",
      scriptPinyin: "ピンイン",
      youLabel: "あなた",
      statusWaiting: "聞き取り中...",
      statusRecognized: "● 認識良好",
      statusSubmitted: "提出済み",
      statusNoAudio: "音声なし",
      transcriptPlaceholder: "あなたの回答がここに表示されます...",
      analyzingSubline: "発音と文法を自動分析しています...",
      waitingSubline: "中国語で回答を話してください。",
      aiListening: "AI があなたの声を聞いています...",
      aiAnalyzing: "AI が回答を分析しています...",
      aiNotHearing: "AI がより注意深く聞いています...",
      timerRecording: "{{time}} / 00:45 • 録音中",
      timerWaiting: "{{time}} / 00:45 • 音声を待機中",
      submitCta: "回答を完了する",
      skipCta: "この問題をスキップ（0点）→",
      scoringSummary: "スコアを集計中...",
      retryBanner:
        "AI が回答を聞き取れませんでした。もう一度話してください。（{{attempt}} / {{max}} 回目）",
      noHearingBanner:
        "AI があなたの声を聞き取れませんでした。マイクを確認するか、入力音量を上げてください。",
      volumeHint: "音量が小さめです。もう少し大きな声で話すか、マイク音量を上げてください。",
      configureNotice: "AI 設定は近日公開予定です。",
      pauseTitle: "調査を一時停止しました",
      pauseBody:
        "現在の問題のタイマーが停止しました。再開する前に水分補給や休憩をとって構いません。",
      pauseSafeData:
        "データは安全です：これまでの回答（{{answered}} 問）は暗号化され、サーバーに正常に保存されています。",
      pauseBudgetLabel: "残り一時停止可能時間：",
      pauseBudgetChip: "⏳ {{time}} 分",
      pauseLeaveCta: "一時的に試験室を離れる",
      pauseResumeCta: "今すぐ試験を再開 ▷",
      reconnectTitle: "接続が切断されました",
      reconnectBody:
        "ネットワーク信号が不安定なため、AI 試験室との音声接続が中断されました。システムが再接続を試みています。",
      reconnectSafeData:
        "進捗は保存済み：これまでの回答データ（{{answered}} 問）は第 {{order}}/{{total}} 問で安全に保存されています。スコアに影響はありません。",
      reconnectProgressLabel: "自動再接続の進行状況：",
      reconnectProgressChip: "🔄 {{seconds}} 秒後...（{{attempt}}/{{max}} 回目）",
      reconnectRetryCta: "今すぐ再接続 🔄",
    },
    scoring: {
      title: "採点中",
      body: "システムが 5 つの回答を分析しています。結果レポートは次のステップで完成します。",
      backCta: "試験ルームに戻る",
    },
  },
}
