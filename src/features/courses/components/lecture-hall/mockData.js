export const MOCK_SECTIONS = [
  {
    id: "sec-1",
    title: "Thông báo môn học",
    subtitle: "Nơi các thông tin về lớp học được thông báo",
    isHidden: false,
    items: [
      {
        id: "item-1-1",
        type: "announcement",
        title: "Thông báo môn học",
        meta: "Bài viết mới nhất: 20/07/2026",
        metaType: "clock",
        isHidden: false,
      },
    ],
  },
  {
    id: "sec-2",
    title: "Module 1 - Introduction",
    subtitle: "Giới thiệu tổng quan về khóa học và các kỹ năng cơ bản.",
    isHidden: false,
    items: [
      {
        id: "item-2-1",
        type: "assignment",
        title: "Assignment 01 - Basic Grammar",
        meta: "Ngày mở: 24/07/2026 9:30 - Hạn nộp: 31/07/2026 23:59",
        metaType: "clock",
        isHidden: false,
      },
      {
        id: "item-2-2",
        type: "announcement",
        title: "Thông báo lịch học tuần này",
        meta: "Bài viết mới nhất: 20/07/2026",
        metaType: "clock",
        isHidden: false,
      },
      {
        id: "item-2-3",
        type: "material",
        title: "Slide bài giảng - Buổi 1",
        meta: "PDF • 2.4 MB",
        metaType: "file",
        isHidden: false,
      },
      {
        id: "item-2-4",
        type: "link",
        title: "Video bổ trợ: Introduction & Greetings",
        meta: "",
        metaType: "none",
        isHidden: true,
      },
    ],
  },
  {
    id: "sec-3",
    title: "Module 2 - Practice",
    subtitle: "Luyện tập các kỹ năng nghe nói qua các tình huống thực tế.",
    isHidden: true,
    items: [
      {
        id: "item-3-1",
        type: "assignment",
        title: "Bài tập thực hành: Roleplay",
        meta: "Chưa thiết lập thời gian",
        metaType: "clock",
        isHidden: true,
      },
    ],
  },
]

export const MOCK_LESSON_ITEM = {
  id: "item-1",
  type: "assignment",
  title: "Assignment 01 - Basic Grammar",
  meta: "Ngày mở: 24/07/2026 9:30 - Hạn nộp: 31/07/2026 23:59",
  metaType: "clock",
  isHidden: false,
}

export const MOCK_CHAPTER = {
  id: "sec-2",
  title: "Module 2 - Practice",
  subtitle: "Luyện tập các kỹ năng nghe nói qua các tình huống thực tế.",
  isHidden: true,
  items: [
    {
      id: "item-3-1",
      type: "assignment",
      title: "Bài tập thực hành: Roleplay",
      meta: "Chưa thiết lập thời gian",
      metaType: "clock",
      isHidden: true,
    },
  ],
}

export const MOCK_ACTIVITIES = [
  {
    id: "act-1",
    type: "submission",
    typeLabel: "Bài nộp",
    status: "published",
    statusLabel: "Đã phát hành",
    title: "Bài tập cá nhân 1: Phân tích ngữ pháp cơ bản",
    dueDate: "24 Th10, 23:59",
  },
  {
    id: "act-2",
    type: "quiz",
    typeLabel: "Bài kiểm tra",
    status: "published",
    statusLabel: "Đã phát hành",
    title: "Quiz 1: Từ vựng Unit 1",
    dueDate: "26 Th10, 23:59",
  },
  {
    id: "act-3",
    type: "submission",
    typeLabel: "Bài nộp",
    status: "draft",
    statusLabel: "Bản nháp",
    title: "Bài tập nhóm: Roleplay tình huống",
    dueDate: "Chưa thiết lập",
  },
  {
    id: "act-4",
    type: "forum",
    typeLabel: "Thảo luận",
    status: "published",
    statusLabel: "Đã phát hành",
    title: "Forum: Chia sẻ phương pháp học từ vựng hiệu quả",
    dueDate: "30 Th10, 12:00",
  },
]
