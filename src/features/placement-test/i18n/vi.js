export default {
  placementTest: {
    title: "Đánh giá trình độ",
    consent: {
      pill: "Đàm thoại trực tiếp cùng AI",
      heading: "Kiểm tra Khẩu ngữ HSK Thích ứng cùng AI",
      intro:
        "Hệ thống khảo sát khẩu ngữ thông minh mô phỏng bài thi HSK 3.0 thực tế. AI Tutor tương tác trực tiếp, tự động điều chỉnh độ khó theo phản xạ của bạn.",
      features: [
        {
          title: "5 Câu hỏi Thích ứng linh hoạt",
          desc: "Tối ưu hóa thời gian thi chỉ 5-7 phút, đo chuẩn xác Band HSK 1-6.",
        },
        {
          title: "Đàm thoại Trực tiếp với AI Bản xứ",
          desc: "Phát âm chuẩn Bắc Kinh, khẩu âm tự nhiên, phản hồi tương tác tức thì.",
        },
        {
          title: "Báo cáo Phân tích 4 Chiều & Lộ trình",
          desc: "Đo lường phát âm, từ vựng, ngữ pháp và độ trôi chảy kèm lộ trình 5 ngày.",
        },
      ],
      agreementTitle: "Thỏa thuận Dữ liệu Âm thanh",
      agreementBody:
        "Để phục vụ việc phân tích giọng nói và cấp chứng nhận trình độ HSK chính xác, CatSpeak sẽ thu nhận âm thanh qua microphone của bạn theo tiêu chuẩn bảo mật an toàn.",
      privacyTitle: "Cam kết Bảo mật PDPA Quốc tế:",
      bulletAudioOnly:
        "Âm thanh chỉ dùng để chấm điểm và cải thiện mô hình phản xạ.",
      bulletNoShare:
        "Không chia sẻ bên thứ ba, dữ liệu mã hóa lưu tối đa 30 ngày.",
      checkbox:
        "Tôi đồng ý cho phép CatSpeak sử dụng microphone và xử lý âm thanh phục vụ kiểm tra đầu vào.",
      startCta: "Bắt đầu Kiểm tra Microphone",
      recommend:
        "Khuyến nghị: Đeo tai nghe có micro và ngồi trong môi trường yên tĩnh để đạt độ chính xác âm học cao nhất.",
    },
    blocked: {
      title: "Trình duyệt đang Chặn Quyền Micro",
      body: "CatSpeak cần truy cập microphone để kết nối với phòng thi đàm thoại và chấm điểm phản xạ HSK.",
      consequencesTitle: "Hậu quả nếu không cấp quyền:",
      consequences: [
        "Không thể hoàn thành bài khảo sát phản xạ nói.",
        "Hệ thống không thể cấp chứng nhận trình độ HSK hợp lệ.",
        "Không thể tạo lộ trình học tập cá nhân hóa chính xác.",
      ],
      stepsTitle: "3 Bước Mở Khóa Microphone",
      steps: [
        {
          title: "1. Nhấp biểu tượng Ổ khóa / Quyền hạn",
          desc: "Nhấp vào icon ổ khóa ở góc trái thanh địa chỉ trình duyệt.",
        },
        {
          title: "2. Cho phép Microphone (Allow)",
          desc: "Gạt chuyển trạng thái Microphone từ Chặn sang Cho phép.",
        },
        {
          title: "3. Nhấp Thử lại để kết nối",
          desc: "Bấm nút bên dưới để hệ thống nhận diện và kết nối lại micro.",
        },
      ],
      retryCta: "Đã Mở Khóa, Kiểm Tra Lại",
      trust: "CatSpeak cam kết mã hóa và bảo mật 100% dữ liệu âm thanh.",
    },
    device: {
      title: "Thử Giọng Khẩu Ngữ",
      statusReady: "Âm lượng đạt chuẩn",
      statusListening: "Đang lắng nghe…",
      statusNoSignal: "Chưa phát hiện giọng nói",
      statusError: "Không truy cập được micro",
      instruction:
        "Hãy đọc to câu tiếng Trung mẫu bên dưới để kiểm tra chất lượng giọng nói:",
      sampleHanzi: "你好！欢迎来到 CatSpeak。",
      samplePinyin: "Nǐ hǎo! Huānyíng lái dào CatSpeak.",
      sampleTranslation: "(Xin chào! Chào mừng bạn đến với CatSpeak.)",
      record: "Nhấn để ghi âm giọng mẫu",
      recording: "Đang ghi âm… nhấn để dừng",
      replay: "Nghe lại đoạn thử giọng vừa thu ({{duration}}s)",
      deviceTitle: "Cấu hình Thiết bị Đầu vào",
      deviceCaption: "Mặc định hệ điều hành · Đang hoạt động tốt",
      devicePlaceholder: "Chưa tìm thấy microphone",
      checklist: [
        "Tín hiệu âm thanh rõ ràng, không tạp âm",
        "Đường truyền ổn định, kết nối nhanh chóng",
        "Thiết bị thu âm sẵn sàng cho bài thi",
      ],
      continueCta: "Âm Thanh Đã Tốt, Tiếp Tục",
      errorTitle: "Không thể truy cập Microphone",
      errorBody:
        "CatSpeak không thể kết nối tới thiết bị thu âm. Hãy kiểm tra quyền truy cập micro và thử lại.",
      errorRetryCta: "Thử Lại Kiểm Tra Micro",
    },
    noAudio: {
      instruction:
        "Hệ thống không nhận được âm thanh từ microphone sau 5 giây thu mẫu.",
      meterLabel: "Không có tín hiệu âm thanh (0 dB)",
      info: "Vui lòng thử các bước khắc phục bên cạnh trước khi thử lại.",
      guideTitle: "Hướng Dẫn Khắc Phục Lỗi Thu Âm",
      switchHint: "Nhấp để đổi nguồn microphone khác",
      fixes: [
        {
          title: "1. Kiểm tra công tắc Mute vật lý",
          desc: "Gạt mở nút mic trên dây tai nghe hoặc bàn phím máy tính.",
        },
        {
          title: "2. Cắm chặt lại jack cắm micrô",
          desc: "Rút và cắm lại chắc chắn đầu cắm 3.5mm hoặc cổng USB.",
        },
        {
          title: "3. Tăng âm lượng trong Sound Settings",
          desc: "Nâng mức âm lượng đầu vào (Input Volume) lên 80 - 100%.",
        },
      ],
      retryCta: "Nói Thử Lại Lần Nữa",
    },
    band: {
      title: "Chọn Cấp Độ Mục Tiêu Ước Lượng của Bạn",
      subtitle:
        "AI Tutor sẽ khởi tạo câu hỏi đầu tiên theo mốc này, sau đó tự động điều chỉnh độ khó theo phản xạ thực tế.",
      difficultyLabel: "Độ khó:",
      startCta: "Bắt Đầu Luyện Nói ({{band}})",
      lockedNote:
        "Khảo sát thích ứng gồm 5 câu hỏi · Độ khó tự động điều chỉnh theo phản xạ của bạn",
      items: {
        hsk1_2: {
          level: "Sơ cấp · Beginner",
          title: "HSK 1 - 2",
          desc: "Khởi đầu ngữ âm, làm quen các câu chào hỏi và từ vựng căn bản.",
          vocab: "Vốn từ mục tiêu: 150 – 300 từ",
          time: "Thời gian học: 0 – 3 tháng",
          topics: ["Chào hỏi", "Mua sắm"],
          difficulty: "Nhẹ nhàng",
        },
        hsk3_4: {
          level: "Khuyên dùng phổ biến",
          title: "HSK 3 - 4",
          desc: "Đã học 6–12 tháng, có thể giao tiếp tự nhiên trong đời sống và du lịch.",
          vocab: "Vốn từ mục tiêu: 600 – 1.200 từ",
          time: "Thời gian học: 6 – 12 tháng",
          topics: ["Công việc", "Du lịch", "Sở thích"],
          difficulty: "Cân bằng",
        },
        hsk5_6: {
          level: "Cao cấp · Advanced",
          title: "HSK 5 - 6",
          desc: "Phản xạ nhanh, tranh luận và đàm phán chuyên sâu về kinh tế, văn hóa.",
          vocab: "Vốn từ mục tiêu: 2.500 – 5.000 từ",
          time: "Thời gian học: Trên 1.5 năm",
          topics: ["Thuyết trình", "Đàm phán"],
          difficulty: "Thử thách",
        },
      },
    },
    session: {
      title: "Phòng thi Khẩu ngữ",
      body: "Phiên thi đã được tạo và lưu an toàn. Màn hình phòng thi đàm thoại sẽ được hoàn thiện ở bước tiếp theo.",
      codeLabel: "Mã phiên thi",
      backCta: "Quay lại bước kiểm tra thiết bị",
    },
    room: {
      title: "Phòng luyện nói",
      subtitle: "Hội thoại thích ứng AI • HSK 3.0",
      connection: "Kết nối ổn định",
      configure: "Cấu hình AI",
      pause: "Tạm dừng bài thi",
      casual: "Giao tiếp (Casual Chat)",
      placement: "Bài test đầu vào (Placement Test)",
      progress: "Tiến độ: Câu {{current}} / {{total}}",
      aiLabel: "AI (Minh Minh)",
      replay: "Nghe lại",
      pinyinLabel: "Pinyin: {{pinyin}}",
      scriptHanzi: "Chữ Hán",
      scriptPinyin: "Pinyin",
      youLabel: "BẠN",
      statusWaiting: "Đang lắng nghe...",
      statusRecognized: "● Nhận diện rõ",
      statusSubmitted: "Đã nộp bài",
      statusNoAudio: "Chưa có âm thanh",
      transcriptPlaceholder: "Câu trả lời của bạn sẽ hiện ở đây...",
      analyzingSubline: "Đang tự động phân tích ngữ âm & ngữ pháp...",
      waitingSubline: "Hãy nói câu trả lời của bạn bằng tiếng Trung.",
      aiListening: "AI đang lắng nghe giọng nói của bạn...",
      aiAnalyzing: "AI đang phân tích câu trả lời của bạn...",
      aiNotHearing: "AI đang lắng nghe cẩn thận hơn...",
      timerRecording: "{{time}} / 00:45 • Thu âm phản xạ",
      timerWaiting: "{{time}} / 00:45 • Đang chờ âm thanh",
      submitCta: "Hoàn tất câu trả lời",
      skipCta: "Bỏ qua câu này (0 điểm) →",
      scoringSummary: "Đang tổng hợp điểm đánh giá...",
      retryBanner:
        "AI chưa nghe rõ câu trả lời. Vui lòng nói lại giúp mình nhé. (Lần {{attempt}} / {{max}})",
      noHearingBanner:
        "AI chưa nghe thấy giọng bạn nói. Vui lòng kiểm tra lại micrô hoặc tăng âm lượng phản xạ.",
      volumeHint: "Âm lượng hơi nhỏ. Hãy nói to hơn hoặc tăng âm lượng micrô.",
    },
    scoring: {
      title: "Đang chấm điểm",
      body: "Hệ thống đang phân tích 5 câu trả lời của bạn. Báo cáo kết quả sẽ được hoàn thiện ở bước tiếp theo.",
      backCta: "Quay lại phòng thi",
    },
  },
}
