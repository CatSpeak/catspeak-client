/**
 * Nhắc dịch vụ kiểm duyệt nạp sẵn model khi có người dùng đang mở app.
 *
 * Model kiểm duyệt được nhả khỏi RAM sau 15 phút không ai dùng. Gọi warm lúc người dùng
 * mở app (và mỗi 10 phút khi tab còn hiện) để tin nhắn đầu tiên không phải chờ model
 * nạp lại. Chỉ là tối ưu độ trễ: gọi hỏng thì lần che ★ đầu tiên tự nạp model.
 */
export const WARM_EVERY_MS = 10 * 60 * 1000

/** Giao diện tiếng Trung thì xin thêm model tiếng Trung; còn lại chỉ model Vi/En. */
export function warmKindsFor(language) {
  return String(language || "").toLowerCase().startsWith("zh") ? ["text", "text-zh"] : ["text"]
}

export function shouldWarm(lastAt, now, everyMs = WARM_EVERY_MS) {
  return !lastAt || now - lastAt >= everyMs
}
