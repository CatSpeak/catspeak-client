import { moderationApi } from "@/store/api/moderationApi"

/**
 * Che ★ nội dung người dùng gõ, TRƯỚC khi gửi lên server.
 *
 * Vì sao việc này nằm ở client: chat 1-1, bài post, bình luận post và thư (stories)
 * đều đi tới `Catspeak Social API` — một microservice riêng, không nằm trong ba repo
 * mà nhóm AI đụng tới được. Không có chỗ nào phía server để chen kiểm duyệt vào.
 *
 * GIỚI HẠN, cần đọc trước khi tin vào lớp này: đây là lớp HIỂN THỊ, không phải lớp
 * thực thi. Ai gọi thẳng Social API bằng curl thì đi vòng qua được hết. Muốn chặn
 * thật thì Social API phải tự gọi dịch vụ kiểm duyệt như ReelService bên catspeak-api
 * đang làm. Lớp này chỉ để nội dung tục không hiện ra trước mắt người dùng khác trong
 * lúc chờ việc đó.
 *
 * Fail-open: API kiểm duyệt lỗi, chậm, hay chưa đăng nhập thì gửi nguyên văn. Không
 * ai bị chặn gửi tin vì một dịch vụ phụ trợ hỏng.
 */

// Chỉ che các trường do người dùng gõ. Không đụng tới id, url, enum, ngày tháng...
const TEXT_KEYS = [
  "content",
  "message",
  "messagecontent",
  "text",
  "caption",
  "title",
  "description",
]

const isTextKey = (k) => TEXT_KEYS.includes(String(k).toLowerCase())

async function maskOne(api, text) {
  if (typeof text !== "string" || !text.trim()) return text
  try {
    const res = await api
      .dispatch(
        // track: false — đây là lời gọi phụ trợ, không cần nằm lại trong cache
        moderationApi.endpoints.maskText.initiate({ text }, { track: false }),
      )
      .unwrap()
    // Backend bọc phản hồi trong ApiResponse ({ data: {...} }); đọc cả hai dạng.
    return res?.data?.masked ?? res?.masked ?? text
  } catch {
    return text
  }
}

/**
 * Trả về body đã che ★. Nhận cả JSON lẫn FormData.
 * FormData bị sửa tại chỗ (không clone được kèm File), object thì trả bản sao.
 */
export async function maskBody(api, body) {
  if (!body) return body

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    // Lấy danh sách key ra mảng trước: set() trong lúc đang duyệt iterator của
    // FormData là hành vi không được bảo đảm giữa các trình duyệt.
    for (const key of [...body.keys()]) {
      if (!isTextKey(key)) continue
      const value = body.get(key)
      if (typeof value !== "string") continue
      const masked = await maskOne(api, value)
      if (masked !== value) body.set(key, masked)
    }
    return body
  }

  if (typeof body === "object") {
    const out = { ...body }
    for (const key of Object.keys(out)) {
      if (isTextKey(key)) out[key] = await maskOne(api, out[key])
    }
    return out
  }

  return body
}
