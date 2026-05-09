export default {
  title: "Bản ghi hình",
  refresh: "Làm mới",
  storage: {
    title: "Dung lượng",
    used: "{{used}} / {{limit}} MB",
    percentUsed: "Đã dùng {{percent}}%",
    limit_used: "trong số {{limit}} đã dùng",
    quotaExceeded: "Đã hết dung lượng — xoá bớt bản ghi để giải phóng không gian",
  },
  errors: {
    noRoom: "Không có phòng đang hoạt động — không thể ghi hình.",
    noEgress: "Đã bắt đầu ghi hình nhưng không nhận được ID nguồn ra — việc dừng có thể không hoạt động.",
    noMedia: "Vui lòng bật camera, micrô hoặc chia sẻ màn hình trước khi ghi hình.",
  },
  list: {
    emptyTitle: "Chưa có bản ghi nào",
    emptyDescription: "Khi bạn ghi hình cuộc gọi, chúng sẽ xuất hiện ở đây.",
    count_one: "1 bản ghi",
    count_other: "{{count}} bản ghi",
    fileUnavailable: "Không có file — bản ghi có thể đang được xử lý",
    error: "Không thể tải danh sách bản ghi.",
    retry: "Thử lại"
  },
  status: {
    completed: "hoàn thành",
    failed: "thất bại"
  },
  player: {
    title: "Bản ghi hình",
    videoNotAvailable: "Không có video.",
    urlExpiry: "Liên kết hết hạn sau 60 phút",
    meetingIdFallback: "Bản ghi #{{id}}"
  },
  deleteModal: {
    title: "Xóa bản ghi?",
    description: "Hành động này sẽ xóa vĩnh viễn bản ghi",
    cannotUndo: "Hành động này không thể hoàn tác.",
    cancel: "Hủy",
    confirm: "Xóa",
    deleting: "Đang xóa…"
  },
  actions: {
    play: "Phát bản ghi",
    playUnavailable: "Không có file",
    download: "Tải xuống bản ghi",
    downloadUnavailable: "Không có file",
    delete: "Xóa bản ghi",
    startSuccess: "Đã bắt đầu ghi hình",
    stopSuccess: "Đã dừng ghi hình — đang tải lên…",
    deleteSuccess: "Đã xóa bản ghi",
    deleteFailed: "Không thể xóa bản ghi.",
    viewRecordings: "Xem bản ghi"
  }
}
