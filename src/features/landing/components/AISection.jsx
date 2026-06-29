import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { Check } from "lucide-react";
import { Map } from "../assets";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthModal } from "@/shared/context/AuthModalContext";
import { useNavigate } from "react-router-dom";

const AISection = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate(`/${language}/community`);
    } else {
      openAuthModal("login");
    }
  };

  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#990011] px-5 py-10 rounded-3xl">
        {/* Left Side - Visual Card */}
        <div className="relative order-2 lg:order-1">
          <img
            src={Map}
            alt="AI Section Card"
            className="w-full rounded-2xl "
          />
        </div>

        {/* Right Side - Content */}
        <div className="pt-4 order-1 lg:order-2">
          {/* Sub-header */}
          <p className="text-xs font-medium text-[#FFB3AC] mb-2">
            {t.home?.aiSection?.header}
          </p>

          {/* Main Heading */}
          <h2 className="text-3xl font-extrabold text-white mb-6 leading-tight">
            {t.home?.aiSection?.mainHeading}
          </h2>

          {/* Features List */}
          <ul className="flex flex-col gap-3 mb-8">
            {(t.home?.aiSection?.features || []).map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check size={18} className="flex-shrink-0 mt-0.5 text-white" />
                <span className="text-sm text-white leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <div className="text-right">
            <button
              onClick={handleAction}
              className="inline-flex ml-auto items-center px-8 py-3 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 shadow-sm hover:border-[#990011] hover:text-[#990011] hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              {t.home?.aiSection?.learnMore}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
