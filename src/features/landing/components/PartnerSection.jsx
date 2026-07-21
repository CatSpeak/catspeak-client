import Marquee from "react-fast-marquee";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import {
  CulturalRoots,
  EZTalking,
  FPTU,
  Go4AI,
  HubNetwork,
  IntracomU,
  ITesol,
  JCITrevi,
  LightLearning,
  MeduEnglish,
  QTEDU,
  SpeakUpGlobal,
} from "@/features/landing/assets/index.jsx";

const partners = [
  { image: CulturalRoots, alt: "Cultural Roots" },
  { image: FPTU, alt: "FPTU" },
  { image: Go4AI, alt: "Go4AI" },
  { image: ITesol, alt: "ITesol" },
  { image: IntracomU, alt: "IntracomU" },
  { image: JCITrevi, alt: "JCITrevi" },
  { image: LightLearning, alt: "LightLearning" },
  { image: MeduEnglish, alt: "MeduEnglish" },
  { image: SpeakUpGlobal, alt: "SpeakUpGlobal" },
  { image: HubNetwork, alt: "HubNetwork" },
  { image: QTEDU, alt: "QTEDU" },
  { image: EZTalking, alt: "EZTalking" },
];

const PartnerSection = () => {
  const { t } = useLanguage();

  return (
    <section className="w-full py-16 lg:py-20 bg-white overflow-hidden">
      <div className="w-full text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#990011] mb-8 lg:mb-12">
          {t.home?.partnerSection?.title}
        </h2>

        <div className="relative">
          {/* <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-28 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />

          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-28 bg-gradient-to-l from-white via-white/95 to-transparent z-10" /> */}

          <Marquee speed={35} gradient={false} pauseOnHover autoFill>
            {partners.map((partner) => (
              <div key={partner.alt} className="mx-3 sm:mx-4 lg:mx-5">
                <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] lg:w-[190px] lg:h-[190px]  bg-white  flex items-center justify-center overflow-hidden">
                  <img
                    src={partner.image}
                    alt={partner.alt}
                    className="w-full h-full object-contain p-4 sm:p-3"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
