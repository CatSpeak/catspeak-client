import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { ChevronLeft, ChevronRight, UserCheck, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/shared/context/LanguageContext";

const mockTeachers = [
  {
    id: 1,
    name: "Nguyễn Văn G",
    role: "Giảng viên tiếng Anh",
    bio: "Chuyên gia IELTS 8.5 với hơn 6 năm kinh nghiệm giảng dạy giao tiếp.",
    color: "bg-stone-200",
  },
  {
    id: 2,
    name: "Trần Thị H",
    role: "Giảng viên Tiếng Anh",
    bio: "Cử nhân Đại học Sư Phạm, đam mê truyền cảm hứng học ngoại ngữ.",
    color: "bg-slate-200",
  },
  {
    id: 3,
    name: "Lê Minh K",
    role: "Giảng viên Tiếng Trung",
    bio: "HSK 6, cựu du học sinh Thượng Hải với phương pháp phản xạ nhanh.",
    color: "bg-zinc-200",
  },
  {
    id: 4,
    name: "Phạm Thu M",
    role: "Giảng viên Tiếng Nhật",
    bio: "JLPT N1, chuyên đào tạo giao tiếp doanh nghiệp và phát âm chuẩn.",
    color: "bg-neutral-200",
  },
  {
    id: 5,
    name: "Hoàng Đức N",
    role: "Giảng viên Giao tiếp",
    bio: "Hơn 5000+ học viên đạt mục tiêu giao tiếp tự tin sau 3 tháng.",
    color: "bg-gray-200",
  },
  {
    id: 6,
    name: "Vũ Thanh P",
    role: "Giảng viên Tiếng Hàn",
    bio: "TOPIK 6, phương pháp giảng dạy qua văn hóa sáng tạo và thực tế.",
    color: "bg-stone-300",
  },
];

const LeadingTeamSection = ({ openAuthModal }) => {
  const { t } = useLanguage();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleTeacherAction = () => {
    if (!isAuthenticated) {
      if (openAuthModal) {
        openAuthModal("login");
      } else {
        navigate("/setting/instructor");
      }
      return;
    }

    // Authenticated user
    if (role === "Teacher") {
      navigate("/workspace/courses");
    } else {
      navigate("/setting/instructor");
    }
  };

  const handleExploreCourses = () => {
    navigate("/explore-courses");
  };

  return (
    <section className="w-full py-16 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Đội ngũ Dẫn dắt và Đồng hành
          </h2>
          <p className="text-xl font-bold text-[#910B09] mt-2">
            Chất lượng cao
          </p>
        </div>

        {/* Carousel Container with navigation arrows */}
        <div className="relative group px-2 sm:px-4">
          {/* Navigation buttons - natively and dynamically centered at 50% */}
          <button
            onClick={() => handleScroll("left")}
            className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-700 shadow-md flex items-center justify-center hover:border-[#910B09] hover:text-[#910B09] hover:scale-105 active:scale-95 transition-all"
            aria-label="Previous instructor"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={() => handleScroll("right")}
            className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-gray-200 bg-white text-gray-700 shadow-md flex items-center justify-center hover:border-[#910B09] hover:text-[#910B09] hover:scale-105 active:scale-95 transition-all"
            aria-label="Next instructor"
          >
            <ChevronRight size={22} />
          </button>

          {/* Cards Scroll View */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth py-4 px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {mockTeachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={handleExploreCourses}
                className="flex-shrink-0 w-[250px] sm:w-[270px] bg-white border border-gray-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col group/card cursor-pointer"
              >
                {/* Top Image / Avatar Showcase Frame */}
                <div className="relative w-full h-[220px] sm:h-[240px] bg-gradient-to-b from-stone-50 via-slate-50 to-gray-100 border-b border-gray-100 flex flex-col items-center justify-center p-4 overflow-hidden">
                  {/* Subtle Grid / Pattern background */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Avatar Icon / Mock Graphic */}
                  <div className="relative z-10 w-24 h-24 rounded-full bg-white shadow-inner border border-gray-200 flex items-center justify-center text-gray-400 group-hover/card:scale-105 transition-transform duration-300">
                    <UserCheck size={44} className="text-gray-400" />
                  </div>

                  {/* Hover Pill Button */}
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                    <span className="bg-white/95 text-gray-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-white">
                      Xem giảng viên
                    </span>
                  </div>
                </div>

                {/* Card Content Section */}
                <div className="p-5 flex flex-col flex-1 justify-between text-center gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover/card:text-[#910B09] transition-colors">
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#910B09] mt-0.5">
                      {teacher.role}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {teacher.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Recruitment Banner */}
        <div className="mt-16 relative bg-[#FFF0F2] rounded-3xl p-8 sm:p-10 lg:p-12 overflow-hidden border border-rose-100 shadow-sm">
          {/* Top Decorative Sparkles */}
          <div className="absolute top-4 left-6 text-[#910B09] opacity-80 animate-pulse">
            <Sparkles size={28} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#910B09] leading-tight">
                Bạn muốn trở thành một phần của Đội ngũ CatSpeak?
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mt-2 leading-relaxed">
                Chia sẻ tri thức, kết nối cộng đồng toàn cầu và chủ động thời gian cùng nền tảng công nghệ hàng đầu.
              </p>
            </div>

            <button
              onClick={handleTeacherAction}
              className="flex-shrink-0 bg-[#910B09] hover:bg-[#7a0907] text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 group/btn cursor-pointer"
            >
              <span>
                {isAuthenticated && role === "Teacher"
                  ? "Khu vực Giảng viên"
                  : "Đăng ký trở thành Giảng viên"}
              </span>
              <ArrowRight
                size={18}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadingTeamSection;
