export const vi = {
  pointsAndOffers: {
    pageTitle: "Quản lý Điểm thưởng và Ưu đãi",
    pageSubtitle:
      "Theo dõi số dư điểm thưởng, tích lũy điểm và đổi lấy các voucher học tập giá trị.",

    // Main Tabs
    tabs: {
      overview: "Tổng quan",
      exchange: "Đổi Voucher",
      vault: "Kho Voucher",
      history: "Lịch sử điểm",
    },

    // Banner
    banner: {
      currentPoints: "Số điểm hiện có",
      expiringNotice: "{{points}} điểm sẽ hết hạn vào {{date}}",
      redeemNow: "Đổi Voucher ngay",
    },

    // Overview Tab
    overview: {
      stats: {
        totalAccumulated: "Tổng điểm đã tích lũy",
        redeemed: "Đã đổi",
        expiringSoon: "Sắp hết hạn",
        expiringBefore: "trước {{date}}",
        pointsUnit: "điểm",
        pts: "pts",
      },
      earningMethods: {
        title: "Cách nhận điểm",
        review: {
          title: "Đánh giá khóa học",
          subtitle: "Sau mỗi lớp học kết thúc",
        },
        referral: {
          title: "Giới thiệu bạn bè",
          subtitle: "Bạn bè đăng ký thành công",
        },
        milestone: {
          title: "Hoàn thành lộ trình",
          subtitle: "Hoàn thành toàn bộ khóa học",
        },
      },
      recentActivities: {
        title: "Hoạt động gần đây",
        viewAll: "Xem tất cả",
        empty: "Chưa có hoạt động điểm nào gần đây.",
        earnedPoints: "Tích lũy điểm",
        spentPoints: "Sử dụng điểm",
        earnCompleted: "Tích lũy hoàn tất",
        redeemVoucher: "Đổi voucher",
        expiredPoints: "Điểm thưởng hết hạn",
        pointsExpired: "Điểm hết hạn",
      },
      readyToRedeem: {
        title: "Có thể đổi ngay",
        viewAll: "Xem tất cả",
        empty:
          "Chưa có voucher phù hợp với số điểm hiện có. Hãy tích thêm điểm nhé!",
      },
    },

    // Exchange Tab
    exchange: {
      searchPlaceholder: "Tìm kiếm voucher ưu đãi...",
      filterLabel: "Lọc:",
      categories: {
        all: "Tất cả",
        redeemable: "Có thể đổi ngay",
      },
      types: {
        all: "Tất cả các loại",
        percentage: "Giảm theo %",
        fixed: "Giảm số tiền",
      },
      empty: {
        title: "Không tìm thấy voucher phù hợp",
        subtitle:
          "Hãy thử tìm kiếm với từ khóa khác hoặc chuyển danh mục bộ lọc.",
      },
    },

    // Vault Tab
    vault: {
      subTabs: {
        unused: "Chưa dùng",
        used: "Đã dùng",
        expired: "Hết hạn",
      },
      empty: {
        title: "Chưa có voucher nào trong mục này",
        subtitle:
          "Bạn có thể tích lũy điểm thưởng qua các hoạt động học tập và đổi ngay những ưu đãi hấp dẫn.",
        exploreAction: "Khám phá kho ưu đãi",
      },
      item: {
        copyCode: "Sao chép mã",
        useNow: "Dùng ngay",
        copyTooltip: "Sao chép mã",
        usedDate: "Thời gian sử dụng: {{date}}",
        expiryDate: "HSD: {{date}}",
        voucherLabel: "Voucher",
        percentDiscountDesc: "Giảm {{percent}}% học phí khi thanh toán",
        fixedDiscountDesc: "Trừ trực tiếp {{amount}} đ vào hóa đơn",
      },
    },

    // History Tab
    history: {
      filters: {
        all: "Tất cả",
        earn: "Nhận điểm (+)",
        spend: "Sử dụng (-)",
      },
      table: {
        activity: "HOẠT ĐỘNG",
        time: "THỜI GIAN",
        points: "ĐIỂM",
      },
      pagination: {
        pageInfo: "Trang {{page}} (Hiển thị tối đa {{pageSize}} mục/trang)",
        prev: "Trước",
        next: "Sau",
      },
      empty: {
        title: "Không có lịch sử biến động điểm",
        subtitle:
          "Hoàn thành các khóa học hoặc tham gia hoạt động để kiếm điểm thưởng nhé!",
      },
    },

    // Voucher Card
    cards: {
      redeemNow: "Đổi ngay",
      redeemNowArrow: "Đổi ngay →",
      outOfStock: "Hết hàng",
      unavailable: "Không khả dụng",
      notEligible: "Chưa đủ điều kiện",
      needMorePoints: "Cần thêm {{points}} điểm",
      validDays: "Hạn {{days}} ngày",
      validDaysFull: "Hạn sử dụng {{days}} ngày",
      valid30Days: "Hạn 30 ngày",
      valid30DaysShort: "HSD 30 ngày",
      stockRemaining: "Kho: {{stock}} lượt",
      percentDiscountBadge: "Giảm {{percent}}%",
      fixedDiscountBadge: "Giảm {{amount}}",
      defaultCondition: "Áp dụng khi thanh toán khóa học/lớp học",
    },

    // Modals
    modals: {
      confirm: {
        title: "Xác nhận đổi Voucher",
        prompt:
          "Bạn có chắc muốn dùng {{points}} điểm để đổi ưu đãi này không?",
        voucherLabel: "Voucher",
        availablePoints: "Điểm hiện có",
        deductPoints: "Điểm cần trừ",
        remainingPoints: "Điểm còn lại",
        cancel: "Hủy",
        confirmBtn: "Xác nhận đổi",
      },
      processing: {
        title: "Đang xử lý đổi voucher...",
        subtitle: "Vui lòng đợi trong giây lát và không đóng cửa sổ này",
      },
      success: {
        title: "Đổi Voucher thành công!",
        message: "Voucher {{title}} đã được thêm vào kho của bạn.",
        codeLabel: "MÃ VOUCHER",
        copyTooltip: "Sao chép mã",
        validUntil: "Hiệu lực đến: {{date}}",
        defaultExpiry: "30 ngày sau",
        viewVaultBtn: "Xem kho voucher của tôi",
        closeBtn: "Đóng",
      },
      error: {
        networkTitle: "Không thể kết nối",
        networkDesc:
          "Có lỗi kỹ thuật hoặc mất kết nối mạng. Điểm của bạn không bị trừ. Vui lòng thử lại sau.",
        errorCode: "Mã lỗi: {{code}}",
        retryBtn: "Thử lại",
        closeBtn: "Đóng",
        outOfStockTitle: "Ưu đãi vừa hết lượt",
        outOfStockDesc:
          "Rất tiếc, Voucher này đã hết lượt quy đổi trong khi bạn xác nhận! Điểm của bạn không bị trừ.",
        chooseAnotherBtn: "Chọn ưu đãi khác",
      },
    },

    // Toasts & Notifications
    toasts: {
      copySuccess: "Đã sao chép mã {{code}} vào bộ nhớ tạm!",
      copySuccessSimple: "Đã sao chép mã {{code}}!",
      redeemSuccess: "Đổi voucher thành công!",
      outOfStockError: "Voucher này đã hết lượt đổi!",
      needMorePointsError: "Bạn cần thêm {{points}} điểm để đổi voucher này!",
      cannotRedeemNow: "Không thể đổi voucher vào lúc này.",
      appliedVoucherInfo:
        "Đã chọn mã {{code}}. Bạn có thể áp dụng mã này khi thanh toán khóa học!",
    },
  },
}

export default vi
