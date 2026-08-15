import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { Element1, Element4 } from "../assets";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import LanguageCard from "./LanguageCard";
import { Users, BookOpen, GraduationCap } from "lucide-react";

const stats = [
  {
    value: "50.000 +",
    label: "Người tham gia",
    icon: Users,
    badgeColor: "bg-rose-50 text-[#910B09] border-rose-100",
  },
  {
    value: "1.200 +",
    label: "Tài nguyên học tập",
    icon: BookOpen,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    value: "300 +",
    label: "Giáo viên đăng ký",
    icon: GraduationCap,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
];

const HeroSection = ({ openAuthModal }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    const community = localStorage.getItem("communityLanguage");
    if (isAuthenticated) {
      navigate(`/${community}/community`);
    } else {
      openAuthModal("login");
    }
  };

  return (
    <div className="relative w-full bg-white px-6 sm:px-8 md:px-10 pt-16 pb-48 lg:pt-24 lg:pb-56">
      {/* Background Element - Full natural hero ribbon height without cut-off */}
      <img
        src={Element1}
        alt="Background Element"
        className="absolute -top-10 left-0 w-full h-full object-cover object-top opacity-80 pointer-events-none"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start gap-4 lg:gap-20">
          {/* Left Side - Text Content */}
          <div className="flex-1 w-full z-20 flex flex-col justify-center gap-6 text-center lg:text-left">
            <div className="space-y-4">
              <h3 className="font-semibold text-cath-red-600 text-base lg:text-sm tracking-wider uppercase">
                {t.home?.subtitle}
              </h3>
              <h2 className="font-bold text-[#910B09] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight">
                <span className="text-black">{t.home?.heroTitle1}</span>
                <br />
                <span className="text-[#910B09]">{t.home?.heroTitle2}</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg max-w-md sm:max-w-2xl mx-auto lg:mx-0">
                {t.home?.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-center lg:justify-start">
              <button
                onClick={handleAction}
                className="rounded-full px-8 py-3.5 text-base font-semibold text-white bg-[#910B09] hover:bg-[#7a0907] transition-all duration-300 w-full sm:w-auto mx-auto lg:mx-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {t.home?.ctaButton}
              </button>
            </div>
          </div>

          {/* Right Side - Screen Image (Positioned down to clear header navbar) */}
          <div className="w-full lg:flex-1 z-10 relative flex justify-center items-center lg:min-h-[480px] mt-4 lg:mt-6">
            <div className="relative w-full lg:absolute lg:top-[52%] lg:-translate-y-1/2 lg:-right-40 lg:w-[900px] lg:max-w-none">
              <LanguageCard />
            </div>
          </div>
        </div>

        {/* Premium Numbers Section */}
        <div className="mt-16 lg:mt-24 mb-10 relative z-20 max-w-3xl mx-auto bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_15px_45px_-10px_rgba(145,11,9,0.08)] border border-rose-100/90 px-6 sm:px-10 py-6 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-[0_20px_50px_-10px_rgba(145,11,9,0.12)]">
          {stats.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className="flex-1 flex items-center justify-center">
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left group cursor-default">
                  {/* Icon Badge */}
                  <div
                    className={`w-11 h-11 rounded-2xl border ${item.badgeColor} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    <IconComponent size={20} />
                  </div>

                  {/* Text Details */}
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight group-hover:text-[#910B09] transition-colors duration-300">
                      {item.value}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5">
                      {item.label}
                    </div>
                  </div>
                </div>

                {/* Gradient Divider between items */}
                {idx < stats.length - 1 && (
                  <div className="hidden sm:block h-10 w-[1.5px] bg-gradient-to-b from-transparent via-rose-300/80 to-transparent flex-shrink-0 ml-6 lg:ml-8" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Illustration Line - Positioned completely BELOW the numbers card */}
      <img
        src={Element4}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-[80px] sm:-bottom-[100px] left-1/2 -translate-x-1/2 w-[100vw] max-w-none pointer-events-none z-10"
      />
    </div>
  );
};

export default HeroSection;
