/**
 * Màu của widget trợ lý.
 *
 * Lấy từ tailwind.config.js: `primary` là #72000d, thang `cath-red` chạy tới
 * #e7001a, `cath-orange` là #f08d1d. Widget dùng #990011 — cùng con số mà footer
 * và landing page đang dùng cho nút và tiêu đề, nên đặt cạnh nhau thì khớp.
 *
 * Vì sao là hằng số JS chứ không phải lớp Tailwind: các sắc đỏ này nằm trong thang
 * `cath-red` với chỉ số phi tiêu chuẩn (900, 1000, 1050) mà không có biến thể
 * `hover:` hay `border-` được sinh sẵn cho mọi trường hợp cần ở đây. Viết
 * `style={{ background: BRAND.red }}` thì chắc chắn ra đúng màu, không phụ thuộc
 * vào việc Tailwind có quét thấy chuỗi lớp hay không.
 */
export const BRAND = {
  red: "#990011",
  redDark: "#72000d",
  /** Nền nhạt cho trạng thái đã chọn. Đỏ 8% trên nền trắng. */
  redSoft: "rgba(153, 0, 17, 0.08)",
  orange: "#f08d1d",
  yellow: "#FFE66D",
}

/**
 * Màu của thẻ nguồn, tra theo chủ đề của tài liệu.
 *
 * Chủ đề do CHÍNH TÀI LIỆU khai: trường `topic` trong frontmatter của
 * catspeak-ai/knowledge/**.md. Nó đi thẳng vào cột `meta` (jsonb) của
 * ai.rag_documents lúc nạp, rồi theo mỗi nguồn về đây — không cần thêm cột, không
 * cần migration. Tài liệu mới chỉ việc điền một dòng `topic:`.
 *
 * Bảng màu thì nằm ở đây chứ không nằm trong tài liệu. Tài liệu nói nó viết về
 * CHUYỆN GÌ; còn chuyện gì thì ra màu nào là việc của giao diện. Tách như vậy thì
 * đổi cả bảng màu là sửa đúng tệp này, không phải nạp lại 15 tài liệu.
 *
 * Mỗi chủ đề có hai sắc: `light` đủ đậm để đọc trên nền trắng, `dark` đủ sáng để
 * đọc trên nền tối. Một màu duy nhất cho cả hai nền thì luôn có một bên bị chìm —
 * chữ 11px không có chỗ để nhòe.
 */
const TOPIC_COLORS = {
  /** Gói, nâng cấp, so sánh Premium. Đây là chỗ người dùng ra quyết định. */
  plans: { light: "#b45309", dark: "#fcd34d" },
  /** Thanh toán, hoá đơn, hoàn tiền. */
  billing: { light: "#c2410c", dark: "#fdba74" },
  /** Hướng dẫn thao tác từng bước. */
  guide: { light: "#15803d", dark: "#86efac" },
  /** Tài khoản, đăng nhập, bảo mật. */
  account: { light: "#6d28d9", dark: "#c4b5fd" },
  /** Kiểm duyệt, vi phạm, hình phạt. */
  moderation: { light: "#be123c", dark: "#fda4af" },
  /** Nội quy cộng đồng. */
  community: { light: "#0f766e", dark: "#5eead4" },
  /** Điều khoản, quyền riêng tư. Xám: đọc được nhưng không tranh chỗ. */
  legal: { light: "#475569", dark: "#cbd5e1" },
  /** Liên hệ, câu hỏi thường gặp, và mọi thứ chưa gắn nhãn. */
  support: { light: "#1d4ed8", dark: "#93c5fd" },
}

/** Xanh biển. Dùng cho tài liệu chưa khai `topic`, và là màu của liên kết nói chung. */
export const LINK_COLOR = TOPIC_COLORS.support

/** Không có `topic`, hoặc `topic` lạ, thì về xanh biển — không bao giờ trả undefined. */
export function topicColor(topic) {
  return TOPIC_COLORS[String(topic || "").toLowerCase()] || LINK_COLOR
}
