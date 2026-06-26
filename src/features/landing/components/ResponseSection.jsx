import { useState, useRef } from "react";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Element5 } from "../assets";

// Placeholder avatar using colored circle with initials
const AvatarPlaceholder = ({ name, color }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
      style={{ background: color }}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

const avatarColors = ["#f7b2bd", "#b2d8f7", "#b2f7c1", "#f7e4b2"];

const ResponseSection = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);

  const reviews = t.home?.responseSection?.reviews || [];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : reviews.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < reviews.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="relative w-full py-40 px-6 overflow-hidden">
      {/* Background decoration */}
      <img
        src={Element5}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[100vw] max-w-none "
      />
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-start px-6">
        {" "}
        {/* Left: Title + Navigation */}
        <div className="lg:col-span-1">
          <h2 className="text-4xl font-black text-[#990011] mb-3 leading-none">
            {t.home?.responseSection?.title || "Phản hồi"}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            {t.home?.responseSection?.subtitle}
          </p>

          {/* Arrow Buttons */}
          <div className="flex gap-4">
            <button
              className="w-10 h-10 flex items-center justify-center border-2 border-[#990011] rounded-full bg-transparent text-[#990011] hover:bg-[#990011] hover:text-white hover:scale-105 transition-all"
              onClick={handlePrev}
              aria-label="Previous review"
              id="response-prev-btn"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center border-2 border-[#990011] rounded-full bg-transparent text-[#990011] hover:bg-[#990011] hover:text-white hover:scale-105 transition-all"
              onClick={handleNext}
              aria-label="Next review"
              id="response-next-btn"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
        {/* Right: Sliding cards */}
        <div className="lg:col-span-2 overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-6 transition-transform duration-450 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
            style={{
              transform: `translateX(calc(-${currentIndex} * (min(360px, 85vw) + 24px)))`,
            }}
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[min(360px,85vw)] bg-white border border-[#990011] rounded-xl p-7 flex flex-col gap-5 shadow-sm  transition-all"
              >
                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                  "{review.text}"
                </p>
                <div className="flex items-start gap-3">
                  <AvatarPlaceholder
                    name={review.name}
                    color={avatarColors[i % avatarColors.length]}
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">
                      {review.name}
                      <span className="text-xs font-normal text-gray-500 block">
                        {review.role}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResponseSection;
