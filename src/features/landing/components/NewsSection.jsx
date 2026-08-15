import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Calendar, Newspaper } from "lucide-react";

const mockNews = [
  {
    id: 1,
    isNew: true,
    date: "12 tháng 7 năm 2026",
    title: "CAT SPEAK XUẤT SẮC ĐẠT GIẢI NHÌ HUB FORUM HANOI 2026",
    summary: "CatSpeak vượt qua hàng trăm giải pháp công nghệ giáo dục tiêu biểu toàn quốc để giành giải Nhì tại Hub Forum Hanoi 2026.",
  },
  {
    id: 2,
    isNew: true,
    date: "10 tháng 8 năm 2026",
    title: "HỘI THẢO CÔNG NGHỆ AI TRONG GIẢNG DẠY NGÔN NGỮ 2026",
    summary: "Sự kiện quy tụ các chuyên gia hàng đầu thảo luận về xu hướng ứng dụng AI cá nhân hóa trong việc học ngoại ngữ.",
  },
  {
    id: 3,
    isNew: false,
    date: "01 tháng 8 năm 2026",
    title: "CHUỖI SỰ KIỆN KẾT NỐI CỘNG ĐỒNG HỌC VIÊN TOÀN CẦU",
    summary: "CatSpeak ra mắt chuỗi phòng luyện nói thực tế trực tuyến kết nối hàng ngàn học viên từ hơn 20 quốc gia.",
  },
  {
    id: 4,
    isNew: false,
    date: "15 tháng 6 năm 2026",
    title: "RA MẮT TÍNH NĂNG TRỢ LÝ AI LUYỆN PHÁT ÂM REAL-TIME",
    summary: "Đột phá công nghệ nhận diện giọng nói giúp học viên sửa lỗi phát âm trực tiếp với độ chính xác cao.",
  },
];

const NewsSection = () => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full py-16 lg:py-24 bg-white overflow-hidden">
      {/* Background Translucent Watermark Text */}
      <div className="absolute top-12 left-0 right-0 pointer-events-none select-none overflow-hidden z-0 opacity-15 whitespace-nowrap">
        <span className="text-[120px] font-black text-rose-300 tracking-wider">
          News News News News News News News News
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-1">
              Theo dòng sự kiện
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              Bản tin <span className="text-[#910B09]">Cat Speak</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-[#910B09] hover:bg-[#7a0907] text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm">
              <span>Xem chi tiết</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => handleScroll("left")}
                className="w-10 h-10 rounded-full border border-[#910B09] text-[#910B09] hover:bg-[#910B09] hover:text-white transition-all flex items-center justify-center"
                aria-label="Previous news"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="w-10 h-10 rounded-full border border-[#910B09] text-[#910B09] hover:bg-[#910B09] hover:text-white transition-all flex items-center justify-center"
                aria-label="Next news"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* News Cards Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth py-4 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {mockNews.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[300px] sm:w-[360px] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Card Thumbnail Container */}
              <div className="relative w-full h-[200px] sm:h-[220px] bg-gradient-to-br from-red-900 via-rose-900 to-stone-900 p-6 flex flex-col justify-between overflow-hidden">
                {/* Visual pattern decoration */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                
                {/* Yellow "New" badge */}
                {item.isNew && (
                  <span className="relative z-10 self-start bg-amber-400 text-slate-900 font-bold text-xs px-3 py-1 rounded-md shadow-md">
                    New
                  </span>
                )}

                {/* News Image Graphic Placeholder */}
                <div className="relative z-10 my-auto flex items-center justify-center text-white/40 group-hover:scale-105 transition-transform duration-300">
                  <Newspaper size={64} className="text-white/60" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                {/* Date & Action Button */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-medium text-gray-500">
                    <Calendar size={14} className="text-[#910B09]" />
                    {item.date}
                  </span>

                  <button className="rounded-full border border-[#910B09] text-[#910B09] hover:bg-[#910B09] hover:text-white px-3.5 py-1 text-xs font-semibold transition-colors">
                    Xem bài viết
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug group-hover:text-[#910B09] transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
