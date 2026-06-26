import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { Play, Users, Network, MessageCircle } from "lucide-react";
import ValueCard from "./ValueCard";
import { Element2 } from "../assets";

const ValuesSection = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full py-16 sm:py-24 relative overflow-hidden ">
      {/* Background Element 2 */}
      {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen z-0 pointer-events-none">
        <img src={Element2} alt="" className="w-full h-auto max-w-none" />
      </div> */}
      <img
        src={Element2}
        alt=""
        aria-hidden="true"
        className="absolute top-0  left-1/2 -translate-x-1/2 w-[100vw] max-w-none "
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center justify-center space-y-4 text-center">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base tracking-wide">
            {t.home?.whyChooseUs || "Tại sao chọn chúng tôi ?"}
          </h3>
          <h2 className="font-bold text-cath-red-700 text-3xl sm:text-4xl md:text-5xl tracking-tight">
            {t.home?.valuesTitle || "Giá trị của Cat Speak"}
          </h2>
        </div>

        {/* Distributed Cards Area */}
        {/* Distributed Cards Area */}
        <div className="hidden lg:block relative min-h-[900px]">
          {/* Card 1 */}
          <div className="absolute left-[5%] top-[10%] transition-transform duration-500 ">
            <ValueCard
              icon={<Play size={32} />}
              title={t.home.values.practice.title}
              description={t.home.values.practice.description}
              color="orange"
              className=""
            />
          </div>

          {/* Card 2 */}
          <div className="absolute left-[15%] top-[58%] transition-transform duration-500 ">
            <ValueCard
              icon={<Users size={32} />}
              title={t.home.values.community.title}
              description={t.home.values.community.description}
              color="blue"
              className=""
            />
          </div>

          {/* Card 3 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[28%] transition-transform duration-500 ">
            <ValueCard
              icon={<Network size={32} />}
              title={t.home.values.aiSupport.title}
              description={t.home.values.aiSupport.description}
              color="red"
              className=""
            />
          </div>

          {/* Card 4 */}
          <div className="absolute right-[15%] top-[58%] transition-transform duration-500 ">
            <ValueCard
              icon={<MessageCircle size={32} />}
              title={t.home.values.networking.title}
              description={t.home.values.networking.description}
              color="blue"
              className=""
            />
          </div>

          {/* Card 5 */}
          <div className="absolute right-[5%] top-[10%] transition-transform duration-500 ">
            <ValueCard
              icon={<Network size={32} />}
              title={t.home.values.reallife.title}
              description={t.home.values.reallife.description}
              color="blue"
              className=""
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:hidden">
          <ValueCard
            icon={<Play size={32} />}
            title={t.home.values.practice.title}
            description={t.home.values.practice.description}
            color="orange"
            className=""
          />

          <ValueCard
            icon={<Network size={32} />}
            title={t.home.values.aiSupport.title}
            description={t.home.values.aiSupport.description}
            color="red"
            className=""
          />

          <ValueCard
            icon={<Users size={32} />}
            title={t.home.values.networking.title}
            description={t.home.values.networking.description}
            color="blue"
            className=""
          />

          <ValueCard
            icon={<MessageCircle size={32} />}
            title={t.home.values.community.title}
            description={t.home.values.community.description}
            color="blue"
            className=""
          />

          {/* Card cuối */}
          <div className="col-span-2 flex justify-center">
            <ValueCard
              icon={<Network size={32} />}
              title={t.home.values.reallife.title}
              description={t.home.values.reallife.description}
              color="blue"
              className=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuesSection;
