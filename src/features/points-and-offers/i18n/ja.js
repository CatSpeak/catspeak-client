export const ja = {
  pointsAndOffers: {
    pageTitle: "ポイント＆特典管理",
    pageSubtitle:
      "ポイント残高の確認、ポイント獲得、お得な学習バウチャーへの交換ができます。",

    // Main Tabs
    tabs: {
      overview: "概要",
      exchange: "バウチャー交換",
      vault: "マイクーポン",
      history: "ポイント履歴",
    },

    // Banner
    banner: {
      currentPoints: "現在の保有ポイント",
      expiringNotice: "{{points}}ポイントが{{date}}に失効します",
      redeemNow: "今すぐバウチャーを交換",
    },

    // Overview Tab
    overview: {
      stats: {
        totalAccumulated: "累計獲得ポイント",
        redeemed: "交換済み",
        expiringSoon: "まもなく失効",
        expiringBefore: "{{date}}まで",
        pointsUnit: "ポイント",
        pts: "pt",
      },
      earningMethods: {
        title: "ポイント獲得方法",
        review: {
          title: "コースを評価",
          subtitle: "各レッスンの終了後",
        },
        referral: {
          title: "友達を紹介",
          subtitle: "友達が登録完了時",
        },
        milestone: {
          title: "学習コースを修了",
          subtitle: "コース全体を修了時",
        },
      },
      recentActivities: {
        title: "最近のアクティビティ",
        viewAll: "すべて見る",
        empty: "最近のポイント履歴はありません。",
        earnedPoints: "ポイント獲得",
        spentPoints: "ポイント使用",
        earnCompleted: "獲得完了",
        redeemVoucher: "バウチャー交換",
        expiredPoints: "ポイント失効",
        pointsExpired: "ポイント失効",
      },
      readyToRedeem: {
        title: "すぐに交換可能",
        viewAll: "すべて見る",
        empty:
          "現在のポイントで交換可能なバウチャーはありません。ポイントを貯めましょう！",
      },
    },

    // Exchange Tab
    exchange: {
      searchPlaceholder: "バウチャーや特典を検索...",
      filterLabel: "絞り込み:",
      categories: {
        all: "すべて",
        redeemable: "すぐに交換可能",
      },
      types: {
        all: "すべてのタイプ",
        percentage: "割引率（%）",
        fixed: "定額割引",
      },
      empty: {
        title: "該当するバウチャーが見つかりません",
        subtitle:
          "別のキーワードで検索するか、フィルターを変更してください。",
      },
    },

    // Vault Tab
    vault: {
      subTabs: {
        unused: "未使用",
        used: "使用済み",
        expired: "期限切れ",
      },
      empty: {
        title: "この項目にバウチャーはありません",
        subtitle:
          "学習アクティビティを通じてポイントを貯め、お得な特典と交換できます。",
        exploreAction: "特典を探す",
      },
      item: {
        copyCode: "コードをコピー",
        useNow: "今すぐ使う",
        copyTooltip: "コードをコピー",
        usedDate: "利用日時: {{date}}",
        expiryDate: "有効期限: {{date}}",
        voucherLabel: "バウチャー",
        percentDiscountDesc: "決済時に受講料が{{percent}}%割引",
        fixedDiscountDesc: "お会計から直接{{amount}}割引",
      },
    },

    // History Tab
    history: {
      filters: {
        all: "すべて",
        earn: "獲得 (+)",
        spend: "使用 (-)",
      },
      table: {
        activity: "アクティビティ",
        time: "日時",
        points: "ポイント",
      },
      pagination: {
        pageInfo: "ページ {{page}}（最大 {{pageSize}} 件表示/ページ）",
        prev: "前へ",
        next: "次へ",
      },
      empty: {
        title: "ポイント履歴がありません",
        subtitle:
          "コースを修了したりアクティビティに参加してポイントを獲得しましょう！",
      },
    },

    // Voucher Card
    cards: {
      redeemNow: "今すぐ交換",
      redeemNowArrow: "今すぐ交換 →",
      outOfStock: "在庫切れ",
      unavailable: "利用不可",
      notEligible: "条件未達成",
      needMorePoints: "あと{{points}}ポイント必要",
      validDays: "有効期間 {{days}}日",
      validDaysFull: "有効期限 {{days}}日",
      valid30Days: "有効期間 30日",
      valid30DaysShort: "有効期限 30日",
      stockRemaining: "残り: {{stock}}点",
      percentDiscountBadge: "{{percent}}%割引",
      fixedDiscountBadge: "{{amount}}割引",
      defaultCondition: "コース・クラスの決済時に適用可能",
    },

    // Modals
    modals: {
      confirm: {
        title: "バウチャー交換の確認",
        prompt:
          "このバウチャーを{{points}}ポイントで交換してもよろしいですか？",
        voucherLabel: "バウチャー",
        availablePoints: "保有ポイント",
        deductPoints: "消費ポイント",
        remainingPoints: "交換後の残高",
        cancel: "キャンセル",
        confirmBtn: "交換を確定",
      },
      processing: {
        title: "バウチャー交換を処理中...",
        subtitle: "少々お待ちください。このウィンドウを閉じないでください",
      },
      success: {
        title: "バウチャーの交換が完了しました！",
        message: "バウチャー「{{title}}」がマイクーポンに追加されました。",
        codeLabel: "バウチャーコード",
        copyTooltip: "コードをコピー",
        validUntil: "有効期限: {{date}}",
        defaultExpiry: "30日後",
        viewVaultBtn: "マイクーポンを見る",
        closeBtn: "閉じる",
      },
      error: {
        networkTitle: "接続できません",
        networkDesc:
          "技術的なエラーまたはネットワーク切断が発生しました。ポイントは消費されていません。もう一度お試しください。",
        errorCode: "エラーコード: {{code}}",
        retryBtn: "再試行",
        closeBtn: "閉じる",
        outOfStockTitle: "在庫がなくなりました",
        outOfStockDesc:
          "申し訳ございません。確認中にこのバウチャーの在庫がなくなりました。ポイントは消費されていません。",
        chooseAnotherBtn: "他の特典を選ぶ",
      },
    },

    // Toasts & Notifications
    toasts: {
      copySuccess: "クーポンコード{{code}}をクリップボードにコピーしました！",
      copySuccessSimple: "コード{{code}}をコピーしました！",
      redeemSuccess: "バウチャーを交換しました！",
      outOfStockError: "このバウチャーは在庫切れです！",
      needMorePointsError:
        "このバウチャーを交換するにはあと{{points}}ポイント必要です！",
      cannotRedeemNow: "現在バウチャーを交換できません。",
      appliedVoucherInfo:
        "コード{{code}}を選択しました。コースの決済時に適用できます！",
    },
  },
}

export default ja
