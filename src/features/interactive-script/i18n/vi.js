export default {
  vocabularyNotebook: {
    title: "Sổ từ vựng",
    subtitle: "Lưu trữ và ôn tập toàn bộ từ vựng đã lưu trong các buổi trò chuyện và script phòng học.",
    reviewNow: "Ôn tập ngay",
    wordCount: "{{count}} từ",
    
    filters: {
      searchPlaceholder: "Tìm kiếm từ vựng, ý nghĩa...",
      language: "Ngôn ngữ",
      script: "Kịch bản",
      sort: "Sắp xếp",
      all: "Tất cả",
      sortOptions: {
        newest: "Mới nhất",
        oldest: "Cũ nhất",
        az: "A → Z",
        za: "Z → A",
        length: "Độ dài từ"
      }
    },
    
    card: {
      noun: "Danh từ",
      verb: "Động từ",
      adj: "Tính từ",
      adv: "Trạng từ",
      teacherNote: "Ghi chú từ giáo viên",
      relatedWords: "Từ liên quan:",
      scriptLabel: "Script:",
      expand: "Chi tiết",
      collapse: "Thu gọn"
    },
    
    emptyState: {
      titleEmpty: "Sổ từ vựng của bạn đang trống",
      descEmpty: "Bạn chưa lưu từ vựng nào. Hãy quay lại các kịch bản tương tác và chọn \"Lưu từ\" để thêm vào sổ từ vựng của bạn.",
      exploreBtn: "Khám phá kịch bản",
      
      titleSearch: "Không tìm thấy kết quả",
      descSearch: "Không có từ vựng nào khớp với điều kiện tìm kiếm và bộ lọc của bạn.",
      clearBtn: "Xóa bộ lọc"
    },
    
    deleteModal: {
      title: "Xóa từ này khỏi sổ từ",
      message: "Từ \"{{word}}\" sẽ bị xóa khỏi danh sách học tập và lịch sử ôn tập của bạn.",
      cancel: "Hủy",
      confirm: "Xóa từ"
    },
    reviewModal: {
      title: "Ôn tập từ vựng",
      subtitle: "Lật thẻ để ghi nhớ từ vựng đã lưu.",
      progress: "Thẻ {{current}}/{{total}}",
      flipHint: "Nhấn để xem nghĩa",
      playAudio: "Nghe phát âm",
      flip: "Lật thẻ",
      shuffle: "Tráo thẻ",
      prev: "Thẻ trước",
      next: "Thẻ sau",
      mastered: "Đã nhớ",
      reviewAgain: "Cần ôn lại",
      masteredCount: "Đã nhớ",
      reviewAgainCount: "Cần ôn lại",
      completedTitle: "Hoàn thành phiên ôn tập!",
      reviewAgainBtn: "Ôn lại từ chưa nhớ",
      restartBtn: "Ôn tập lại từ đầu",
      closeBtn: "Đóng",
      empty: "Chưa có từ vựng nào để ôn tập."
    }
  },
  widget: {
    shuffleTopic: "Đổi chủ đề ngẫu nhiên",
    translateFull: "Dịch cả đoạn văn",
    hint: "Nhấn vào từ bất kỳ để xem nghĩa và lưu vào danh sách học tập cá nhân",
    translationPanel: {
      title: "Bản dịch tham khảo",
      featuredQuote: "Câu nói nổi bật",
      hideBtn: "Ẩn bản dịch",
      reportInaccurate: "Báo dịch chưa chuẩn",
      reportTitle: "Góp ý bản dịch chưa chuẩn:",
      reportSuccess: "Cảm ơn bạn đã đóng góp ý kiến!",
      reportPlaceholder: "Nhập góp ý bản dịch chính xác hơn...",
      cancel: "Hủy",
      submitReport: "Gửi góp ý",
      aiDisclaimer: "Bản dịch AI mang tính chất tham khảo",
      reasons: {
        wrongMeaning: "Dịch sai nghĩa",
        unnatural: "Bản dịch không tự nhiên",
        missingWords: "Thiếu hoặc thừa từ",
        other: "Lý do khác"
      }
    },
    langPairs: {
      "en-vi": "Anh → Việt",
      "en-zh": "Anh → Trung",
      "en-ja": "Anh → Nhật",
      "vi-en": "Việt → Anh",
    },
    lookup: {
      meaning: "Nghĩa",
      instructorNote: "Giải thích chi tiết (Giảng viên Cat Speak)",
      example: "Ví dụ",
      relatedWords: "Từ liên quan",
      saved: "Đã lưu vào sổ",
      save: "Thêm vào sổ từ",
      collapseExamples: "Thu gọn ví dụ",
      moreExamples: "Xem thêm ví dụ",
      langPlaceholder: "Anh → Việt",
      listenBtn: "Nghe phát âm",
      closeBtn: "Đóng popup",
      fetchingTitle: "Đang tra cứu \"{{word}}\"...",
      fetchingDesc: "Đang lấy giải nghĩa và phiên âm từ điển",
      contributeSuccess: "Góp ý đã được gửi!",
      contributeError: "Có lỗi xảy ra khi gửi góp ý.",
      saveSuccess: "Đã lưu từ vào Sổ từ vựng!",
      saveError: "Không thể lưu từ. Vui lòng thử lại."
    },
    notFound: {
      title: "Không tìm thấy định nghĩa cho từ này.",
      desc: "Hệ thống chưa có dữ liệu giải nghĩa cho từ đơn này trong từ điển hiện tại.",
      tryOther: "Thử ngôn ngữ khác:",
      contribute: "Đóng góp định nghĩa",
      openDict: "Tra cứu trên từ điển mở",
      contributeNew: "Đóng góp định nghĩa mới",
      type: "Loại đóng góp:",
      defaultType: "Định nghĩa thông thường",
      meaningYouKnow: "Nghĩa bạn biết:",
      meaningPlaceholder: "Nhập định nghĩa hoặc giải thích cho từ này...",
      cancel: "Hủy",
      submitting: "Đang gửi...",
      submit: "Gửi đóng góp",
      errorEmpty: "Vui lòng nhập định nghĩa của từ.",
      success: "Cảm ơn bạn đã đóng góp định nghĩa!",
      types: {
        definition: "Định nghĩa thông thường",
        context: "Thuật ngữ / Văn cảnh đặc biệt",
        example: "Ví dụ câu minh họa"
      }
    }
  }
};
