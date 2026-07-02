import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import {
  Partner1,
  Partner2,
  Partner3,
  Partner4,
  Partner5,
} from "@/features/landing/assets/index.jsx";
// 5 partner placeholder circles with different colors
const partners = [
  { image: Partner1, alt: "Partner 1" },
  { image: Partner2, alt: "Partner 2" },
  { image: Partner3, alt: "Partner 3" },
  { image: Partner4, alt: "Partner 4" },
  { image: Partner5, alt: "Partner 5" },
];

const PartnerSection = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full py-16 lg:py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#990011] mb-8 lg:mb-12">
          {t.home?.partnerSection?.title}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-10">
          {partners.map((partner, i) => (
            <div key={i} className="flex items-center justify-center">
              <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] lg:w-[190px] lg:h-[190px] rounded-full bg-white shadow-lg flex items-center justify-center transition-all duration-300 overflow-hidden">
                <img
                  src={partner.image}
                  alt={partner.alt}
                  className="w-full h-full object-contain p-2 sm:p-3"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
