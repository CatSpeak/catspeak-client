import React, { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"

const FAQS = [
  {
    q: "Tôi cần trình độ Tiếng Anh thế nào để tham gia lớp?",
    a: "Lớp học được thiết kế phù hợp cho nhiều cấp độ từ Sơ cấp (Basic) đến Trung cấp (Intermediate). Trước khi bắt đầu, giảng viên sẽ có buổi định hướng giúp bạn nắm bắt lộ trình học hiệu quả nhất."
  },
  {
    q: "Lớp học diễn ra dưới hình thức nào?",
    a: "Lớp học được tổ chức trực tuyến 100% qua nền tảng CatSpeak Video Room với sự tương tác trực tiếp 2 chiều giữa giảng viên và học viên."
  },
  {
    q: "Nếu tôi bận nghỉ 1 buổi học thì sao?",
    a: "Tất cả các buổi học đều có bản ghi hình (Recording) và slide bài giảng lưu trữ trên hệ thống. Bạn có thể xem lại bài học bất kỳ lúc nào."
  },
  {
    q: "Làm thế nào để nhận chứng chỉ hoàn thành?",
    a: "Sau khi hoàn thành tối thiểu 80% số buổi học và nộp đủ các bài tập / bài kiểm tra giữa kỳ & cuối kỳ, bạn sẽ nhận được chứng chỉ số CatSpeak."
  },
  {
    q: "Chính sách đăng ký & hoàn tiền như thế nào?",
    a: "CatSpeak cam kết hỗ trợ đổi lớp hoặc hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn cảm thấy lớp học không phù hợp với nhu cầu."
  }
]

const PublicClassFAQ = () => {
  const [openIdx, setOpenIdx] = useState(0)

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx)
  }

  return (
    <div id="faq" className="scroll-mt-24">
      <div className="flex items-center gap-2 mb-6">
        <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
          <HelpCircle size={20} />
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
          Các Câu Hỏi Thường Gặp (FAQ)
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-extrabold text-sm sm:text-base text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <span className="p-1 text-slate-400">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                  {faq.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PublicClassFAQ
