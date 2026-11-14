import { createElement } from "react"
import {
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  MessageSquare,
  Target,
  UserRoundPlus,
} from "lucide-react"

const steps = [
  {
    icon: UserRoundPlus,
    title: "Đăng ký tài khoản miễn phí",
    description:
      "Điền thông tin cơ bản để tạo tài khoản và nhận ngay tài liệu hướng dẫn luyện phản xạ 3 ngôn ngữ.",
    note: "Chỉ mất 30 giây · Hoàn toàn miễn phí",
  },
  {
    icon: Target,
    title: "Chọn ngôn ngữ và mục tiêu luyện nói",
    description:
      "Lựa chọn Tiếng Anh, Tiếng Trung hoặc Tiếng Nhật cùng chủ đề bạn muốn rèn luyện: giao tiếp công sở, du học hay đàm thoại thường ngày.",
    note: "Tự do đổi mục tiêu bất kỳ lúc nào",
  },
  {
    icon: MessageSquare,
    title: "Chọn room cộng đồng hoặc công cụ AI",
    description:
      "Vào ngay phòng 1-1 ghép ngẫu nhiên cùng người học, tham gia phòng nhóm câu lạc bộ hoặc mở phòng luyện riêng với trợ lý AI.",
    note: "Linh hoạt theo tâm trạng & quỹ thời gian",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Thực hành và theo dõi tiến độ thực tế",
    description:
      "Bắt đầu cuộc trò chuyện có định hướng, xem gợi ý sửa lỗi từ vựng và ghi nhận số phút luyện nói tích lũy mỗi tuần.",
    note: "Theo dõi sự tiến bộ rõ rệt qua từng buổi",
  },
]

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="w-full scroll-mt-[72px] bg-[#f3f3f3] px-4 py-12 transition-colors dark:bg-[#171717] sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-[1280px]">
        <header className="mx-auto mb-8 max-w-[800px] text-center sm:mb-9">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#B3261E] dark:text-[#ff7a8a] sm:text-sm">
            Quy trình 4 bước đơn giản
          </p>
          <h2 className="mx-auto mt-3 text-[clamp(2rem,4vw,2.65rem)] font-black leading-[1.08] tracking-[-0.04em] text-[#171717] dark:text-white">
            Cách hoạt động của CAT SPEAK
          </h2>
          <p className="mx-auto mt-2 max-w-[760px] text-sm leading-6 text-[#666] dark:text-gray-300 sm:text-base">
            Hành trình được tối giản tối đa để bạn có thể bước vào một cuộc trò
            chuyện ngoại ngữ thực thụ mà không mất thời gian cài đặt phức tạp.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ icon, title, description, note }, index) => (
            <article
              key={title}
              className="flex min-h-[300px] flex-col rounded-2xl border border-[#dedede] bg-white p-5 shadow-sm transition-colors dark:border-[#3b3b3b] dark:bg-[#222] sm:p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f4f4] text-[#B3261E] dark:bg-[#303030] dark:text-[#ff7a8a]">
                  {createElement(icon, {
                    className: "h-5 w-5",
                    strokeWidth: 1.9,
                    "aria-hidden": true,
                  })}
                </span>
                <span className="text-xl font-black text-[#d5d5d5] dark:text-[#555]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="text-base font-bold leading-snug text-[#171717] dark:text-gray-100">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-xs leading-[1.7] text-[#555] dark:text-gray-300">
                {description}
              </p>
              <div className="mt-4 border-t border-[#ececec] pt-3 dark:border-[#3b3b3b]">
                <span className="inline rounded-md bg-[#fff1f1] px-2 py-1 text-[11px] font-semibold leading-5 text-[#A90016] dark:bg-[#3a2225] dark:text-[#ff9da7]">
                  {note}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#dedede] bg-white px-6 py-5 shadow-sm transition-colors dark:border-[#3b3b3b] dark:bg-[#222] sm:flex-row sm:items-center sm:px-7">
          <div>
            <h3 className="text-base font-bold text-[#171717] dark:text-gray-100 sm:text-lg">
              Sẵn sàng thử thách 15 phút nói ngoại ngữ đầu tiên?
            </h3>
            <p className="mt-1 text-sm text-[#666] dark:text-gray-300">
              Nhận thông báo và quyền vào phòng sớm nhất ngay khi hệ thống mở
              thêm máy chủ.
            </p>
          </div>
          <a
            href="#landing-contact"
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-[#A90016] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#890012]"
          >
            Đăng ký tham gia ngay
            {createElement(ArrowRight, {
              className: "h-4 w-4",
              "aria-hidden": true,
            })}
          </a>
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
