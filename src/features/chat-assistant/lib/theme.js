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
