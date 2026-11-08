import { createElement } from "react"
import { Award, BadgeCheck, Medal, Star, Trophy } from "lucide-react"

const achievements = [
  {
    icon: Trophy,
    year: "2025",
    category: "GIẢI NHẤT TOÀN QUỐC",
    title: "Quán Quân EdTech Youth Innovation",
    organization:
      "Mạng lưới Sáng kiến Giáo dục Đổi mới & Đổi mới Sáng tạo",
    description:
      "Vượt qua hơn 120 dự án công nghệ giáo dục nhờ mô hình kết hợp Room 1–1 vận hành minh bạch và trợ lý đàm thoại AI thông minh.",
    metric: "120+ Dự án tham gia",
  },
  {
    icon: Medal,
    year: "2025",
    category: "TOP 5 QUỐC GIA",
    title: "Top 5 Dự án Khởi nghiệp Sáng tạo Trẻ",
    organization: "Hội đồng Phát triển Khởi nghiệp & Hợp tác Quốc tế",
    description:
      'Ghi nhận giải pháp giải quyết tận gốc vấn đề “học từ vựng nhiều năm nhưng không dám mở lời” của người học Việt Nam.',
    metric: "Hội đồng chuyên gia đánh giá",
  },
  {
    icon: Award,
    year: "2025",
    category: "CHỨNG NHẬN XUẤT SẮC",
    title: "Sáng kiến Giáo dục Vị Nhân Sinh",
    organization: "Diễn đàn Công nghệ & Thanh niên ASEAN",
    description:
      "Vinh danh cam kết tạo dựng không gian luyện nói 3 ngôn ngữ (Anh – Trung – Nhật) an toàn, tôn trọng người mới bắt đầu.",
    metric: "Quy chuẩn an toàn cộng đồng",
  },
  {
    icon: Star,
    year: "2024",
    category: "BÌNH CHỌN SINH VIÊN",
    title: "Dự án Tiên phong Đào tạo Phản xạ Đa ngữ",
    organization: "Liên minh Hợp tác Ngôn ngữ Sinh viên Việt Nam",
    description:
      "Đạt 94% tỷ lệ học viên phản hồi tích cực về việc tăng độ tự tin khi bước vào các buổi phỏng vấn và kỳ thi vấn đáp.",
    metric: "94% Mức độ hài lòng",
  },
]

const AchievementsSection = () => {
  return (
    <section className="w-full border-t border-[#e5e5e5] bg-[#f3f3f3] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1280px]">
        <header className="mx-auto mb-9 max-w-[780px] text-center sm:mb-10">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#B3261E] sm:text-sm">
            <Trophy className="h-4 w-4 text-[#F5A623]" aria-hidden="true" />
            Thành tích & Dấu ấn nổi bật
          </p>
          <h2 className="mx-auto mt-3 max-w-[620px] text-[clamp(2rem,4vw,3rem)] font-black leading-[1.05] tracking-[-0.04em] text-[#171717]">
            Thành tích & Giải thưởng khẳng định chất lượng
          </h2>
          <p className="mx-auto mt-3 max-w-[760px] text-base leading-7 text-[#666] sm:text-lg">
            Hành trình xây dựng CAT SPEAK được ghi nhận bởi các giải thưởng
            khởi nghiệp giáo dục và các tổ chức học thuật uy tín trên toàn quốc.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {achievements.map(
            ({
              icon: Icon,
              year,
              category,
              title,
              organization,
              description,
              metric,
            }) => (
              <article
                key={title}
                className="flex min-h-[344px] flex-col rounded-2xl border border-[#dedede] bg-[#fafafa] p-5 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#FFE2A0] bg-[#FFF9EB] text-[#F5A623]">
                    {createElement(Icon, {
                      className: "h-6 w-6",
                      strokeWidth: 1.8,
                      "aria-hidden": true,
                    })}
                  </span>
                  <span className="rounded-lg bg-[#FFF0F0] px-3 py-1 text-xs font-semibold text-[#B3261E]">
                    {year}
                  </span>
                </div>

                <p className="mb-2 w-fit rounded-md bg-[#FFF8E8] px-2 py-1 text-[0.65rem] font-bold tracking-wide text-[#B56A00]">
                  {category}
                </p>
                <h3 className="text-base font-bold leading-snug text-[#171717]">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-[1.55] text-[#666]">
                  {organization}
                </p>
                <p className="mt-3 flex-1 text-[0.82rem] leading-[1.6] text-[#555]">
                  {description}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#ececec] pt-3">
                  <span className="text-xs leading-5 text-[#999]">{metric}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#B3261E]">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    Xác nhận
                  </span>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

export default AchievementsSection
