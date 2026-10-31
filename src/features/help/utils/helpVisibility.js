// Các route ẩn widget trợ giúp toàn cục (nút "?" nổi góc phải-dưới):
// phòng học trực tuyến, chat và phòng thi đánh giá trình độ — nơi nút "?" đè lên
// khối nút điều khiển cuối khung.
const HELP_HIDDEN_PATHS = [
  "/meet",
  "/room",
  "/chat",
  // Phòng thi đánh giá trình độ: "?" đè lên nút "Hoàn tất câu trả lời" ở góc phải-dưới.
  "/level-assessment/session",
]

export const isHelpHidden = (pathname = "") =>
  HELP_HIDDEN_PATHS.some((path) => pathname.includes(path))
