import { createElement, useState } from "react"
import {
  BriefcaseBusiness,
  Building2,
  CircleCheck,
  GraduationCap,
  Laptop,
} from "lucide-react"

const audiences = [
  {
    icon: GraduationCap,
    label: "Học sinh & Sinh viên",
    heading: "Chuẩn bị du học, thi IELTS / HSK / JLPT hoặc bài kiểm tra vấn đáp",
    challenge:
      "Biết ngữ pháp vững nhưng bước vào phòng thi Speaking hay gặp người bản xứ lại lúng túng.",
    solution:
      "Luyện phản xạ với bạn cùng cấp độ, mở rộng vốn từ đàm thoại thực tế mà không tốn chi phí đắt đỏ.",
    benefits: [
      "Luyện đề thi Speaking IELTS, HSK và JLPT Kaiwa",
      "Môi trường nói thân thiện, hỗ trợ sửa phát âm",
      "Chi phí tiếp cận phù hợp cho học sinh, sinh viên",
    ],
  },
  {
    icon: BriefcaseBusiness,
    label: "Người đi làm văn phòng",
    heading: "Họp trực tuyến, trao đổi qua email và gặp gỡ đối tác quốc tế",
    challenge:
      "Muốn thăng tiến hoặc ứng tuyển vào tập đoàn đa quốc gia nhưng trở ngại lớn nhất là khả năng phản xạ tiếng Anh, Trung hoặc Nhật.",
    solution:
      "Các chủ đề phòng nói sát với công sở: đàm phán tiến độ, thuyết trình dự án, small-talk trước giờ họp.",
    benefits: [
      "Phòng đàm thoại chuyên ngành công sở & kinh doanh",
      "Khung giờ luyện linh hoạt: trưa 12h–13h hoặc tối 21h–23h",
      "Hỗ trợ AI gợi ý câu nói chuyên nghiệp (Business wording)",
    ],
  },
  {
    icon: Laptop,
    label: "Freelancer & Remote Workers",
    heading: "Làm việc từ xa cho các dự án và khách hàng quốc tế",
    challenge:
      "Cần tự tin trao đổi công việc, báo giá và giải thích giải pháp kỹ thuật trực tiếp qua cuộc gọi.",
    solution:
      "Xây dựng thói quen nói ngoại ngữ hằng ngày, duy trì phong độ giao tiếp tự nhiên với cộng đồng toàn cầu.",
    benefits: [
      "Tăng độ trôi chảy khi tham gia video call quốc tế",
      "Luyện tập xử lý các tình huống phát sinh đột xuất",
      "Không bị bó buộc địa lý hay lịch trình trung tâm",
    ],
  },
  {
    icon: Building2,
    label: "Trung tâm & Doanh nghiệp",
    heading: "Tạo môi trường nói cho học viên hoặc đội ngũ nhân sự (B2B)",
    challenge:
      "Thời lượng lớp học có hạn, giáo viên không thể kèm 1–1 cho từng học viên luyện nói hằng ngày.",
    solution:
      "CAT SPEAK cung cấp nền tảng bổ trợ ngoài giờ, tạo phòng thực hành riêng và thống kê mức độ chuyên cần.",
    benefits: [
      "Không gian phòng luyện riêng cho lớp học / công ty",
      "Tăng tỷ lệ thực hành nói của học viên lên gấp 5 lần",
      "Gói thử nghiệm thí điểm dành cho đối tác giáo dục",
    ],
  },
]

const TargetAudienceSection = () => {
  const [activeAudience, setActiveAudience] = useState(0)
  const audience = audiences[activeAudience]

  return (
    <section className="w-full bg-white px-4 py-12 transition-colors dark:bg-[#0F0F0F] sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-[1220px]">
        <header className="mx-auto mb-8 max-w-[800px] text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#B3261E] dark:text-[#ff7a8a] sm:text-sm">
            Đối tượng phù hợp
          </p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,2.65rem)] font-black leading-[1.08] tracking-[-0.04em] text-[#171717] dark:text-white">
            Ai nên dùng CAT SPEAK?
          </h2>
          <p className="mx-auto mt-2 max-w-[800px] text-sm leading-6 text-[#666] dark:text-gray-300 sm:text-base">
            Dù mục tiêu của bạn là vượt qua kỳ thi chứng chỉ, tự tin thuyết trình
            trước sếp hay mở rộng cơ hội việc làm toàn cầu, CAT SPEAK luôn có
            không gian phù hợp cho bạn.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Chọn nhóm người học"
          className="mb-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        >
          {audiences.map(({ icon, label }, index) => {
            const isActive = activeAudience === index
            return (
              <button
                key={label}
                id={`audience-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="audience-panel"
                onClick={() => setActiveAudience(index)}
                className={`flex min-h-[76px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-[#B3261E] bg-[#fafafa] ring-1 ring-[#B3261E] dark:border-[#ff7a8a] dark:bg-[#242424] dark:ring-[#ff7a8a]"
                    : "border-[#dedede] bg-white hover:bg-[#fafafa] dark:border-[#3b3b3b] dark:bg-[#1b1b1b] dark:hover:bg-[#242424]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-[#A90016] text-white"
                      : "bg-[#f3f3f3] text-[#555] dark:bg-[#303030] dark:text-gray-300"
                  }`}
                >
                  {createElement(icon, {
                    className: "h-5 w-5",
                    strokeWidth: 1.8,
                    "aria-hidden": true,
                  })}
                </span>
                <span className="text-sm font-semibold text-[#171717] dark:text-gray-100">
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        <div
          id="audience-panel"
          role="tabpanel"
          aria-labelledby={`audience-tab-${activeAudience}`}
          className="grid gap-6 rounded-[24px] border border-[#e1e1e1] bg-[#f2f2f2] p-5 shadow-sm transition-colors dark:border-[#3b3b3b] dark:bg-[#1b1b1b] sm:p-7 lg:grid-cols-[1.4fr_0.95fr] lg:p-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#B3261E] dark:text-[#ff7a8a]">
              Nhóm người học: {audience.label}
            </p>
            <h3 className="mt-4 text-xl font-bold leading-snug text-[#171717] dark:text-gray-100 sm:text-2xl">
              {audience.heading}
            </h3>

            <div className="mt-4 rounded-xl border border-[#dedede] bg-white px-4 py-3 dark:border-[#3b3b3b] dark:bg-[#242424]">
              <p className="text-xs font-bold text-[#171717] dark:text-gray-100">
                Thách thức thường gặp:
              </p>
              <p className="mt-1 text-xs leading-[1.6] text-[#555] dark:text-gray-300 sm:text-sm">
                {audience.challenge}
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-[#dedede] bg-white px-4 py-3 dark:border-[#3b3b3b] dark:bg-[#242424]">
              <p className="text-xs font-bold text-[#B3261E] dark:text-[#ff7a8a]">
                Giải pháp CAT SPEAK mang lại:
              </p>
              <p className="mt-1 text-xs leading-[1.6] text-[#555] dark:text-gray-300 sm:text-sm">
                {audience.solution}
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-[#dedede] bg-white p-5 shadow-sm dark:border-[#3b3b3b] dark:bg-[#242424] sm:p-6">
            <h4 className="border-b border-[#ececec] pb-3 text-sm font-bold uppercase text-[#171717] dark:border-[#3b3b3b] dark:text-gray-100">
              Lợi ích cụ thể bạn nhận được
            </h4>
            <ul className="mt-4 space-y-3">
              {audience.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-2.5 text-xs leading-5 text-[#444] dark:text-gray-300 sm:text-sm"
                >
                  <CircleCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default TargetAudienceSection
