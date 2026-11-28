import { Bot, CircleCheck, SlidersHorizontal, UsersRound } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const solutions = [
  {
    icon: UsersRound,
    badge: "Cộng đồng tương tác",
    title: "Kết nối người học cùng tần số",
    description:
      "Hệ thống tự động ghép đôi và xếp phòng dựa trên cấp độ hiện tại và chủ đề bạn quan tâm (công việc, du lịch, thi cử), giúp buổi nói chuyện có chung điểm chạm ngay từ phút đầu tiên.",
    benefits: [
      "Gợi ý câu hỏi mở đầu (Icebreakers)",
      "Thời gian chia đều cho hai bên",
      "Đánh giá lịch sử sau buổi nói",
    ],
  },
  {
    icon: Bot,
    badge: "Công nghệ AI đồng hành",
    title: "Luyện tập không áp lực cùng AI",
    description:
      "Khi bạn muốn khởi động trước, hay đơn giản là cần một không gian riêng tư vào ban đêm, trợ lý AI luôn sẵn sàng trò chuyện bằng giao tiếp tự nhiên, lắng nghe kiên nhẫn và phản hồi thông minh.",
    benefits: [
      "Trò chuyện 24/7 không cần hẹn giờ",
      "Gợi ý từ vựng thay thế tức thì",
      "Không sợ sai ngữ pháp hay phát âm",
    ],
  },
  {
    icon: SlidersHorizontal,
    badge: "Linh hoạt theo nhu cầu",
    title: "Chủ động thời gian và mục tiêu",
    description:
      "Bạn không phải theo đuổi thời khóa biểu cố định của các trung tâm. Bật CAT SPEAK lên bất cứ lúc nào, có 15–30 phút rảnh để luyện phản xạ nói.",
    benefits: [
      "Phòng nói nhanh 15 phút hằng ngày",
      "Tùy chọn luyện Tiếng Anh, Trung hoặc Nhật",
      "Theo dõi số giờ nói thực tế tích lũy",
    ],
  },
]

const SolutionSection = () => {
  const { t } = useLanguage()
  const solutionText = t?.landing?.solution || {}
  const localizedSolutions = solutions.map((item, index) => ({
    ...item,
    ...(solutionText.items?.[index] || {}),
    icon: item.icon,
  }))

  return (
  <section
    id="catspeak-solutions"
    className="w-full scroll-mt-[72px] bg-[#f3f3f3] px-4 py-12 transition-colors dark:bg-[#171717] sm:px-6 sm:py-16 lg:px-8"
  >
    <div className="mx-auto max-w-[1080px]">
      <header className="mx-auto mb-8 max-w-[760px] text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#B3261E] dark:text-[#ff7a8a]">
          {solutionText.eyebrow || "Giải pháp từ CAT SPEAK"}
        </p>
        <h2 className="mx-auto mt-3 max-w-[700px] text-[clamp(2rem,4vw,2.65rem)] font-black leading-[1.08] tracking-[-0.04em] text-[#171717] dark:text-white">
          {solutionText.title || "Biến việc học thành những"}
          <br className="hidden sm:block" />{" "}
          {solutionText.titleLine2 || "cuộc trò chuyện thực tế"}
        </h2>
        <p className="mx-auto mt-2 max-w-[760px] text-sm leading-6 text-[#666] dark:text-gray-300">
          {solutionText.description ||
            "CAT SPEAK kết hợp sức mạnh kết nối cộng đồng người học thực tế với trợ lý AI đàm thoại, mang lại môi trường thực hành đa dạng, an toàn và dễ tiếp cận nhất cho cả 3 ngôn ngữ Anh - Trung - Nhật."}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {localizedSolutions.map((solution) => {
          const SolutionIcon = solution.icon
          return (
            <article
              key={solution.title}
              className="flex h-full flex-col rounded-2xl border border-[#dedede] bg-white p-5 shadow-sm transition-colors dark:border-[#3b3b3b] dark:bg-[#222] sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f3f3] text-[#A90016] dark:bg-[#303030] dark:text-[#ff7a8a]">
                  <SolutionIcon
                    className="h-5 w-5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
                <span className="rounded-md bg-[#fff1f2] px-2 py-1 text-[10px] font-semibold text-[#A90016] dark:bg-[#35181d] dark:text-[#ff9aa8]">
                  {solution.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#171717] dark:text-gray-100">
                {solution.title}
              </h3>
              <p className="mt-2 flex-1 text-xs leading-[1.65] text-[#666] dark:text-gray-300 sm:text-sm">
                {solution.description}
              </p>
              <ul className="mt-4 space-y-2">
                {solution.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2 text-[11px] leading-4 text-[#444] dark:text-gray-300"
                  >
                    <CircleCheck
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>
    </div>
  </section>
  )
}

export default SolutionSection
