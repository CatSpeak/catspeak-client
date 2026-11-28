import { createElement } from "react"
import { AlertCircle, Frown, MessageSquareOff, UserRoundX } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const barriers = [
  {
    icon: MessageSquareOff,
    title: "Thiếu môi trường nói thực tế",
    description:
      "Bạn có thể tích lũy hàng nghìn từ vựng và nắm vững cấu trúc câu, nhưng xung quanh không có người để thực hành đàm thoại hai chiều mỗi ngày. Ngoại ngữ chỉ dừng lại ở bài tập trên giấy.",
    consequence:
      "Phản xạ chậm, phải dịch từng từ từ tiếng Việt sang ngoại ngữ trước khi nói.",
  },
  {
    icon: Frown,
    title: "Tự luyện một mình dễ nhàm chán",
    description:
      "Luyện nói một mình trước gương hoặc nhại theo video thường thiếu tính ngẫu hứng và không nhận được phản hồi tức thì. Không có sự tương tác qua lại khiến bạn dễ nản chí chỉ sau vài tuần.",
    consequence:
      "Mất dần động lực duy trì thói quen luyện nói định kỳ.",
  },
  {
    icon: UserRoundX,
    title: "Khó tìm bạn luyện phù hợp",
    description:
      "Tìm một người học có cùng trình độ, chung sở thích và phù hợp khung giờ rảnh là điều không dễ. Thêm vào đó là tâm lý e ngại, sợ bị phán xét khi nói sai ngữ pháp hay phát âm chưa chuẩn.",
    consequence:
      "Trì hoãn việc mở lời, bỏ lỡ nhiều cơ hội thăng tiến và giao lưu.",
  },
]

const LearningBarriersSection = () => {
  const { t } = useLanguage()
  const barrierText = t?.landing?.learningBarriers || {}
  const localizedBarriers = barriers.map((item, index) => ({
    ...item,
    ...(barrierText.items?.[index] || {}),
    icon: item.icon,
  }))

  return (
    <section
    id="learning-barriers"
    className="w-full scroll-mt-[72px] bg-white px-4 py-12 transition-colors dark:bg-[#0F0F0F] sm:px-6 sm:py-16 lg:px-8"
  >
    <div className="mx-auto max-w-[1280px]">
      <header className="mx-auto mb-9 max-w-[800px] text-center sm:mb-10">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#B3261E] dark:text-[#ff7a8a] sm:text-sm">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {barrierText.eyebrow || "Rào cản phổ biến của người học"}
        </p>
        <h2 className="mx-auto mt-3 max-w-[700px] text-[clamp(2rem,4vw,3rem)] font-black leading-[1.05] tracking-[-0.04em] text-[#171717] dark:text-white">
          {barrierText.title || "Biết từ vựng và ngữ pháp,"}
          <br className="hidden sm:block" />{" "}
          {barrierText.titleLine2 || "nhưng vẫn khó bắt chuyện?"}
        </h2>
        <p className="mx-auto mt-3 max-w-[780px] text-sm leading-6 text-[#666] dark:text-gray-300 sm:text-base">
          {barrierText.description ||
            "Học ngoại ngữ để giao tiếp, nhưng phần lớn thời gian chúng ta lại tiếp nhận thụ động qua sách vở và bài kiểm tra. Dưới đây là 3 khó khăn lớn nhất khiến bạn ngại mở lời."}
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {localizedBarriers.map(({ icon, title, description, consequence }, index) => (
          <article
            key={title}
            className="flex min-h-[318px] flex-col rounded-2xl border border-[#dedede] bg-[#fafafa] p-5 transition-colors dark:border-[#3b3b3b] dark:bg-[#1d1d1d] sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#dedede] bg-white text-[#B3261E] shadow-sm dark:border-[#444] dark:bg-[#272727] dark:text-[#ff7a8a]">
                {createElement(icon, {
                  className: "h-6 w-6",
                  strokeWidth: 1.8,
                  "aria-hidden": true,
                })}
              </span>
              <span className="font-mono text-xs font-semibold text-[#595959] dark:text-gray-400">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <h3 className="text-lg font-bold leading-snug text-[#171717] dark:text-gray-100">
              {title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-[1.65] text-[#555] dark:text-gray-300">
              {description}
            </p>
            <div className="mt-4 rounded-xl border border-[#f1e4e4] bg-[#fbf5f5] px-3 py-3 text-xs font-medium leading-[1.55] text-[#A90016] dark:border-[#543337] dark:bg-[#302124] dark:text-[#ff9da7]">
              <span className="font-bold">{barrierText.consequenceLabel || "Hệ quả: "}</span>
              {consequence}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
  )
}

export default LearningBarriersSection
