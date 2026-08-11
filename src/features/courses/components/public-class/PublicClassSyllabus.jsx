import React, { useState } from "react"
import { ChevronDown, ChevronUp, BookOpen, Clock, Calendar, Video } from "lucide-react"

const DEFAULT_SYLLABUS = [
  {
    week: 1,
    title: "Buổi 1: Định Hướng Khóa Học & Khởi Tạo Phản Xạ Giao Tiếp",
    duration: "120 phút",
    type: "Lớp học trực tuyến",
    topics: [
      "Giới thiệu mục tiêu & quy tắc lớp học",
      "Kỹ thuật Phá băng (Ice-breaking) & Tự giới thiệu ấn tượng",
      "Thực hành phản xạ câu hỏi thông dụng trong giao tiếp hàng ngày"
    ]
  },
  {
    week: 2,
    title: "Buổi 2: Chuẩn Hóa Phát Âm IPA & Ngữ Điệu Nối Âm",
    duration: "120 phút",
    type: "Lớp học trực tuyến",
    topics: [
      "Phân biệt cặp âm dễ nhầm lẫn trong Tiếng Anh",
      "Quy tắc nhấn trọng âm từ & trọng âm câu",
      "Thực hành nối âm (Connected Speech) với bài phát biểu ngắn"
    ]
  },
  {
    week: 3,
    title: "Buổi 3: Chủ Đề Công Việc & Giao Tiếp Văn Phòng Chuyên Nghiệp",
    duration: "120 phút",
    type: "Lớp học trực tuyến",
    topics: [
      "Mẫu câu đàm phán, họp hành & viết email chuyên nghiệp",
      "Đóng vai (Role-play) tình huống xử lý sự cố trong công việc",
      "Nhận xét & tối ưu từ vựng chuyên ngành"
    ]
  },
  {
    week: 4,
    title: "Buổi 4: Kỹ Năng Thuyết Trình & Tranh Luận Ý Kiến Cá Nhân",
    duration: "120 phút",
    type: "Lớp học trực tuyến",
    topics: [
      "Cấu trúc bài thuyết trình chuẩn 3 phần thu hút",
      "Sử dụng ngôn ngữ cơ thể & giọng điệu thuyết phục",
      "Thực hành mini-presentation & Q&A trực tiếp với giảng viên"
    ]
  },
  {
    week: 5,
    title: "Buổi 5: Khảo Thí Đánh Giá Giữa Kỳ & Chỉnh Sửa Lỗi Chi Tiết",
    duration: "120 phút",
    type: "Bài đánh giá năng lực",
    topics: [
      "Kiểm tra phản xạ nói 1:1 cùng giảng viên",
      "Nhận lộ trình tinh chỉnh điểm yếu cá nhân",
      "Tổng kết kiến thức & giải đáp thắc mắc chuyên sâu"
    ]
  }
]

const PublicClassSyllabus = ({ classData }) => {
  const [openItems, setOpenItems] = useState({ 0: true, 1: true })

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const toggleAll = () => {
    const allOpen = Object.keys(openItems).length === DEFAULT_SYLLABUS.length && Object.values(openItems).every(Boolean)
    if (allOpen) {
      setOpenItems({})
    } else {
      const next = {}
      DEFAULT_SYLLABUS.forEach((_, i) => (next[i] = true))
      setOpenItems(next)
    }
  }

  const totalSessions = classData?.totalSessions || DEFAULT_SYLLABUS.length

  return (
    <div id="syllabus" className="scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Nội Dung & Chương Trình Học
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Tổng cộng {totalSessions} buổi học trực tiếp • Lộ trình được thiết kế chuẩn quốc tế
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-bold text-[#b20a1c] hover:text-[#880715] bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
        >
          {Object.values(openItems).filter(Boolean).length === DEFAULT_SYLLABUS.length ? "Thu gọn tất cả" : "Mở rộng tất cả"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {DEFAULT_SYLLABUS.map((item, idx) => {
          const isOpen = Boolean(openItems[idx])
          return (
            <div
              key={idx}
              className="bg-white border border-border rounded-2xl overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggleItem(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3 pr-4">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#b20a1c] font-black text-sm flex items-center justify-center shrink-0 border border-rose-100">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        {item.duration}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-rose-700">
                        <Video size={13} />
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/40">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nội dung trọng tâm:
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {item.topics.map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#b20a1c] mt-2 shrink-0" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PublicClassSyllabus
