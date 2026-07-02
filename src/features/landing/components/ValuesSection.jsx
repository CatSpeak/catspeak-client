import { useRef } from "react";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { Play, Users, Network, MessageCircle } from "lucide-react";
import ValueCard from "./ValueCard";
import { Element2 } from "../assets";
import { motion, useScroll, useTransform } from "framer-motion";

const ValuesSection = () => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 45%", "center center"],
  });

  const clipPercent = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const clipPath = useTransform(clipPercent, (v) => `inset(0 0 0 ${100 - v}%)`);
  return (
    <div ref={sectionRef} className="w-full py-16 sm:py-24 relative">
      {/* Background Element 2 */}
      <div className="absolute inset-0  pointer-events-none">
        <motion.img
          src={Element2}
          alt=""
          aria-hidden="true"
          style={{ clipPath }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] max-w-none"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center justify-center space-y-4 text-center">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base tracking-wide">
            {t.home?.whyChooseUs}
          </h3>
          <h2 className="font-bold text-cath-red-700 text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {t.home?.valuesTitle}
          </h2>
        </div>

        {/* Desktop Cards */}
        <div className="hidden lg:block relative min-h-[900px]">
          <div className="absolute left-[5%] top-[10%] transition-transform duration-500">
            <ValueCard
              icon={<Play size={32} />}
              title={t.home.values.practice.title}
              description={t.home.values.practice.description}
              color="orange"
            />
          </div>
          <div className="absolute left-[15%] top-[58%] transition-transform duration-500">
            <ValueCard
              icon={<Users size={32} />}
              title={t.home.values.community.title}
              description={t.home.values.community.description}
              color="blue"
            />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-[28%] transition-transform duration-500">
            <ValueCard
              icon={<Network size={32} />}
              title={t.home.values.aiSupport.title}
              description={t.home.values.aiSupport.description}
              color="red"
            />
          </div>
          <div className="absolute right-[15%] top-[58%] transition-transform duration-500">
            <ValueCard
              icon={<MessageCircle size={32} />}
              title={t.home.values.networking.title}
              description={t.home.values.networking.description}
              color="blue"
            />
          </div>
          <div className="absolute right-[5%] top-[10%] transition-transform duration-500">
            <ValueCard
              icon={<Network size={32} />}
              title={t.home.values.reallife.title}
              description={t.home.values.reallife.description}
              color="blue"
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:hidden">
          <ValueCard
            icon={<Play size={32} />}
            title={t.home.values.practice.title}
            description={t.home.values.practice.description}
            color="orange"
          />
          <ValueCard
            icon={<Network size={32} />}
            title={t.home.values.aiSupport.title}
            description={t.home.values.aiSupport.description}
            color="red"
          />
          <ValueCard
            icon={<Users size={32} />}
            title={t.home.values.networking.title}
            description={t.home.values.networking.description}
            color="blue"
          />
          <ValueCard
            icon={<MessageCircle size={32} />}
            title={t.home.values.community.title}
            description={t.home.values.community.description}
            color="blue"
          />
          <div className="col-span-2 flex justify-center">
            <ValueCard
              icon={<Network size={32} />}
              title={t.home.values.reallife.title}
              description={t.home.values.reallife.description}
              color="blue"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuesSection;
