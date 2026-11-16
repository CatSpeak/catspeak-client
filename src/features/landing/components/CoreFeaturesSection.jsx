import { createElement } from "react"
import {
  Bot,
  Building,
  Sparkles,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react"

const features = [
  {
    icon: UsersRound,
    badge: "Cốt lõi",
    title: "Room 1-1 Giao tiếp",
    description:
      "Trò chuyện 1 kèm 1 với bạn học cùng trình độ. Hệ thống có sẵn câu hỏi mở đầu (Icebreaker) và đồng hồ chia lượt nói công bằng.",
    support: "Anh · Trung · Nhật",
  },
  {
    icon: UsersRound,
    badge: "Cộng đồng",
    title: "Room Nhóm Chủ Đề",
    description:
      "Thực hành thảo luận từ 3–5 người theo chủ đề cụ thể: phỏng vấn việc làm, du học, đàm phán công sở tiếng Anh, Trung, Nhật.",
    support: "Anh · Trung · Nhật",
  },
  {
    icon: Bot,
    badge: "Công nghệ AI",
    title: "AI Hội Thoại 24/7",
    description:
      "Luyện phản xạ kiên nhẫn bất cứ lúc nào. AI lắng nghe, phản hồi tự nhiên và gợi ý nâng cấp từ vựng ngay khi được yêu cầu.",
    support: "Anh · Trung · Nhật",
    accent: "amber",
  },
  {
    icon: SlidersHorizontal,
    badge: "Anh · Trung · Nhật",
    title: "Cá Nhân Hóa Lộ Trình",
    description:
      "Tùy chọn mục tiêu (công việc, thi cử JLPT/HSK/IELTS) và theo dõi số phút đàm thoại thực tế được tích lũy theo tuần.",
    support: "Anh · Trung · Nhật",
  },
  {
    icon: Building,
    badge: "Sắp ra mắt",
    title: "Dashboard B2B / Tổ Chức",
    description:
      "Giải pháp quản trị phòng riêng và theo dõi mức độ chuyên cần dành cho các trung tâm ngoại ngữ, câu lạc bộ và doanh nghiệp.",
    support: "Anh · Trung · Nhật",
    upcoming: true,
  },
]

const CoreFeaturesSection = () => (
  <section
    id="core-features"
    className="w-full scroll-mt-[72px] bg-[#f3f3f3] px-4 py-12 transition-colors dark:bg-[#171717] sm:px-6 sm:py-16 lg:px-8"
  >
    <div className="mx-auto max-w-[1200px]">
      <header className="mx-auto mb-8 max-w-[800px] text-center sm:mb-9">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#B3261E] dark:text-[#ff7a8a] sm:text-sm">
          {createElement(Sparkles, {
            className: "h-4 w-4 text-amber-500",
            "aria-hidden": true,
          })}
          Tính năng cốt lõi
        </p>
        <h2 className="mx-auto mt-3 max-w-[800px] text-[clamp(2rem,3.8vw,2.65rem)] font-black leading-[1.08] tracking-[-0.04em] text-[#171717] dark:text-white">
          Công cụ tối ưu cho việc luyện nói thực tế
        </h2>
        <p className="mx-auto mt-2 max-w-[760px] text-sm leading-6 text-[#666] dark:text-gray-300 sm:text-base">
          Mọi tính năng đều tập trung vào mục tiêu duy nhất: giúp bạn mở lời tự
          nhiên, giảm áp lực và hình thành phản xạ đàm thoại bền vững.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {features.map(({ icon, badge, title, description, support, accent, upcoming }) => (
          <article
            key={title}
            className="flex min-h-[224px] flex-col rounded-2xl border border-[#dedede] bg-white p-5 shadow-sm transition-colors dark:border-[#3b3b3b] dark:bg-[#222] sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dedede] bg-white dark:border-[#444] dark:bg-[#272727] ${
                  accent === "amber"
                    ? "text-amber-500"
                    : upcoming
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-[#B3261E] dark:text-[#ff7a8a]"
                }`}
              >
                {createElement(icon, {
                  className: "h-5 w-5",
                  strokeWidth: 1.9,
                  "aria-hidden": true,
                })}
              </span>
              <span
                className={`rounded-md px-2 py-1 text-center text-[10px] font-semibold ${
                  upcoming
                    ? "bg-gray-200 text-gray-600 dark:bg-[#383838] dark:text-gray-300"
                    : "bg-[#fff1f1] text-[#B3261E] dark:bg-[#3a2225] dark:text-[#ff9da7]"
                }`}
              >
                {badge}
              </span>
            </div>

            <h3 className="text-base font-bold leading-snug text-[#171717] dark:text-gray-100">
              {title}
            </h3>
            <p className="mt-2 text-xs leading-[1.65] text-[#555] dark:text-gray-300">
              {description}
            </p>
            <div className="mt-auto border-t border-[#ececec] pt-3 dark:border-[#3b3b3b]">
              <span className="text-xs text-[#999] dark:text-gray-400">
                Hỗ trợ: {support}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default CoreFeaturesSection
