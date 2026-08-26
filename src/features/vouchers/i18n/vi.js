export const vi = {
  vouchers: {
    pageTitle: "Quản lý Ưu đãi & Voucher",
    pageSubtitle: "Tạo và quản lý các chương trình ưu đãi, mã giảm giá cho các khóa học và lớp học của bạn.",
    createNew: "Tạo Voucher mới",
    searchPlaceholder: "Tìm theo mã voucher hoặc tiêu đề...",
    allDiscountTypes: "Tất cả loại giảm",
    percentDiscount: "Giảm theo %",
    fixedDiscount: "Giảm số tiền cố định",
    emptyTitle: "Chưa có voucher nào",
    emptySubtitle: "Bạn chưa tạo mã voucher nào phù hợp với bộ lọc hiện tại.",
    emptyAction: "Tạo voucher đầu tiên",

    // KPI Cards
    stats: {
      total: "Tổng voucher",
      active: "Đang hoạt động",
      draft: "Bản nháp",
      pending: "Chờ duyệt / Chờ cọc",
      inactive: "Hết hạn / Đã dừng",
    },

    // Filter Tabs
    tabs: {
      all: "Tất cả",
      active: "Đang hoạt động",
      draft: "Bản nháp",
      pendingApproval: "Chờ duyệt cọc",
      pendingDeposit: "Chờ nạp cọc",
      expired: "Hết hạn / Đã dừng",
    },

    // Table Headers
    table: {
      code: "Mã voucher",
      discountType: "Loại giảm",
      discount: "Giá trị",
      validity: "Hiệu lực",
      usage: "Đã dùng",
      status: "Trạng thái",
      actions: "Thao tác",
      from: "Từ",
      to: "Đến",
      neverExpired: "Không giới hạn",
    },

    // Statuses
    status: {
      Draft: "Bản nháp",
      Active: "Đang hoạt động",
      Disabled: "Đã vô hiệu hóa",
      Expired: "Đã hết hạn",
      Exhausted: "Hết lượt dùng",
      PendingDeposit: "Chờ nạp cọc",
      PendingApproval: "Chờ duyệt",
      Rejected: "Bị từ chối",
      Stopped: "Đã dừng",
      expiringSoon: "Sắp hết hạn",
    },

    // Scopes
    scope: {
      All: "Cat Speak",
      SpecificCourses: "Khóa học",
      SpecificClasses: "Lớp học",
    },

    // Voucher Card & Section
    card: {
      appliedTitle: "Ưu đãi đang áp dụng",
      noAppliedVouchers: "Chưa có ưu đãi nào đang áp dụng cho lớp học này.",
      viewAll: "Xem tất cả",
      discount: "Giảm",
      exp: "HSD",
      neverExpired: "Vô thời hạn",
      remainingUsages: "Còn {{remaining}}/{{limit}} lượt",
      unlimitedUsages: "Không giới hạn lượt",
    },

    // Actions
    actions: {
      viewDetails: "Xem chi tiết",
      viewUsages: "Lịch sử sử dụng",
      edit: "Chỉnh sửa bản nháp",
      copyCode: "Sao chép mã",
      copied: "Đã sao chép mã voucher!",
    },

    // Modal Create / Edit
    form: {
      createTitle: "Tạo Voucher Giảng viên",
      editTitle: "Chỉnh sửa Voucher Bản nháp",
      step1: "1. Thông tin chung",
      step2: "2. Mức giảm giá",
      step3: "3. Phạm vi & Giới hạn",
      step4: "4. Dự toán Tiền cọc",
      codeLabel: "Mã Voucher",
      codePlaceholder: "VD: GV-GIAM20K",
      autoGenerate: "Tạo mã tự động",
      titleLabel: "Tên chương trình ưu đãi",
      titlePlaceholder: "VD: Giảm 20% Lớp Tiếng Anh Giao Tiếp K12",
      descLabel: "Mô tả ưu đãi",
      descPlaceholder: "Mô tả điều kiện hoặc lời nhắn gửi đến học viên...",
      discountTypeLabel: "Hình thức giảm giá",
      discountValueLabel: "Mức giảm",
      maxDiscountAmountLabel: "Mức giảm tối đa (VNĐ)",
      minOrderAmountLabel: "Giá trị đơn hàng tối thiểu (VNĐ)",
      scopeLabel: "Phạm vi áp dụng",
      scopeAll: "Tất cả khóa/lớp của tôi",
      scopeCourses: "Khóa học cụ thể",
      scopeClasses: "Lớp học cụ thể",
      selectCourses: "Chọn khóa học áp dụng",
      selectClasses: "Chọn lớp học áp dụng",
      validFromLabel: "Hiệu lực từ ngày",
      validToLabel: "Hiệu lực đến ngày",
      neverExpired: "Không giới hạn thời gian hết hạn",
      totalUsageLimitLabel: "Tổng lượt sử dụng tối đa",
      totalUsageHint: "Giáo viên bắt buộc nhập số lượt để hệ thống tính tiền cọc.",
      perUserLimitLabel: "Lượt dùng tối đa mỗi học viên",
      dailyLimitLabel: "Giới hạn lượt dùng mỗi ngày",
      onlyNewUser: "Chỉ áp dụng cho học viên mới",
      notCombineOther: "Không áp dụng đồng thời với ưu đãi khác",
      depositEstimateTitle: "Dự toán Đặt cọc Bảo chứng (Escrow)",
      depositRequired: "Tiền cọc yêu cầu",
      depositFormula: "Công thức: min(Giảm tối đa × Tổng lượt, Ngân sách tối đa)",
      depositNote: "Số tiền này sẽ được giữ tạm thời để bảo chứng cho các lượt giảm giá của học viên. Số dư chưa sử dụng sẽ được hoàn lại sau khi chương trình kết thúc.",
      saveDraft: "Lưu bản nháp",
      submitCreate: "Tạo và Kích hoạt",
      submitUpdate: "Cập nhật Voucher",
      prevStep: "Quay lại",
      nextStep: "Tiếp tục",
    },

    // Detail Modal
    detail: {
      title: "Chi tiết Voucher",
      overview: "Tổng quan cấu hình",
      depositInfo: "Thông tin Cọc & Đối soát",
      depositPaid: "Đã nộp cọc",
      depositUsed: "Đã sử dụng",
      depositRemaining: "Còn lại",
      estimatedRefund: "Dự kiến hoàn trả",
      appliedTargets: "Danh sách lớp / khóa áp dụng",
      performance: "Hiệu suất chương trình",
      successOrders: "Đơn hàng thành công",
      totalDiscountGiven: "Tổng tiền đã giảm",
      close: "Đóng",
    },

    // Usages Modal
    usages: {
      title: "Lịch sử sử dụng Voucher",
      searchPlaceholder: "Tìm kiếm theo tên hoặc email học viên...",
      student: "Học viên",
      classTarget: "Lớp học",
      discountApplied: "Số tiền giảm",
      usedAt: "Thời gian sử dụng",
      orderStatus: "Trạng thái đơn",
      empty: "Chưa có học viên nào sử dụng voucher này.",
    },
  },
}
