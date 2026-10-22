import mascotStep1 from "../assets/mascot/mascot_step1_welcome.png"
import mascotStep2 from "../assets/mascot/mascot_step2_community.png"
import mascotStep3 from "../assets/mascot/mascot_step3_display_lang.png"
import mascotStep4 from "../assets/mascot/mascot_step4_actions.png"
import mascotStep5 from "../assets/mascot/mascot_step5_rooms.png"
import mascotStep6 from "../assets/mascot/mascot_step6_search.png"
import mascotStep7 from "../assets/mascot/mascot_step7_sidebar.png"
import mascotStep8 from "../assets/mascot/mascot_step8_ready.png"

export const TOTAL_TOUR_STEPS = 8

export const TOUR_STEPS = [
  {
    stepIndex: 1,
    id: "welcome",
    isModal: true,
    targetSelector: null,
    mascot: mascotStep1,
    mascotAlt: "CatSpeak Mascot chào mừng",
    titlePrefix: "Chào mừng bạn đến với ",
    titleHighlight: "Cat Speak",
    titleSuffix: " 👋",
    description:
      "CatSpeak là nơi bạn có thể tham gia cộng đồng, kết nối và thực hành ngôn ngữ cùng những người có chung sở thích và mục tiêu học tập. Hãy cùng khám phá nhanh nhé!",
    primaryText: "Bắt đầu",
    secondaryText: "Bỏ qua",
  },
  {
    stepIndex: 2,
    id: "community-switcher",
    isModal: false,
    targetSelector: '[data-tour="community-switcher"]',
    preferredPosition: "bottom-left",
    mascot: mascotStep2,
    mascotAlt: "CatSpeak Mascot chọn cộng đồng",
    titlePrefix: "Chuyển đổi ",
    titleHighlight: "Cộng đồng ngôn ngữ",
    titleSuffix: "",
    description:
      "CatSpeak đã chọn sẵn một cộng đồng cho bạn. Bạn có thể chuyển sang cộng đồng ngôn ngữ khác tại đây để khám phá các phòng và hoạt động của cộng đồng đó.",
    primaryText: "Tiếp theo",
    secondaryText: "Quay lại",
  },
  {
    stepIndex: 3,
    id: "language-switcher",
    isModal: false,
    targetSelector: '[data-tour="language-switcher"]',
    preferredPosition: "bottom-right",
    mascot: mascotStep3,
    mascotAlt: "CatSpeak Mascot chọn ngôn ngữ hiển thị",
    titlePrefix: "Chọn ",
    titleHighlight: "ngôn ngữ hiển thị",
    titleSuffix: "",
    description:
      "Thay đổi ngôn ngữ giao diện CatSpeak theo cách bạn muốn mà không làm thay đổi Cộng đồng ngôn ngữ đang tham gia. Nội dung do thành viên tự đăng tải vẫn được giữ nguyên ngôn ngữ gốc.",
    primaryText: "Tiếp theo",
    secondaryText: "Quay lại",
  },
  {
    stepIndex: 4,
    id: "session-action-buttons",
    isModal: false,
    targetSelector: '[data-tour="session-action-buttons"]',
    preferredPosition: "bottom-center",
    mascot: mascotStep4,
    mascotAlt: "CatSpeak Mascot kết nối và luyện giao tiếp",
    titlePrefix: "Bắt đầu ",
    titleHighlight: "kết nối và luyện giao tiếp",
    titleSuffix: "",
    description:
      "Chọn Kết nối 1:1 để trò chuyện cùng một người, Kết nối 2:5 để được ghép vào nhóm từ 2–5 người, hoặc Tạo phòng để chủ động tạo không gian trò chuyện của riêng bạn.",
    primaryText: "Tiếp theo",
    secondaryText: "Quay lại",
  },
  {
    stepIndex: 5,
    id: "rooms-category-section",
    isModal: false,
    targetSelector: '[data-tour="rooms-category-section"]',
    preferredPosition: "top-center",
    mascot: mascotStep5,
    mascotAlt: "CatSpeak Mascot khám phá phòng phù hợp",
    titlePrefix: "Khám phá các phòng ",
    titleHighlight: "phù hợp với bạn",
    titleSuffix: "",
    description:
      "Các phòng được sắp xếp theo nhiều chủ đề. Bạn có thể xem trình độ, chủ đề, số người tham gia và thời lượng để lựa chọn phòng phù hợp.",
    primaryText: "Tiếp theo",
    secondaryText: "Quay lại",
  },
  {
    stepIndex: 6,
    id: "header-search-filter",
    isModal: false,
    targetSelector: '[data-tour="header-search-filter"]',
    preferredPosition: "bottom-center",
    mascot: mascotStep6,
    mascotAlt: "CatSpeak Mascot tìm phòng nhanh hơn",
    titlePrefix: "Tìm phòng ",
    titleHighlight: "nhanh hơn",
    titleSuffix: "",
    description:
      "Tìm kiếm phòng bạn quan tâm hoặc sử dụng bộ lọc để thu hẹp kết quả theo Trình độ và Chủ đề.",
    primaryText: "Tiếp theo",
    secondaryText: "Quay lại",
  },
  {
    stepIndex: 7,
    id: "main-sidebar",
    isModal: false,
    targetSelector: '[data-tour="main-sidebar"]',
    preferredPosition: "right-center",
    mascot: mascotStep7,
    mascotAlt: "CatSpeak Mascot khám phá thanh điều hướng",
    titlePrefix: "Còn nhiều điều để ",
    titleHighlight: "khám phá",
    titleSuffix: "",
    description:
      "Ngoài Room, bạn còn có thể khám phá nội dung tại Cat Speak, quản lý hoạt động trong Nhà của bạn, tìm Khóa học hoặc sử dụng Tài nguyên học tập để hỗ trợ hành trình học ngôn ngữ.",
    primaryText: "Tiếp theo",
    secondaryText: "Quay lại",
  },
  {
    stepIndex: 8,
    id: "completion",
    isModal: true,
    targetSelector: null,
    mascot: mascotStep8,
    mascotAlt: "CatSpeak Mascot bạn đã sẵn sàng",
    titlePrefix: "Bạn đã sẵn sàng ",
    titleHighlight: "",
    titleSuffix: "🚀",
    description:
      "Hãy bắt đầu khám phá một phòng, kết nối với thành viên khác hoặc tự tạo không gian trò chuyện phù hợp với bạn.",
    primaryText: "Bắt đầu",
    secondaryText: "Bỏ qua",
  },
]
