import React from "react"
import { Star, ThumbsUp, Quote } from "lucide-react"

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Phạm Minh Hoàng",
    role: "Học viên K26",
    avatar: null,
    rating: 5,
    date: "12/07/2026",
    comment: "Lớp học tương tác cực kỳ sôi nổi! Giảng viên sửa phát âm rất kỹ từng từ một. Sau 1 tháng phản xạ nói của mình tự tin hơn hẳn khi họp với đối tác nước ngoài."
  },
  {
    id: 2,
    name: "Trần Nguyễn Thu Thảo",
    role: "Học viên K27",
    avatar: null,
    rating: 5,
    date: "28/06/2026",
    comment: "Giáo trình và bài tập thực hành sát thực tế. Hệ thống CatSpeak hỗ trợ vào phòng trực tuyến siêu mượt, giáo án và bài viết đều được chấm chữa chi tiết."
  },
  {
    id: 3,
    name: "Lê Quốc Bảo",
    role: "Học viên K25",
    avatar: null,
    rating: 5,
    date: "05/06/2026",
    comment: "Lớp học sĩ số vừa phải, ai cũng có cơ hội nói và thuyết trình. Cực kỳ khuyến khích bạn nào muốn thoát khỏi nỗi sợ nói tiếng Anh!"
  }
]

const RATING_BREAKDOWN = [
  { stars: 5, percentage: 92 },
  { stars: 4, percentage: 6 },
  { stars: 3, percentage: 2 },
  { stars: 2, percentage: 0 },
  { stars: 1, percentage: 0 },
]

const PublicClassReviews = () => {
  return (
    <div id="reviews" className="scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mb-6">
        Đánh Giá Từ Học Viên
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rating Breakdown Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Đánh giá trung bình
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-900">4.9</span>
              <div className="flex flex-col">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-500 mt-1">
                  dựa trên 185+ đánh giá
                </span>
              </div>
            </div>

            {/* Bars */}
            <div className="flex flex-col gap-2 mt-6">
              {RATING_BREAKDOWN.map((item) => (
                <div key={item.stars} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="w-8">{item.stars} sao</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#b20a1c] rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-medium">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl flex items-center gap-2">
            <ThumbsUp size={16} />
            98% học viên giới thiệu lớp học này cho bạn bè!
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {MOCK_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs relative"
            >
              <Quote className="absolute top-4 right-4 text-slate-200" size={32} />

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-[#b20a1c] font-black text-sm flex items-center justify-center">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {review.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>{review.role}</span>
                    <span>•</span>
                    <span>{review.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex text-amber-400 mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400" />
                ))}
              </div>

              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PublicClassReviews
