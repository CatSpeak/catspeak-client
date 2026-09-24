/**
 * Trạng thái kiểm duyệt của reel (catspeak-api, ReelModerationStatus).
 *
 * Reel mới đăng ở "Moderating" trong lúc video được kiểm tra. Sạch thì sang "Public";
 * vi phạm thì video bị cách ly và reel sang "PendingReview" chờ admin; admin từ chối
 * thì "Rejected". Ở ba trạng thái này API trả videoUrl rỗng và chỉ chủ reel thấy reel.
 */
export const REEL_HIDDEN_STATUSES = Object.freeze(["Moderating", "PendingReview", "Rejected"])

export const isReelHidden = (status) => REEL_HIDDEN_STATUSES.includes(status)

/** Trạng thái trong phản hồi tạo reel; API có thể bọc trong { data }. */
export const reelStatusOf = (response) => response?.data?.status ?? response?.status ?? null

const TONES = Object.freeze({
  Moderating: "amber",
  PendingReview: "orange",
  Rejected: "red",
  Blocked: "red",
})

/** Nhãn hiển thị cho chủ reel; reel công khai bình thường thì không cần nhãn. */
export const reelStatusTone = (status) => TONES[status] ?? null
