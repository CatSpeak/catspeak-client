export default {
  title: "Gia sư AI",
  onlyChineseNotice: {
    title: "Gia sư AI hiện chỉ hỗ trợ cộng đồng Tiếng Trung",
    description:
      "Các phòng luyện nói, lộ trình 5 ngày và kho từ vựng của Gia sư AI hiện được thiết kế riêng cho cộng đồng Tiếng Trung (zh). Bạn có thể chuyển sang Tiếng Trung để tiếp tục, hoặc quay về cộng đồng hiện tại.",
    switchToChinese: "Chuyển sang Tiếng Trung (zh)",
    backToCommunity: "Quay về cộng đồng",
  },
  levelAssessment: {
    title: "Đánh giá trình độ",
  },
  learningPath: {
    title: "Lộ trình 5 ngày",
  },
  speakingRoom: {
    title: "Phòng luyện nói",
    headerTitle: "Phòng luyện nói tương tác 2 chiều",
    headerBadge: "50+ Chủ đề thực tế",
    levelLabel: "Trình độ:",
    quota: {
      title: "Hạn mức hôm nay:",
      freePlan: "Gói Free: {{count}} buổi/ngày",
      proPlan: "Gói Pro: Không giới hạn",
      resetNote: "Làm mới lúc {{time}} · Premium không giới hạn buổi",
      remaining: "Còn lại {{remaining}} / {{total}} buổi ({{percent}}%)",
      upgrade: "Nâng cấp Premium",
      zeroSessions: "0 buổi",
      totalSessions: "{{total}} buổi (Tối đa)",
    },
    searchPlaceholder:
      "Tìm kiếm chủ đề, từ vựng (ví dụ: mua sắm, 买水果, mai cai, du lịch...)",
    randomPick: "AI Chọn ngẫu nhiên",
    tabs: {
      all: "Tất cả",
    },
    sections: {
      searchResults: "🔍 KẾT QUẢ TÌM KIẾM",
      searchBadge: "{{count}} chủ đề phù hợp",
      recommended: "⭐ AI GỢI Ý RIÊNG CHO BẠN",
      recommendedBadge: "{{count}} chủ đề đề xuất (HSK {{level}})",
      standard: "📌 CHỦ ĐỀ GIAO TIẾP HSK 1-3",
      advanced: "🔒 CHỦ ĐỀ CÔNG SỞ & THỬ THÁCH NÂNG CAO (HSK 4+)",
      tabRecommended: "⭐ ĐỀ XUẤT HSK {{level}}",
      others: "📌 CHỦ ĐỀ KHÁC",
      fallback: "DANH SÁCH CHỦ ĐỀ",
      countBadge: "{{count}} chủ đề",
    },
    loadingTopics: "Đang tải danh sách chủ đề đàm thoại...",
    topicError: "Không thể tải danh sách chủ đề.",
    activeSession: {
      notice:
        "Bạn còn một phiên luyện nói chưa kết thúc. Hãy tiếp tục hoặc đóng phiên trước khi bắt đầu buổi mới.",
      continue: "Tiếp tục phiên",
      closing: "Đang đóng phiên...",
      closeOld: "Đóng phiên cũ",
      closeFailed: "Không thể đóng phiên cũ. Hãy thử lại.",
      conflictStart:
        "Hãy tiếp tục hoặc đóng phiên cũ trước khi bắt đầu buổi mới.",
    },
    topicCard: {
      questions: "{{count}} câu",
      premium: "⭐ Premium",
      twoWay: "Đàm thoại 2 chiều",
      vocabulary: "Từ vựng:",
    },
    topicList: {
      errorTitle: "Không thể tải danh sách chủ đề",
      errorDesc:
        "Đã xảy ra lỗi khi tải danh sách chủ đề từ máy chủ. Vui lòng kiểm tra lại.",
      retry: "Thử lại",
      emptyTitle: "Hiện chưa có chủ đề nào",
      emptyDesc:
        "Hệ thống chưa có dữ liệu chủ đề đàm thoại khả dụng. Vui lòng quay lại sau.",
      noMatchTitle: "Không tìm thấy chủ đề phù hợp",
      noMatchDesc:
        "Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chọn tất cả bộ lọc.",
    },
    sticky: {
      selected: "Đã chọn: {{title}}",
      turns: "4-6 câu",
      quotaExceededDetail:
        "Bạn đã dùng hết hạn mức hôm nay (2/2 buổi). Nâng cấp để tiếp tục.",
      quotaNote: "Trừ 1 buổi vào hạn mức sau khi hoàn thành phiên luyện nói",
      start: "Bắt đầu luyện nói ngay",
      outOfQuota: "Hết hạn mức hôm nay",
      upgradeHint: "Bạn đã dùng hết hạn mức hôm nay. Vui lòng nâng cấp gói.",
    },
    speaking: {
      sessionTitle: "Luyện nói tiếng Trung",
      connectingTitle: "Đang kết nối phòng luyện nói...",
      connectingTopic: "Đang kết nối với trợ lý cho chủ đề:",
      pleaseWait: "Vui lòng chờ trong giây lát...",
      cancelBack: "Hủy và quay lại danh sách chủ đề",
      failedTitle: "Không thể kết nối vào phòng luyện nói",
      failedFallback:
        "Không thể kết nối với trợ lý. Vui lòng kiểm tra mạng và thử lại.",
      retryConnect: "🔄 Thử kết nối lại",
      backToTopics: "Quay lại danh sách chủ đề",
      restoringTitle: "Đang khôi phục kết nối",
      restoringDesc:
        "Phiên sẽ tự kết thúc nếu kết nối không được khôi phục trong 15 giây.",
      retry: "Thử kết nối lại",
      joined: "Đã vào phòng luyện nói",
      connectingShort: "Đang kết nối với trợ lý...",
      turnLabel: "Lượt {{current}}/{{total}}",
      end: "Kết thúc",
      grantAgain: "Cấp quyền lại",
      points: "Điểm",
      aiSpeaking: "AI Tutor Cat Speak đang nói...",
      aiListening: "AI đang lắng nghe bạn...",
      aiTutorName: "AI TUTOR CAT SPEAK",
      replayPlaying: "Đang phát...",
      replay: "Nghe lại",
      studentName: "BẠN (HỌC VIÊN)",
      micOn: "✓ Micro đang bật",
      micOff: "✕ Micro đang tắt",
      listeningYou: "Đang lắng nghe bạn nói...",
      hintButton: "💡 Gợi ý",
      hintLabel: "💡 Gợi ý:",
      hintTitle: "Bấm để nghe mẫu giọng AI tốc độ chậm",
      correctionLabel: "MẸO SỬA LỖI TỨC THÌ:",
      correctionPrefix: "Bạn nói:",
      correctionArrow: "➔ Thử nói:",
      timerSuffix: "Thu âm phản xạ",
      micTitleOn: "Nhấn để tắt mic",
      micTitleOff: "Nhấn để bật mic và bắt đầu nói",
      micCaptionOn: "Micro đang bật · Nhấn để tắt",
      micCaptionOff: "Micro đang tắt · Nhấn để bật & cấp quyền",
      tokenMissing:
        "Không tìm thấy mã LiveKit token hợp lệ để kết nối vào phòng.",
      connectFailed: "Không thể kết nối đến máy chủ đàm thoại LiveKit.",
      notSupported: "Trình duyệt không hỗ trợ truy cập Micro.",
      permissionDenied:
        "Chưa cấp quyền Micro. Vui lòng cho phép trình duyệt truy cập mic để luyện nói.",
      endRequestFailed: "Không gửi được yêu cầu kết thúc. Hãy thử lại.",
      warnSilence:
        "Bạn có cần AI hỗ trợ không? Hãy thử phát âm một từ gợi ý nhé!",
      warnTime: "Phiên luyện nói sắp hết giờ (còn 1 phút).",
      placeholder: "Chào bạn! Bạn đã sẵn sàng chưa?",
    },
    complete: {
      title: "BUỔI LUYỆN NÓI ĐÃ HOÀN TẤT!",
      subtitle:
        "Gia sư AI đang tính toán điểm số và trích xuất từ vựng vào Flashcard...",
      processing: "Đang xử lý {{percent}}% ({{time}})",
      done: "Hoàn tất",
      extracting: "Đang trích xuất...",
      processingItem: "Đang xử lý...",
      viewReport: "Xem Báo cáo Tổng kết ngay",
      estimatedNow: "xong",
      estimatedTwoSeconds: "khoảng 2 giây",
      estimatedSoon: "sắp xong",
    },
    result: {
      pageTitle: "BÁO CÁO TỔNG KẾT BUỔI LUYỆN NÓI",
      topicMeta: "Chủ đề: {{topic}} · Thời lượng: {{duration}} · {{date}}",
      backToCatalog: "← Về danh mục",
      totalScore: "ĐIỂM TỔNG QUAN",
      levelPrefix: "Đánh giá trình độ: ",
      metrics: {
        fluency: "Độ trôi chảy (Fluency)",
        pronunciation: "Phát âm & Thanh điệu",
        grammar: "Ngữ pháp & Vốn từ",
      },
      strengthsTitle: "ĐIỂM MẠNH ĐÁNG KHEN:",
      improvementsTitle: "ĐIỂM CẦN LƯU Ý & KHẮC PHỤC NGỮ ÂM:",
      pronunciationDetail:
        "👉 Xem phân tích âm tiết chi tiết & Video khẩu hình 1-1 →",
      savedTitle: "ĐÃ LƯU {{count}} TỪ VỰNG VÀO FLASHCARD — SẼ NHẮC ÔN LẠI:",
      practiceNow: "Ôn tập {{count}} từ vựng này ngay",
      goHome: "Quay về Trang chủ",
      retry: "Thử lại",
      defaultTopic: "Luyện nói với AI",
      sessionFallback: "Buổi luyện nói",
      savedNotice: "Buổi nói của bạn đã được lưu lại.",
      forbidden: "Bạn không có quyền xem báo cáo của buổi nói này.",
      timeout: "Quá thời gian tạo báo cáo. Bạn có thể nhấn thử lại bên dưới.",
      loadFailed: "Chưa tải được báo cáo. Bạn thử tải lại trang sau ít phút nhé.",
      finalizing:
        "Báo cáo đang được hoàn tất, trang sẽ tự cập nhật trong giây lát.",
      emptySession:
        "Buổi này chưa ghi nhận câu trả lời nào. Lần sau bạn thử trả lời bằng một câu thật ngắn, AI sẽ giúp bạn nói tiếp.",
      abandoned:
        "Phiên đã dừng trước khi hoàn tất. Đây là dữ liệu hiện có của buổi luyện nói.",
      partial:
        "Đang hoàn tất nhận xét chi tiết và nghĩa từ vựng, báo cáo sẽ tự cập nhật.",
    },
    pronunciation: {
      unavailable: "Phân tích phát âm chi tiết đang tạm tắt. Bạn quay lại sau nhé.",
      loadFailed: "Chưa tải được phân tích phát âm. Bạn thử lại sau ít phút nhé.",
      noAudio:
        "Buổi nói này chưa có bản ghi âm để phân tích. Buổi sau bạn nhớ bật mic trong suốt buổi nhé.",
      allGood:
        "Bạn phát âm rất ổn, không có từ nào cần luyện thêm trong buổi này!",
      retryNotHeard: "Chưa nghe rõ, bạn thử nói to và rõ hơn nhé.",
      retryFailed: "Chưa chấm được lần này, bạn thử lại nhé.",
    },
    modals: {
      close: "Đóng cửa sổ",
      early: {
        title: "Hoàn thành bài nói & xem kết quả ngay?",
        subtitle:
          "Số câu bạn đã luyện tập: {{completed}} / {{total}} câu phản xạ.",
        infoTitle: "Thông tin nộp bài sớm",
        infoDesc:
          "Bạn có thể nộp bài bất cứ lúc nào! Hệ thống sẽ chấm điểm và nhận xét dựa trên những câu bạn đã đàm thoại trong buổi này.",
        resultTitle: "Bạn sẽ nhận được sau khi nộp bài",
        resultDesc:
          "Báo cáo đánh giá phát âm chi tiết + các từ vựng mới/sai tự động lưu vào sổ Flashcard ôn tập ngắt quãng của bạn!",
        submit: "Nộp bài",
        stay: "Tiếp tục ở lại",
      },
      network: {
        title: "Mất Kết Nối Đường Truyền",
        subtitle:
          "Tín hiệu âm thanh với phòng luyện nói AI bị gián đoạn do mạng không ổn định.",
        reconnecting: "Mất kết nối âm thanh. Đang kết nối lại... ({{seconds}}s)",
        keepScreen:
          "Vui lòng giữ nguyên màn hình, AI sẽ tiếp tục ngay khi có mạng.",
        safe:
          "Dữ liệu thoại trước đó đã được lưu an toàn. Quá {{seconds}}s sẽ tự động tổng kết buổi học.",
        endAndSave: "Kết thúc & Lưu kết quả",
        retryNow: "Thử kết nối lại ngay",
      },
      quota: {
        title: "Hết hạn mức miễn phí hôm nay",
        desc:
          "Tài khoản Miễn phí (Free) được cấp 2 buổi luyện nói trọn vẹn mỗi ngày. Bạn đã sử dụng hết hạn mức hôm nay, vui lòng nâng cấp để luyện nói không giới hạn:",
        benefitsTitle: "Mở khóa toàn bộ sức mạnh với gói Premium:",
        benefit1: "Luyện nói KHÔNG GIỚI HẠN số buổi 24/7 cùng AI Tutor",
        benefit2: "Mở khóa toàn bộ 50+ chủ đề chuyên sâu từ HSK 1 đến HSK 6",
        benefit3: "Đào sâu khẩu hình ngữ âm & Video Shorts 1-1 độc quyền",
        benefit4: "Đồng bộ tự động từ vựng vào Flashcard ôn tập ngắt quãng",
        priceLabel: "Ưu đãi ra mắt chỉ:",
        price: "99.000 đ / tháng",
        upgrade: "Nâng cấp Premium ngay",
        later: "Để mai tôi luyện tiếp",
      },
      conflict: {
        title: "Phát hiện phiên học đang hoạt động",
        subtitle: "Bạn đang có buổi luyện nói ở thiết bị khác.",
        device: "Thiết bị:",
        topic: "Chủ đề:",
        status: "Trạng thái:",
        securityNote:
          "Để đảm bảo bảo mật và chất lượng âm thanh 2 chiều, mỗi tài khoản chỉ được tham gia 1 phòng nói duy nhất tại một thời điểm.",
        understood: "Đã hiểu",
        closeHome: "Đóng & Quay về Trang chủ",
        transfer: "Chuyển phiên sang thiết bị này",
      },
      micro: {
        title: "Hướng dẫn mở quyền Microphone",
        desc:
          "Trình duyệt đang chặn truy cập Micro. CatSpeak cần quyền Micro để AI nhận diện giọng nói và đàm thoại thời gian thực cùng bạn:",
        stepsTitle: "3 bước mở khóa Microphone nhanh:",
        step1:
          "Nhấn vào biểu tượng Ổ khóa cạnh thanh URL trình duyệt góc trên bên trái.",
        step2:
          "Tìm mục Microphone và chuyển trạng thái gạt sang Cho phép (Allow).",
        step3:
          "Nhấn nút 'Đã bật mic, Thử lại ngay' bên dưới để hệ thống kiểm tra lại tín hiệu.",
        retry: "Đã bật mic, Thử lại ngay",
        backToTopics: "Quay lại chọn chủ đề",
      },
      hsk: {
        title: "Chọn cấp độ HSK tạm thời",
        desc:
          "Bạn chưa làm bài kiểm tra đầu vào (xếp lớp)? Tự chọn level ước lượng để AI tối ưu độ khó hội thoại cho phù hợp:",
        tip:
          "Khuyên dùng: Nên làm bài Placement Test (3 phút) để hệ thống tự động xác định level chuẩn nhất.",
        confirm: "Xác nhận & Tiếp tục",
        takeTest: "Làm bài test đầu vào",
        options: {
          hsk1: "HSK 1 - Mới bắt đầu (Từ vựng cơ bản: Chào hỏi, số đếm)",
          hsk2: "HSK 2 - Sơ cấp (Giao tiếp ngắn: Mua sắm, hỏi giờ, thời tiết)",
          hsk3: "HSK 3 - Trung cấp sơ (Giao tiếp tự nhiên, ăn uống) ★ Khuyên dùng",
          hsk4: "HSK 4 - Trung cấp (Bàn luận xã hội, sở thích, phỏng vấn)",
          hsk56: "HSK 5-6 - Cao cấp (Thuyết trình, chuyên ngành thương mại)",
        },
      },
      mouth: {
        stepsTitle: "3 bước khẩu hình chuẩn:",
        tipTitle: "Mẹo từ AI Tutor CatSpeak:",
        practiceNow: "Đã hiểu khẩu hình, Luyện tập ngay",
        videoUpdating:
          "Video khẩu hình đang được giáo viên cập nhật. Bạn làm theo ba bước bên cạnh nhé.",
        duration: "Thời lượng: {{duration}} · CatSpeak",
      },
      pronunciation: {
        title: "Phân tích ngữ âm chuyên sâu",
        analyzing: "Đang phân tích từng âm tiết trong buổi nói của bạn...",
        accuracy: "Độ chính xác: {{score}}% ({{status}})",
        syllablesTitle: "Bóc tách âm tiết & thanh điệu:",
        syllableLine:
          "Âm {{index}}: \"{{syllable}}\" ({{tone}}) ➔ Bạn phát âm: {{status}} ({{score}}%)",
        pitchTitle: "So sánh đường cong cao độ:",
        userVoice: "Giọng bạn:",
        userVoiceTitle: "Nghe lại giọng bạn",
        aiModel: "AI mẫu:",
        aiModelTitle: "Nghe phát âm mẫu tốc độ chậm",
        recordTitle: "Thu âm luyện lại âm tiết này ngay:",
        recordAria: "Nhấn để thu âm",
        recording: "Đang thu âm... bấm lần nữa để dừng",
        retestResult: "Kết quả chấm lại vừa thực hiện: {{score}}%",
        close: "Đóng cửa sổ",
        watchShorts: "Xem video Shorts khẩu hình",
      },
    },
  },
  vocabularyNotebook: {
    title: "Sổ tay từ vựng",
  },
  historyProgress: {
    title: "Lịch sử & Tiến độ",
    badge: "Sắp ra mắt",
    comingSoonDesc:
      "Tính năng thống kê tiến độ chi tiết đang được hoàn thiện. Trong lúc chờ, bạn có thể tiếp tục luyện tập theo lộ trình 5 ngày, vào phòng luyện nói hoặc ôn lại sổ từ vựng.",
    learningPathCta: "Lộ trình 5 ngày",
    speakingRoomCta: "Phòng luyện nói",
    vocabularyCta: "Sổ từ vựng",
  },
}
