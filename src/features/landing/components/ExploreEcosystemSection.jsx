import { Bot, Crown, BookOpen, Users, MessageSquare } from "lucide-react";

const ExploreEcosystemSection = () => {
  return (
    <section className="w-full py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Speech Bubbles */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
          {/* Bubble 1 */}
          <div className="bg-[#FFF0F2] text-[#910B09] font-bold text-sm sm:text-base px-6 py-2.5 rounded-full shadow-sm flex items-center gap-2 border border-rose-100 animate-bounce" style={{ animationDuration: "3s" }}>
            <MessageSquare size={16} className="text-[#910B09]" />
            <span>Giao tiếp tự nhiên</span>
          </div>

          {/* Bubble 2 */}
          <div className="bg-white text-[#910B09] font-bold text-sm sm:text-base px-6 py-2.5 rounded-full shadow-sm border-2 border-[#910B09]">
            <span>Giao tiếp cộng đồng</span>
          </div>

          {/* Bubble 3 */}
          <div className="bg-[#FEF9C3] text-[#854D0E] font-bold text-sm sm:text-base px-6 py-2.5 rounded-full shadow-sm border border-yellow-200 animate-bounce" style={{ animationDuration: "3.5s" }}>
            <span>Thực Hành Real-time</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Khám phá hệ sinh thái học tập
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mt-4 leading-relaxed">
            Kết nối tri thức, tối ưu lộ trình và phát triển ngôn ngữ bền vững.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Trợ lý AI */}
          <div className="bg-[#F4EEFF] border border-purple-100 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#DDD6FE] text-[#7C3AED] flex items-center justify-center shadow-inner">
                  <Bot size={26} />
                </div>

                <span className="bg-[#DDD6FE] text-[#6D28D9] text-xs font-bold px-4 py-1.5 rounded-full">
                  Hỏi gì cũng được!
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-3 group-hover:text-[#6D28D9] transition-colors">
                Trợ lý AI
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Có bài khó? Có điều mò mẫm? Hỏi AI ngay để được giải thích thật dễ hiểu và vui hơn.
              </p>
            </div>
          </div>

          {/* Card 2: Vừa học vừa chơi */}
          <div className="bg-[#FEFCE8] border border-yellow-100 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF08A] text-[#CA8A04] flex items-center justify-center shadow-inner">
                  <Crown size={26} />
                </div>

                <span className="bg-[#FEF08A] text-[#A16207] text-xs font-bold px-4 py-1.5 rounded-full">
                  Học mà vui, chơi mà giỏi!
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-3 group-hover:text-[#A16207] transition-colors">
                Vừa học vừa chơi
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Thử thách nhỏ, trò chơi hay và nhiệm vụ thú vị đang chờ bạn khám phá.
              </p>
            </div>
          </div>

          {/* Card 3: Nguồn tài nguyên */}
          <div className="bg-[#F0FDF4] border border-emerald-100 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#BBF7D0] text-[#16A34A] flex items-center justify-center shadow-inner">
                  <BookOpen size={26} />
                </div>

                <span className="bg-[#BBF7D0] text-[#15803D] text-xs font-bold px-4 py-1.5 rounded-full">
                  Kho báu kiến thức đầy rồi!
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-3 group-hover:text-[#15803D] transition-colors">
                Nguồn tài nguyên
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Tìm sách, bài học, hình ảnh và những điều hay ho để học thêm mỗi ngày.
              </p>
            </div>
          </div>

          {/* Card 4: Kết nối cộng đồng */}
          <div className="bg-[#FDF2F8] border border-pink-100 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#FBCFE8] text-[#DB2777] flex items-center justify-center shadow-inner">
                  <Users size={26} />
                </div>

                <span className="bg-[#FBCFE8] text-[#BE185D] text-xs font-bold px-4 py-1.5 rounded-full">
                  Cùng học, cùng vui!
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-3 group-hover:text-[#BE185D] transition-colors">
                Kết nối cộng đồng
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Chia sẻ điều bạn biết, xem thành quả của bạn bè và tìm thêm những người cùng sở thích.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreEcosystemSection;
