import { Users, Award, Heart, BookOpen } from "lucide-react";

const numbersData = [
  { value: "50.000+", label: "Học viên đồng hành", icon: Users, sub: "Trên toàn thế giới" },
  { value: "500+", label: "Giảng viên chất lượng", icon: Award, sub: "Đạt chuẩn quốc tế" },
  { value: "98%", label: "Tỷ lệ hài lòng", icon: Heart, sub: "Đánh giá 5 sao" },
  { value: "100+", label: "Khóa học & Chủ đề", icon: BookOpen, sub: "Đa dạng cấp độ" },
];

const NumbersSection = () => {
  return (
    <section className="relative z-30 w-full max-w-6xl mx-auto px-6 pt-10 pb-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100/80 shadow-xl shadow-rose-900/5 p-6 sm:p-8 lg:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {numbersData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-3 transition-transform hover:-translate-y-1 duration-300 ${
                index > 0 ? "pt-6 sm:pt-3" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/70 text-[#910B09] flex items-center justify-center mb-3 shadow-inner">
                <IconComponent size={24} />
              </div>
              <span className="text-3xl sm:text-4xl font-black text-[#910B09] tracking-tight">
                {item.value}
              </span>
              <span className="text-sm font-bold text-gray-800 mt-1">
                {item.label}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">
                {item.sub}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default NumbersSection;
