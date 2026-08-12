export default {
  refunds: {
    title: "Lịch sử hoàn tiền",
    subtitle: "Theo dõi trạng thái và yêu cầu hoàn tiền cho các giao dịch của bạn.",
    requestRefundTitle: "Yêu cầu hoàn tiền",
    requestRefundSubtitle: "Gửi yêu cầu hoàn tiền cho đơn hàng #{{orderCode}}",
    
    // Statuses
    statusPending: "Chờ xử lý",
    statusApproved: "Đã duyệt",
    statusRejected: "Từ chối",
    statusFailed: "Thất bại",
    
    // Modal steps
    checkingEligibility: "Đang kiểm tra điều kiện hoàn tiền...",
    ineligibleTitle: "Không đủ điều kiện hoàn tiền",
    eligibleTitle: "Đủ điều kiện hoàn tiền",
    maxRefundAmount: "Số tiền hoàn tối đa",
    paymentType: "Loại giao dịch",

    // Form fields
    selectBank: "Chọn ngân hàng nhận tiền",
    searchBankPlaceholder: "Tìm kiếm ngân hàng...",
    accountNumber: "Số tài khoản",
    accountNumberPlaceholder: "Nhập số tài khoản...",
    accountHolderName: "Tên chủ tài khoản",
    accountHolderPlaceholder: "Nhập tên chủ tài khoản (viết hoa)...",
    reasonLabel: "Lý do hoàn tiền",
    reasonPlaceholder: "Vui lòng nhập lý do bạn muốn hoàn tiền...",

    // Actions & Buttons
    btnCheckEligibility: "Kiểm tra điều kiện",
    btnSubmitRequest: "Gửi yêu cầu hoàn tiền",
    btnCancel: "Hủy",
    btnBack: "Quay lại",
    btnDone: "Hoàn tất",
    btnRequestRefund: "Yêu cầu hoàn tiền",
    btnRefresh: "Làm mới",

    // Errors & Success
    checkEligibilityError: "Không thể kiểm tra điều kiện hoàn tiền. Vui lòng thử lại sau.",
    defaultIneligibleReason: "Giao dịch đã quá hạn áp dụng chính sách hoàn tiền.",
    btnRetry: "Thử lại",
    btnChangeBank: "Thay đổi",
    loadingBanks: "Đang tải danh sách ngân hàng...",
    noBanksFound: "Không tìm thấy ngân hàng.",

    errorNoBank: "Vui lòng chọn ngân hàng.",
    errorNoAccount: "Vui lòng nhập số tài khoản.",
    errorNoHolder: "Vui lòng nhập tên chủ tài khoản.",
    errorNoReason: "Vui lòng nhập lý do hoàn tiền.",
    errorSubmitFailed: "Gửi yêu cầu hoàn tiền thất bại. Vui lòng thử lại.",
    
    successTitle: "Yêu cầu hoàn tiền đã gửi thành công!",
    successSubtitle: "Yêu cầu của bạn đang chờ Admin phê duyệt. Bạn có thể theo dõi tiến độ trong Lịch sử hoàn tiền.",

    // Table / History page
    noHistoryTitle: "Chưa có yêu cầu hoàn tiền nào",
    noHistorySubtitle: "Khi bạn gửi yêu cầu hoàn tiền cho đơn hàng, các thông tin sẽ xuất hiện ở đây.",
    searchPlaceholder: "Nhập mã đơn hàng hoặc ID...",
    filterStatusAll: "Tất cả trạng thái",

    columns: {
      date: "Ngày tạo",
      paymentId: "Mã giao dịch",
      amount: "Số tiền hoàn",
      status: "Trạng thái",
      reason: "Lý do",
      bankInfo: "Ngân hàng nhận",
    },
  },
}
