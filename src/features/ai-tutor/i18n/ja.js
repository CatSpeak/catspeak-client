export default {
  title: "AI チューター",
  onlyChineseNotice: {
    title: "AI チューターは現在中国語コミュニティのみ対応しています",
    description:
      "AI チューターのスピーキングルーム、5日間学習ロードマップ、単語ツールは現在中国語（zh）コミュニティ向けに設計されています。中国語に切り替えて続けるか、現在のコミュニティに戻ってください。",
    switchToChinese: "中国語（zh）に切り替える",
    backToCommunity: "コミュニティに戻る",
  },
  levelAssessment: {
    title: "レベル診断",
  },
  learningPath: {
    title: "5日間学習ロードマップ",
  },
  speakingRoom: {
    title: "スピーキングルーム",
    headerTitle: "双方向インタラクティブ・スピーキングルーム",
    headerBadge: "50以上の実践トピック",
    levelLabel: "レベル：",
    quota: {
      title: "本日の利用枠：",
      freePlan: "無料プラン：1日 {{count}} 回",
      proPlan: "Pro プラン：無制限",
      resetNote: "{{time}} にリセット · Premium は回数無制限",
      remaining: "残り {{remaining}} / {{total}} 回（{{percent}}%）",
      upgrade: "Premium にアップグレード",
      zeroSessions: "0 回",
      totalSessions: "{{total}} 回（上限）",
    },
    searchPlaceholder:
      "トピックや単語を検索（例：買い物、买水果、mai cai、旅行...）",
    randomPick: "AI おまかせ選択",
    tabs: {
      all: "すべて",
    },
    sections: {
      searchResults: "🔍 検索結果",
      searchBadge: "{{count}} 件の該当トピック",
      recommended: "⭐ AI からのおすすめ",
      recommendedBadge: "{{count}} 件のおすすめ（HSK {{level}}）",
      standard: "📌 HSK 1-3 会話トピック",
      advanced: "🔒 ビジネス＆上級チャレンジ（HSK 4+）",
      tabRecommended: "⭐ HSK {{level}} のおすすめ",
      others: "📌 その他のトピック",
      fallback: "トピック一覧",
      countBadge: "{{count}} 件のトピック",
    },
    loadingTopics: "会話トピックを読み込み中...",
    topicError: "トピック一覧を読み込めません。",
    activeSession: {
      notice:
        "未終了のスピーキングセッションがあります。続行するか、閉じてから新しいセッションを開始してください。",
      continue: "セッションを続行",
      closing: "セッションを閉じています...",
      closeOld: "古いセッションを閉じる",
      closeFailed: "古いセッションを閉じられません。もう一度お試しください。",
      conflictStart:
        "新しいセッションを開始する前に、続行するか古いセッションを閉じてください。",
    },
    topicCard: {
      questions: "{{count}} 文",
      premium: "⭐ Premium",
      twoWay: "双方向会話",
      vocabulary: "語彙：",
    },
    topicList: {
      errorTitle: "トピックを読み込めません",
      errorDesc:
        "サーバーからトピックを読み込む際にエラーが発生しました。確認してもう一度お試しください。",
      retry: "再試行",
      emptyTitle: "トピックがまだありません",
      emptyDesc:
        "利用可能な会話トピックがありません。しばらくしてから再度お越しください。",
      noMatchTitle: "該当するトピックがありません",
      noMatchDesc:
        "別のキーワードで検索するか、すべてのフィルターを選択してください。",
    },
    sticky: {
      selected: "選択中：{{title}}",
      turns: "4〜6 文",
      quotaExceededDetail:
        "本日の利用枠（2/2 回）を使い切りました。続けるにはアップグレードしてください。",
      quotaNote: "セッション完了後に利用枠を 1 回消費します",
      start: "今すぐスピーキングを始める",
      outOfQuota: "本日の利用枠を使い切りました",
      upgradeHint:
        "本日の利用枠を使い切りました。プランをアップグレードしてください。",
    },
    speaking: {
      sessionTitle: "中国語スピーキング練習",
      connectingTitle: "スピーキングルームに接続中...",
      connectingTopic: "次のトピックのアシスタントに接続中：",
      pleaseWait: "少々お待ちください...",
      cancelBack: "キャンセルしてトピック一覧に戻る",
      failedTitle: "スピーキングルームに接続できません",
      failedFallback:
        "アシスタントに接続できません。ネットワークを確認して再試行してください。",
      retryConnect: "🔄 再接続",
      backToTopics: "トピック一覧に戻る",
      restoringTitle: "接続を復元中",
      restoringDesc:
        "15秒以内に接続が復元されない場合、セッションは自動的に終了します。",
      retry: "再接続",
      joined: "スピーキングルームに入室しました",
      connectingShort: "アシスタントに接続中...",
      turnLabel: "{{current}}/{{total}} ターン",
      end: "終了",
      grantAgain: "再度許可する",
      points: "スコア",
      aiSpeaking: "AI チューター Cat Speak が話しています...",
      aiListening: "AI があなたの話を聞いています...",
      aiTutorName: "AI TUTOR CAT SPEAK",
      replayPlaying: "再生中...",
      replay: "もう一度聞く",
      studentName: "あなた（学習者）",
      micOn: "✓ マイク ON",
      micOff: "✕ マイク OFF",
      listeningYou: "あなたの話を聞いています...",
      hintButton: "💡 ヒント",
      hintLabel: "💡 ヒント：",
      hintTitle: "タップしてゆっくりした AI のお手本を聞く",
      correctionLabel: "即時修正のヒント：",
      correctionPrefix: "あなた：",
      correctionArrow: "➔ こう言ってみましょう：",
      timerSuffix: "反射録音",
      micTitleOn: "タップしてマイクをオフ",
      micTitleOff: "タップしてマイクをオンにして話し始める",
      micCaptionOn: "マイク ON · タップでオフ",
      micCaptionOff: "マイク OFF · タップでオン＆許可",
      tokenMissing: "ルームに参加するための有効な LiveKit トークンが見つかりません。",
      connectFailed: "LiveKit 音声サーバーに接続できません。",
      notSupported: "このブラウザはマイクへのアクセスに対応していません。",
      permissionDenied:
        "マイクの許可がありません。スピーキング練習のためにマイクへのアクセスを許可してください。",
      endRequestFailed:
        "終了リクエストを送信できません。もう一度お試しください。",
      warnSilence:
        "AI のサポートが必要ですか？おすすめの単語を一つ発音してみましょう！",
      warnTime: "スピーキングセッションはまもなく終了します（残り1分）。",
      placeholder: "こんにちは！準備はできましたか？",
    },
    complete: {
      title: "スピーキングセッションが完了しました！",
      subtitle:
        "AI チューターがスコアを計算し、語彙をフラッシュカードに抽出しています...",
      processing: "処理中 {{percent}}%（{{time}}）",
      done: "完了",
      extracting: "抽出中...",
      processingItem: "処理中...",
      viewReport: "今すぐ総括レポートを見る",
      estimatedNow: "完了",
      estimatedTwoSeconds: "約2秒",
      estimatedSoon: "まもなく完了",
    },
    result: {
      pageTitle: "スピーキングセッション総括レポート",
      topicMeta: "トピック：{{topic}} · 時間：{{duration}} · {{date}}",
      backToCatalog: "← カタログに戻る",
      totalScore: "総合スコア",
      levelPrefix: "レベル評価：",
      metrics: {
        fluency: "流暢さ（Fluency）",
        pronunciation: "発音と声調",
        grammar: "文法と語彙",
      },
      strengthsTitle: "評価できる強み：",
      improvementsTitle: "改善ポイント＆発音の修正：",
      pronunciationDetail:
        "👉 音節の詳細分析と1対1の口の形動画を見る →",
      savedTitle:
        "{{count}} 語をフラッシュカードに保存しました — 復習をお知らせします：",
      practiceNow: "この {{count}} 語を今すぐ復習",
      goHome: "ホームに戻る",
      retry: "再試行",
      defaultTopic: "AI とスピーキング練習",
      sessionFallback: "スピーキングセッション",
      savedNotice: "スピーキングセッションは保存されました。",
      forbidden: "このセッションのレポートを表示する権限がありません。",
      timeout:
        "レポート生成がタイムアウトしました。下の再試行をタップできます。",
      loadFailed:
        "レポートを読み込めません。数分後にページを再読み込みしてください。",
      finalizing:
        "レポートを仕上げ中です。まもなく自動的に更新されます。",
      emptySession:
        "このセッションでは回答が記録されませんでした。次回は短い一文で答えてみてください。AI が続きをサポートします。",
      abandoned:
        "セッションは完了前に停止しました。以下は今回の利用可能なデータです。",
      partial:
        "詳細な講評と語彙の意味を仕上げ中です。レポートは自動的に更新されます。",
    },
    pronunciation: {
      unavailable:
        "詳細な発音分析は一時的に停止中です。しばらくしてからお越しください。",
      loadFailed:
        "発音分析を読み込めません。数分後にもう一度お試しください。",
      noAudio:
        "このセッションには分析できる録音がありません。次回はセッション中マイクをオンにしてください。",
      allGood:
        "発音はとても良好です。今回追加練習が必要な単語はありません！",
      retryNotHeard: "うまく聞き取れませんでした。もう少し大きくはっきり話してください。",
      retryFailed: "今回は採点できませんでした。もう一度お試しください。",
    },
    modals: {
      close: "閉じる",
      early: {
        title: "スピーキングを完了して結果を見ますか？",
        subtitle:
          "練習した文：{{completed}} / {{total}} 文の反射練習。",
        infoTitle: "早期提出について",
        infoDesc:
          "いつでも提出できます！システムは今回のセッションで話した文をもとに採点・講評します。",
        resultTitle: "提出後に受け取れるもの",
        resultDesc:
          "詳細な発音評価レポートと、間隔反復フラッシュカードに自動保存される新出単語・誤答単語！",
        submit: "提出する",
        stay: "練習を続ける",
      },
      network: {
        title: "通信が切断されました",
        subtitle:
          "ネットワークが不安定なため、AI スピーキングルームとの音声信号が途切れました。",
        reconnecting: "音声が切断されました。再接続中...（{{seconds}}s）",
        keepScreen:
          "画面をそのままにしてください。ネットワークが戻り次第 AI が再開します。",
        safe:
          "以前の音声データは安全に保存されています。{{seconds}}s を超えるとセッションを自動で総括します。",
        endAndSave: "終了して結果を保存",
        retryNow: "今すぐ再接続",
      },
      quota: {
        title: "本日の無料枠を使い切りました",
        desc:
          "無料アカウントは1日2回のスピーキングセッションが利用できます。本日の枠を使い切ったため、無制限で練習するにはアップグレードしてください：",
        benefitsTitle: "Premium で全てを解放：",
        benefit1: "AI チューターと24時間365日、回数無制限でスピーキング練習",
        benefit2: "HSK 1 から HSK 6 までの50以上の詳細トピックを解放",
        benefit3: "発音の口の形分析＆限定1対1 Shorts 動画",
        benefit4: "語彙を間隔反復フラッシュカードへ自動同期",
        priceLabel: "ローンチ特別価格：",
        price: "99,000 VND / 月",
        upgrade: "今すぐ Premium にアップグレード",
        later: "明日また練習する",
      },
      conflict: {
        title: "アクティブなセッションを検出しました",
        subtitle: "別のデバイスでスピーキングセッションが進行中です。",
        device: "デバイス：",
        topic: "トピック：",
        status: "ステータス：",
        securityNote:
          "セキュリティと双方向音声品質のため、1つのアカウントは同時に1つのスピーキングルームにのみ参加できます。",
        understood: "了解しました",
        closeHome: "閉じてホームに戻る",
        transfer: "セッションをこのデバイスに移動",
      },
      micro: {
        title: "マイクの許可を有効にする方法",
        desc:
          "ブラウザがマイクへのアクセスをブロックしています。AI が音声を認識してリアルタイムに対話するため、CatSpeak にはマイクの許可が必要です：",
        stepsTitle: "マイクを有効にする3つの手順：",
        step1:
          "ブラウザの URL バー左上にある鍵アイコンをクリックします。",
        step2: "マイクの項目を見つけ、許可（Allow）に切り替えます。",
        step3:
          "下の「マイクをオンにしました、今すぐ再試行」をクリックして、システムに信号を再確認させます。",
        retry: "マイクをオンにしました、今すぐ再試行",
        backToTopics: "トピック選択に戻る",
      },
      hsk: {
        title: "一時的な HSK レベルを選択",
        desc:
          "プレースメントテストを受けていませんか？推定レベルを選択すると、AI が会話の難易度を最適化します：",
        tip:
          "おすすめ：3分間のプレースメントテストを受けて、システムに最適なレベルを判定させましょう。",
        confirm: "確認して続行",
        takeTest: "プレースメントテストを受ける",
        options: {
          hsk1: "HSK 1 - 入門（基本語彙：あいさつ、数字）",
          hsk2: "HSK 2 - 初級（短い会話：買い物、時間、天気）",
          hsk3: "HSK 3 - 中初級（自然な会話、食事）★ おすすめ",
          hsk4: "HSK 4 - 中級（社会話題、趣味、面接）",
          hsk56: "HSK 5-6 - 上級（プレゼン、ビジネス話題）",
        },
      },
      mouth: {
        stepsTitle: "標準的な口の形3ステップ：",
        tipTitle: "AI チューター CatSpeak のヒント：",
        practiceNow: "口の形を理解した、今すぐ練習",
        videoUpdating:
          "口の形の動画は講師が更新中です。横の3ステップに沿って練習してください。",
        duration: "時間：{{duration}} · CatSpeak",
      },
      pronunciation: {
        title: "詳細な発音分析",
        analyzing: "セッション内の各音節を分析しています...",
        accuracy: "正確さ：{{score}}%（{{status}}）",
        syllablesTitle: "音節と声調の分解：",
        syllableLine:
          "{{index}} 音目：\"{{syllable}}\"（{{tone}}）➔ あなたの発音：{{status}}（{{score}}%）",
        pitchTitle: "ピッチカーブの比較：",
        userVoice: "あなたの声：",
        userVoiceTitle: "あなたの声を聞き直す",
        aiModel: "AI のお手本：",
        aiModelTitle: "ゆっくりしたお手本の発音を聞く",
        recordTitle: "この音節を今すぐ録音して練習：",
        recordAria: "タップして録音",
        recording: "録音中... もう一度タップで停止",
        retestResult: "最新の再採点結果：{{score}}%",
        close: "閉じる",
        watchShorts: "口の形の Shorts 動画を見る",
      },
    },
  },
  vocabularyNotebook: {
    title: "単語帳",
  },
  historyProgress: {
    title: "履歴と進捗",
    badge: "近日公開",
    comingSoonDesc:
      "詳細な進捗統計機能を準備中です。それまでの間、5日間学習ロードマップを続けるか、スピーキングルームに入るか、単語帳を復習できます。",
    learningPathCta: "5日間学習ロードマップ",
    speakingRoomCta: "スピーキングルーム",
    vocabularyCta: "単語帳",
  },
}
