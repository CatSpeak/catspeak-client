import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { Element1, Element4, Screen } from "../assets";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import LanguageCard from "./LanguageCard";

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
    <div className="relative w-full bg-white px-6 sm:px-8 md:px-10 pt-14 pb-32 lg:pt-24 lg:pb-24">
      {/* Background Element */}
      <img
        src={Element1}
        alt="Background Element"
        className="absolute -top-10 left-0 w-full h-[60%] lg:h-full object-cover object-top opacity-80 pointer-events-none"
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
                className="rounded-full px-8 py-3.5 text-base font-semibold text-white bg-[#910B09] hover:bg-[#7a0907] transition-colors w-full sm:w-auto mx-auto lg:mx-0"
              >
                {t.home?.ctaButton}
              </button>
            </div>
          </div>

          {/* Right Side - Screen Image */}
          <div className="w-full lg:flex-1 z-10 relative flex justify-center items-center lg:min-h-[500px] -mt-10 lg:mt-0">
            <div className="relative w-full  lg:absolute lg:top-1/3 lg:-translate-y-1/2 lg:-right-40 lg:w-[900px] lg:max-w-none">
              <LanguageCard />
            </div>
          </div>
        </div>
      </div>
      <img
        src={Element4}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-[140px] left-1/2 -translate-x-1/2 w-[100vw] max-w-none "
      />
    </div>
  );
};

export default HeroSection;
