import React from "react"
import { CheckCircle2 } from "lucide-react"

const PublicClassOutcomes = () => {
  const outcomes = [
    "Nâng cao phản xạ giao tiếp tự nhiên và linh hoạt trong các ngữ cảnh thực tế.",
    "Chuẩn hóa phát âm IPA, ngữ điệu và nối âm như người bản xứ.",
    "Mở rộng vốn từ vựng phong phú theo chủ đề ứng dụng cao.",
    "Thành thạo kỹ năng thuyết trình, làm việc nhóm và giao tiếp chuyên nghiệp.",
    "Tự tin đàm phán, tranh luận và bày tỏ quan điểm cá nhân.",
    "Được theo sát, chỉnh sửa lỗi sai chi tiết bởi giảng viên chuyên môn cao.",
  ]

  const skills = [
    "Phản xạ nhanh",
    "Phát âm IPA",
    "Ngữ điệu tự nhiên",
    "Từ vựng nâng cao",
    "Thuyết trình Tiếng Anh",
    "Giao tiếp chuyên nghiệp"
  ]

  return (
    <div id="outcomes" className="scroll-mt-24">
      <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 sm:p-8 border border-border dark:border-[#3F3F3F]">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            Những Gì Bạn Sẽ Đạt Được
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {outcomes.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white dark:bg-[#222222] p-4 rounded-2xl border border-slate-100 dark:border-[#333333] shadow-2xs">
              <CheckCircle2 size={20} className="text-[#b20a1c] dark:text-[#FF6B6B] shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-slate-800 dark:text-gray-200 leading-relaxed">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Skill tags */}
        <div className="pt-4 border-t border-border/60 dark:border-[#3F3F3F]">
          <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Các kỹ năng chính rèn luyện trong lớp
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="bg-white dark:bg-[#222222] border border-border dark:border-[#3F3F3F] hover:border-rose-300 dark:hover:border-rose-500/50 text-slate-800 dark:text-gray-200 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs transition-colors"
              >
                + {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicClassOutcomes
