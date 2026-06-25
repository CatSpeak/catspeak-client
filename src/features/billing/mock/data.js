export const PLANS = {
  free: {
    id: "free",
    name: "Gói Miễn Phí",
    price: 0,
    interval: "tháng",
    description: "Hoàn hảo để bắt đầu khám phá CatSpeak.",
    features: [
      "Truy cập các phòng công khai cơ bản",
      "Chất lượng video tiêu chuẩn",
      "Kết bạn tối đa 5 người",
      "Có chứa quảng cáo",
    ],
  },
  pro: {
    id: "pro",
    name: "Gói Pro",
    price: 250000,
    interval: "tháng",
    description: "Mở khóa toàn bộ trải nghiệm CatSpeak.",
    features: [
      "Tạo phòng riêng tư",
      "Chất lượng video HD",
      "Kết bạn không giới hạn",
      "Trải nghiệm không quảng cáo",
      "Huy hiệu hồ sơ tùy chỉnh",
      "Hỗ trợ ưu tiên",
    ],
  },
}

export const INITIAL_USER_PLAN = "free"

export const INITIAL_INVOICES = [
  {
    id: "inv_1A2B3C",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    planName: "Free Plan",
    amount: 0,
    status: "paid",
  },
]
